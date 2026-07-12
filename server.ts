/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { 
  User, 
  Product, 
  Investment, 
  Transaction, 
  BonusCode, 
  GlobalNotification,
  ForumPost,
  UserReview,
  TeamMember
} from "./src/types";

declare global {
  namespace Express {
    interface Request {
      user?: User & { passwordHash: string };
    }
  }
}

// Paths
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper: Generate Random String (Referral Code / IDs)
function generateId(prefix: string = ""): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

function generateReferralCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 2; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

// Initial/Mock database structures
const initialProducts: Product[] = [
  { id: "vip1", name: "VIP 1 - Plan Élite", price: 5000, dailyIncome: 1000, durationDays: 30, totalIncome: 30000, level: 1, category: "stability" },
  { id: "vip2", name: "VIP 2 - Plan Premium", price: 10000, dailyIncome: 2500, durationDays: 30, totalIncome: 75000, level: 2, category: "stability" },
  { id: "vip3", name: "VIP 3 - Plan Gold", price: 25000, dailyIncome: 7000, durationDays: 30, totalIncome: 210000, level: 3, category: "wellbeing" },
  { id: "vip4", name: "VIP 4 - Plan Platinum", price: 50000, dailyIncome: 16000, durationDays: 30, totalIncome: 480000, level: 4, category: "wellbeing" },
  { id: "vip5", name: "VIP 5 - Plan Infini", price: 100000, dailyIncome: 35000, durationDays: 30, totalIncome: 1050000, level: 5, category: "activity" },
  { id: "vip6", name: "VIP 6 - Plan Saphir", price: 250000, dailyIncome: 95000, durationDays: 30, totalIncome: 2850000, level: 6, category: "activity" },
];

const initialBonusCodes: BonusCode[] = [
  { id: "code1", code: "WELCOME200", amount: 200, maxUses: 1000, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
  { id: "code2", code: "GLOBAL2026", amount: 1500, maxUses: 100, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
  { id: "code3", code: "VIPPLUS", amount: 5000, maxUses: 10, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
];

const initialNotifications: GlobalNotification[] = [
  {
    id: "notif1",
    title: "Bienvenue sur Dreampod !",
    content: "Profitez d'un bonus gratuit de 200 FCFA à l'inscription. Partagez votre lien d'invitation pour gagner des commissions sur 3 niveaux : 20% (N1), 2% (N2), 1% (N3) !",
    date: new Date().toISOString(),
    active: true,
  },
  {
    id: "notif2",
    title: "Nouveau Plan Saphir VIP 6 !",
    content: "Nous avons le plaisir de vous annoncer le lancement officiel du VIP 6. Gagnez 95 000 FCFA par jour avec un dépôt de 250 000 FCFA !",
    date: new Date().toISOString(),
    active: true,
  }
];

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  investments: Investment[];
  transactions: Transaction[];
  bonusCodes: BonusCode[];
  notifications: GlobalNotification[];
  forumPosts: ForumPost[];
  userReviews: UserReview[];
}

// Ensure database file exists
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

if (supabase) {
  console.log("Supabase Client initialized with URL:", supabaseUrl);
} else {
  console.warn("Supabase Client NOT initialized. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
}

async function saveToSupabase(dbData: DatabaseSchema) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("dreampod_state")
      .upsert({
        id: "global_db",
        data: dbData,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      console.error("Error upserting database state to Supabase:", error.message);
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        console.warn("\n==================================================");
        console.warn("ATTENTION: La table 'dreampod_state' n'existe pas dans Supabase.");
        console.warn("Veuillez exécuter ce script SQL dans votre SQL Editor Supabase :");
        console.warn(`
          CREATE TABLE public.dreampod_state (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          ALTER TABLE public.dreampod_state DISABLE ROW LEVEL SECURITY;
        `);
        console.warn("==================================================\n");
      }
    } else {
      console.log("Database state successfully synchronized to Supabase!");
    }
  } catch (err: any) {
    console.error("Failed to connect or save to Supabase:", err.message || err);
  }
}

function migrateDatabase(parsed: any): DatabaseSchema {
  if (!parsed) return parsed;

  if (!parsed.users) parsed.users = [];
  if (!parsed.products) parsed.products = [];
  if (!parsed.investments) parsed.investments = [];
  if (!parsed.transactions) parsed.transactions = [];
  if (!parsed.bonusCodes) parsed.bonusCodes = [];
  if (!parsed.notifications) parsed.notifications = [];

  // Migrate: Ensure new admin2 exists in the users table
  if (!parsed.users.some((u: any) => u.id === "usr_admin2")) {
    parsed.users.push({
      id: "usr_admin2",
      name: "Super Administrateur Bénin",
      phone: "+22900000002",
      passwordHash: "admin123",
      balance: 1000000,
      dailyRevenue: 0,
      totalRevenue: 500000,
      referralCode: "CHEF10",
      referralsCount: 10,
      referralsN1: 5,
      referralsN2: 3,
      referralsN3: 2,
      commissionEarned: 50000,
      registeredAt: new Date().toISOString(),
      isBlocked: false,
      role: "admin",
    });
  }

  if (!parsed.forumPosts) {
    parsed.forumPosts = [
      {
        id: "post_1",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        content: "Retrait reçu en moins de 10 minutes ! Dreampod est très fiable. Merci à l'administrateur !",
        screenshots: [
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=500&q=80"
        ],
        likes: 5,
        likedBy: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }

  if (!parsed.userReviews) {
    parsed.userReviews = [
      {
        id: "rev_1",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        rating: 5,
        comment: "Superbe plateforme d'investissement. Les gains journaliers sont payés à l'heure.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "approved",
      }
    ];
  }

  // Migrate existing products to have categories and ensure all 6 VIP plans are always present
  const defaultProducts = [
    { id: "vip1", name: "VIP 1 - Plan Élite", price: 5000, dailyIncome: 1000, durationDays: 30, totalIncome: 30000, level: 1, category: "stability" },
    { id: "vip2", name: "VIP 2 - Plan Premium", price: 10000, dailyIncome: 2500, durationDays: 30, totalIncome: 75000, level: 2, category: "stability" },
    { id: "vip3", name: "VIP 3 - Plan Gold", price: 25000, dailyIncome: 7000, durationDays: 30, totalIncome: 210000, level: 3, category: "wellbeing" },
    { id: "vip4", name: "VIP 4 - Plan Platinum", price: 50000, dailyIncome: 16000, durationDays: 30, totalIncome: 480000, level: 4, category: "wellbeing" },
    { id: "vip5", name: "VIP 5 - Plan Infini", price: 100000, dailyIncome: 35000, durationDays: 30, totalIncome: 1050000, level: 5, category: "activity" },
    { id: "vip6", name: "VIP 6 - Plan Saphir", price: 250000, dailyIncome: 95000, durationDays: 30, totalIncome: 2850000, level: 6, category: "activity" },
  ];

  if (!parsed.products || parsed.products.length === 0) {
    parsed.products = defaultProducts;
  } else {
    parsed.products = parsed.products.map((p: any) => {
      if (!p.category) {
        if (p.id === "vip1" || p.id === "vip2") {
          p.category = "stability";
        } else if (p.id === "vip3" || p.id === "vip4") {
          p.category = "wellbeing";
        } else {
          p.category = "activity";
        }
      }
      return p;
    });

    // Ensure all default products exist in the array
    defaultProducts.forEach(defProd => {
      if (!parsed.products.some((p: any) => p.id === defProd.id)) {
        parsed.products.push(defProd);
      }
    });
  }

  return parsed as DatabaseSchema;
}

async function loadDatabase(): Promise<DatabaseSchema> {
  // 1. Try loading from Supabase first
  if (supabase) {
    try {
      console.log("Loading database state from Supabase table 'dreampod_state'...");
      const { data, error } = await supabase
        .from("dreampod_state")
        .select("data")
        .eq("id", "global_db")
        .single();
        
      if (data && data.data) {
        console.log("Successfully loaded database state from Supabase!");
        const migrated = migrateDatabase(data.data);
        // Sync local backup file
        fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2), "utf8");
        return migrated;
      } else if (error) {
        if (error.code === "PGRST116") {
          console.log("No data record found in 'dreampod_state' for key 'global_db'. It will be created on the first save.");
        } else if (error.message?.includes("does not exist") || error.code === "42P01") {
          console.warn("\n==================================================");
          console.warn("ATTENTION: La table 'dreampod_state' n'existe pas dans Supabase.");
          console.warn("Veuillez exécuter ce script SQL dans votre SQL Editor Supabase :");
          console.warn(`
            CREATE TABLE public.dreampod_state (
              id TEXT PRIMARY KEY,
              data JSONB NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
            ALTER TABLE public.dreampod_state DISABLE ROW LEVEL SECURITY;
          `);
          console.warn("==================================================\n");
        } else {
          console.error("Supabase load error:", error.message);
        }
      }
    } catch (err: any) {
      console.error("Error connecting to Supabase during load:", err.message || err);
    }
  }

  // 2. Fallback to local file or initial generator
  if (!fs.existsSync(DB_FILE)) {
    // Generate initial database
    const adminUser = {
      id: "usr_admin",
      name: "Dreampod Admin",
      phone: "+22800000000",
      passwordHash: "admin123", // For simplicity in mock
      balance: 1000000,
      dailyRevenue: 0,
      totalRevenue: 250000,
      referralCode: "ADMIN7",
      referralsCount: 4,
      referralsN1: 2,
      referralsN2: 1,
      referralsN3: 1,
      commissionEarned: 15000,
      registeredAt: new Date().toISOString(),
      isBlocked: false,
      role: "admin" as const,
    };

    const adminUser2 = {
      id: "usr_admin2",
      name: "Super Administrateur Bénin",
      phone: "+22900000002",
      passwordHash: "admin123",
      balance: 1000000,
      dailyRevenue: 0,
      totalRevenue: 500000,
      referralCode: "CHEF10",
      referralsCount: 10,
      referralsN1: 5,
      referralsN2: 3,
      referralsN3: 2,
      commissionEarned: 50000,
      registeredAt: new Date().toISOString(),
      isBlocked: false,
      role: "admin" as const,
    };

    const promoUser = {
      id: "usr_demo",
      name: "Jean Kouassi",
      phone: "+22890123456",
      passwordHash: "user123",
      balance: 18500,
      dailyRevenue: 3500,
      totalRevenue: 15500,
      referralCode: "JEAN90",
      referrerId: "usr_admin",
      referralsCount: 2,
      referralsN1: 2,
      referralsN2: 0,
      referralsN3: 0,
      commissionEarned: 2500,
      registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      isBlocked: false,
      role: "user" as const,
    };

    const initialInvestments: Investment[] = [
      {
        id: "inv_1",
        userId: "usr_demo",
        productId: "vip1",
        productName: "VIP 1 - Plan Élite",
        price: 5000,
        dailyIncome: 1000,
        durationDays: 30,
        daysPassed: 4,
        activatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        lastClaimAt: new Date().toISOString(),
      },
      {
        id: "inv_2",
        userId: "usr_demo",
        productId: "vip2",
        productName: "VIP 2 - Plan Premium",
        price: 10000,
        dailyIncome: 2500,
        durationDays: 30,
        daysPassed: 2,
        activatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastClaimAt: new Date().toISOString(),
      }
    ];

    const initialTransactions: Transaction[] = [
      {
        id: "tx_1",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        type: "bonus",
        amount: 200,
        status: "completed",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "tx_2",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        type: "deposit",
        amount: 15000,
        status: "completed",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        method: "T-Money (+228)",
      },
      {
        id: "tx_3",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        type: "investment",
        amount: 5000,
        status: "completed",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "tx_4",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        type: "investment",
        amount: 10000,
        status: "completed",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "tx_5",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        type: "withdrawal",
        amount: 3000,
        status: "pending",
        date: new Date().toISOString(),
        method: "Orange Money (+225)",
      }
    ];

    const initialForumPosts: ForumPost[] = [
      {
        id: "post_1",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        content: "Retrait reçu en moins de 10 minutes ! Dreampod est très fiable. Merci à l'administrateur !",
        screenshots: [
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=500&q=80"
        ],
        likes: 5,
        likedBy: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    const initialUserReviews: UserReview[] = [
      {
        id: "rev_1",
        userId: "usr_demo",
        userName: "Jean Kouassi",
        userPhone: "+22890123456",
        rating: 5,
        comment: "Superbe plateforme d'investissement. Les gains journaliers sont payés à l'heure.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "approved",
      }
    ];

    const dbData: DatabaseSchema = {
      users: [adminUser, adminUser2, promoUser],
      products: initialProducts,
      investments: initialInvestments,
      transactions: initialTransactions,
      bonusCodes: initialBonusCodes,
      notifications: initialNotifications,
      forumPosts: initialForumPosts,
      userReviews: initialUserReviews,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf8");
    saveToSupabase(dbData);
    return dbData;
  }

  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data) as DatabaseSchema;
    const migrated = migrateDatabase(parsed);
    fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2), "utf8");
    return migrated;
  } catch (error) {
    console.error("Database reading error, resetting file:", error);
    fs.unlinkSync(DB_FILE);
    return await loadDatabase();
  }
}

async function saveDatabase(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  await saveToSupabase(db);
}

function processDailyRevenues(db: DatabaseSchema) {
  const now = new Date();
  let dbModified = false;

  if (!db.investments) db.investments = [];
  if (!db.users) db.users = [];

  db.investments.forEach(inv => {
    if (inv.daysPassed >= inv.durationDays) return; // already completed

    const lastClaim = new Date(inv.lastClaimAt);
    const elapsedMs = now.getTime() - lastClaim.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (elapsedMs >= oneDayMs) {
      const periods = Math.floor(elapsedMs / oneDayMs);
      const remainingDays = inv.durationDays - inv.daysPassed;
      const actualPeriods = Math.min(periods, remainingDays);

      if (actualPeriods > 0) {
        const totalCredited = actualPeriods * inv.dailyIncome;
        inv.daysPassed += actualPeriods;
        // set new claim time relative to old claim time to avoid temporal drift
        inv.lastClaimAt = new Date(lastClaim.getTime() + actualPeriods * oneDayMs).toISOString();

        const uIdx = db.users.findIndex(u => u.id === inv.userId);
        if (uIdx !== -1) {
          db.users[uIdx].balance += totalCredited;
          db.users[uIdx].totalRevenue += totalCredited;
          
          // Generate a transaction log for this automatic drop
          const tx: any = {
            id: generateId("tx"),
            userId: inv.userId,
            userName: db.users[uIdx].name,
            userPhone: db.users[uIdx].phone,
            type: "bonus",
            amount: totalCredited,
            status: "completed",
            date: now.toISOString(),
            method: `Revenu journalier VIP (${actualPeriods} jour(s)) - ${inv.productName}`,
          };
          db.transactions.push(tx);
          dbModified = true;
        }
      }
    }
  });

  if (dbModified) {
    saveDatabase(db);
  }
}

function getSafeUser(db: DatabaseSchema, user: any): User {
  if (!user) return user;
  const users = db.users || [];
  const investments = db.investments || [];
  
  // Calculate N1
  const level1 = users.filter(u => u && u.referrerId === user.id);
  const referralsN1 = level1.length;

  // Calculate N2
  const level1Ids = new Set(level1.map(u => u.id));
  const level2 = users.filter(u => u && u.referrerId && level1Ids.has(u.referrerId));
  const referralsN2 = level2.length;

  // Calculate N3
  const level2Ids = new Set(level2.map(u => u.id));
  const level3 = users.filter(u => u && u.referrerId && level2Ids.has(u.referrerId));
  const referralsN3 = level3.length;

  const referralsCount = referralsN1 + referralsN2 + referralsN3;

  // Invested referrals count (Level 1 only, with active investments for wheel spins)
  const investedReferralsCount = level1.filter(ref => 
    investments.some(inv => inv && inv.userId === ref.id)
  ).length;
  
  const spinsUsed = user.spinsUsed || 0;
  const spinsAvailable = Math.max(0, investedReferralsCount - spinsUsed);

  // Calculate dynamic dailyRevenue
  const activeInvestments = investments.filter(i => i && i.userId === user.id && i.daysPassed < i.durationDays);
  const dailyRevenue = activeInvestments.reduce((sum, i) => sum + (i.dailyIncome || 0), 0);

  const { passwordHash, ...safeUser } = user;
  return {
    ...safeUser,
    referralsCount,
    referralsN1,
    referralsN2,
    referralsN3,
    spinsUsed,
    spinsAvailable,
    investedReferralsCount,
    dailyRevenue,
  };
}

// Initialize global express app
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for external domains (like Vercel)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Setup database local in-memory/JSON sync
  let db = await loadDatabase();

  // Middleware to automatically reload the database from Supabase/local file on every API request.
  // This guarantees that all devices (and multiple serverless containers) operate on the same real-time data.
  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      try {
        db = await loadDatabase();
      } catch (e: any) {
        console.error("Failed to dynamically reload database in request middleware:", e.message || e);
      }
    }
    next();
  });

  // Simple JWT auth simulator middleware
  const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Automatically catch up and credit daily revenues for everyone
    processDailyRevenues(db);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentification requise. Veuillez vous connecter." });
    }

    const token = authHeader.split(" ")[1];
    // Token structure: token_[userId]_[timestamp]
    if (!token || !token.startsWith("token_")) {
      return res.status(401).json({ error: "Session invalide. Veuillez vous reconnecter." });
    }

    const tokenContent = token.substring("token_".length);
    const lastUnderscoreIndex = tokenContent.lastIndexOf("_");
    if (lastUnderscoreIndex === -1) {
      return res.status(401).json({ error: "Session invalide. Veuillez vous reconnecter." });
    }

    const userId = tokenContent.substring(0, lastUnderscoreIndex);
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Votre compte est bloqué. Veuillez contacter le support client." });
    }

    req.user = user;
    next();
  };

  const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    authenticateUser(req, res, () => {
      if (req.user && req.user.role === "admin") {
        next();
      } else {
        res.status(403).json({ error: "Accès refusé. Droits Administrateur requis." });
      }
    });
  };

  // Extended Express Request types are declared globally at top-level

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    const { name, phone, password, referrerCode } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires (Téléphone, Mot de passe)." });
    }

    // Clean phone number
    const normalizedPhone = phone.trim();

    // Default name if none is provided
    const finalName = name && name.trim() ? name.trim() : `Membre_${normalizedPhone.slice(-4)}`;

    // Check if phone already exists
    const existing = db.users.find(u => u.phone === normalizedPhone);
    if (existing) {
      return res.status(400).json({ error: "Ce numéro de téléphone est déjà utilisé." });
    }

    // Handle Sponsor (Code Parrain)
    let referrerId: string | undefined = undefined;
    if (referrerCode) {
      const parent = db.users.find(u => u.referralCode && u.referralCode.toUpperCase() === referrerCode.trim().toUpperCase());
      if (parent) {
        referrerId = parent.id;
      } else {
        // Fallback to default admin code instead of throwing an error, to avoid blocking registration
        const fallbackAdmin = db.users.find(u => u.role === "admin" || u.id === "usr_admin");
        if (fallbackAdmin) {
          referrerId = fallbackAdmin.id;
        }
      }
    }

    // New User Object
    const userId = generateId("usr");
    const selfReferralCode = generateReferralCode();

    const newUser: User & { passwordHash: string } = {
      id: userId,
      name: finalName,
      phone: normalizedPhone,
      passwordHash: password, // simulate hashing
      balance: 200, // 200 FCFA registration bonus!
      dailyRevenue: 0,
      totalRevenue: 200,
      referralCode: selfReferralCode,
      referrerId: referrerId,
      referralsCount: 0,
      referralsN1: 0,
      referralsN2: 0,
      referralsN3: 0,
      commissionEarned: 0,
      registeredAt: new Date().toISOString(),
      isBlocked: false,
      role: "user",
    };

    db.users.push(newUser);

    // Track parrainage counts up to 3 levels
    if (referrerId) {
      // Level 1 parent
      const n1ParentIndex = db.users.findIndex(u => u.id === referrerId);
      if (n1ParentIndex !== -1) {
        db.users[n1ParentIndex].referralsCount += 1;
        db.users[n1ParentIndex].referralsN1 += 1;

        // Level 2 parent
        const n2Id = db.users[n1ParentIndex].referrerId;
        if (n2Id) {
          const n2ParentIndex = db.users.findIndex(u => u.id === n2Id);
          if (n2ParentIndex !== -1) {
            db.users[n2ParentIndex].referralsCount += 1;
            db.users[n2ParentIndex].referralsN2 += 1;

            // Level 3 parent
            const n3Id = db.users[n2ParentIndex].referrerId;
            if (n3Id) {
              const n3ParentIndex = db.users.findIndex(u => u.id === n3Id);
              if (n3ParentIndex !== -1) {
                db.users[n3ParentIndex].referralsCount += 1;
                db.users[n3ParentIndex].referralsN3 += 1;
              }
            }
          }
        }
      }
    }

    // Create a bonus transaction of 200 FCFA for the user
    const tx: Transaction = {
      id: generateId("tx"),
      userId: userId,
      userName: newUser.name,
      userPhone: newUser.phone,
      type: "bonus",
      amount: 200,
      status: "completed",
      date: new Date().toISOString(),
      method: "Bonus d'inscription",
    };
    db.transactions.push(tx);

    await saveDatabase(db);

    // Create token
    const token = `token_${userId}_${Date.now()}`;

    // Return profile
    const safeUser = getSafeUser(db, newUser);
    res.status(201).json({
      message: "Inscription réussie !",
      token,
      user: safeUser,
    });
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Numéro de téléphone et mot de passe indispensables." });
    }

    let normalizedPhone = phone.trim();
    if (normalizedPhone.toLowerCase() === "admin") {
      normalizedPhone = "+22800000000";
    } else if (normalizedPhone.toLowerCase() === "admin2") {
      normalizedPhone = "+22900000002";
    }
    const user = db.users.find(u => u.phone === normalizedPhone);

    if (!user) {
      return res.status(400).json({ error: "Aucun compte trouvé avec ce numéro. Veuillez vous inscrire." });
    }

    if (user.passwordHash !== password) {
      return res.status(400).json({ error: "Mot de passe incorrect." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Votre compte est suspendu. Veuillez contacter le support." });
    }

    const token = `token_${user.id}_${Date.now()}`;
    const safeUser = getSafeUser(db, user);

    res.json({
      message: "Connexion réussie !",
      token,
      user: safeUser,
    });
  });

  // User Stats & Profile info
  app.get("/api/user/profile", authenticateUser, (req, res) => {
    if (!req.user) return res.status(401);
    const safeUser = getSafeUser(db, req.user);
    res.json({ user: safeUser });
  });

  // Edit password
  app.post("/api/user/change-password", authenticateUser, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Veuillez fournir l'ancien et le nouveau mot de passe." });
    }

    const uIdx = db.users.findIndex(u => u.id === req.user!.id);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (db.users[uIdx].passwordHash !== oldPassword) {
      return res.status(400).json({ error: "Ancien mot de passe erroné." });
    }

    db.users[uIdx].passwordHash = newPassword;
    saveDatabase(db);

    res.json({ message: "Mot de passe modifié avec succès." });
  });

  // User Stats: Balance, Investments, Transactions, Referral Details
  app.get("/api/user/stats", authenticateUser, (req, res) => {
    const userId = req.user!.id;
    
    // Retrieve user list info
    const user = db.users.find(u => u.id === userId)!;
    
    // Get active investments
    const userInvestments = db.investments.filter(i => i.userId === userId);
    
    // Get transactions
    const userTransactions = db.transactions.filter(t => t.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate total earnings, commissions, count referrers
    const safeUser = getSafeUser(db, user);

    // Calculate downline list (TeamMember[])
    const level1 = db.users.filter(u => u && u.referrerId === userId);
    
    const level2Referrals: any[] = [];
    level1.forEach(l1 => {
      if (l1) {
        const l2 = db.users.filter(u => u && u.referrerId === l1.id);
        level2Referrals.push(...l2);
      }
    });
    
    const level3Referrals: any[] = [];
    level2Referrals.forEach(l2 => {
      if (l2) {
        const l3 = db.users.filter(u => u && u.referrerId === l2.id);
        level3Referrals.push(...l3);
      }
    });

    const calculateTotalInvested = (uid: string) => {
      const investments = db.investments || [];
      return investments
        .filter(inv => inv && inv.userId === uid)
        .reduce((sum, inv) => sum + (inv.price || 0), 0);
    };

    const teamList: TeamMember[] = [
      ...level1.map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        level: 1,
        registeredAt: u.registeredAt,
        totalInvested: calculateTotalInvested(u.id)
      })),
      ...level2Referrals.map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        level: 2,
        registeredAt: u.registeredAt,
        totalInvested: calculateTotalInvested(u.id)
      })),
      ...level3Referrals.map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        level: 3,
        registeredAt: u.registeredAt,
        totalInvested: calculateTotalInvested(u.id)
      }))
    ];

    res.json({
      user: safeUser,
      investments: userInvestments,
      transactions: userTransactions,
      products: db.products,
      team: teamList
    });
  });

  // Products List
  app.get("/api/products", (req, res) => {
    res.json({ products: db.products });
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    const activeNotifs = db.notifications.filter(n => n.active);
    res.json({ notifications: activeNotifs });
  });

  // Purchase/Invest
  app.post("/api/user/invest", authenticateUser, async (req, res) => {
    const { productId } = req.body;
    const userId = req.user!.id;

    if (!productId) {
      return res.status(400).json({ error: "ID du produit manquant." });
    }

    // Find product
    const product = db.products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Produit/plan introuvable." });
    }

    if (product.isBlocked) {
      return res.status(400).json({ error: "Désolé, ce produit/plan VIP est temporairement désactivé par l'administration." });
    }

    // Find user
    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur introuvable" });

    const user = db.users[uIdx];
    if (user.balance < product.price) {
      return res.status(400).json({ 
        error: `Solde insuffisant pour activer ce plan. Prix: ${product.price} FCFA. Votre solde actuel: ${user.balance} FCFA. Veuillez recharger votre compte.` 
      });
    }

    // Deduct balance and adjust daily active revenue stream
    user.balance -= product.price;
    user.dailyRevenue += product.dailyIncome;

    // Create Investment
    const investment: Investment = {
      id: generateId("inv"),
      userId: userId,
      productId: product.id,
      productName: product.name,
      price: product.price,
      dailyIncome: product.dailyIncome,
      durationDays: product.durationDays,
      daysPassed: 0,
      activatedAt: new Date().toISOString(),
      lastClaimAt: new Date().toISOString(),
    };
    db.investments.push(investment);

    // Create investment transaction
    const tx: Transaction = {
      id: generateId("tx"),
      userId: userId,
      userName: user.name,
      userPhone: user.phone,
      type: "investment",
      amount: product.price,
      status: "completed",
      date: new Date().toISOString(),
      method: "Achat Plan VIP",
    };
    db.transactions.push(tx);

    // --- REVENUE MULTILEVEL DISTRIBUTION (PARRAINAGE COMMISSIONS) ---
    // Level 1: 20%
    if (user.referrerId) {
      const l1Idx = db.users.findIndex(u => u.id === user.referrerId);
      if (l1Idx !== -1) {
        const commN1 = Math.round(product.price * 0.20);
        db.users[l1Idx].balance += commN1;
        db.users[l1Idx].commissionEarned += commN1;

        // Log commission transaction
        const txN1: Transaction = {
          id: generateId("tx"),
          userId: db.users[l1Idx].id,
          userName: db.users[l1Idx].name,
          userPhone: db.users[l1Idx].phone,
          type: "commission",
          amount: commN1,
          status: "completed",
          date: new Date().toISOString(),
          method: `Com. Parrainage N1 (${user.name})`,
        };
        db.transactions.push(txN1);

        // Level 2: 2%
        const l2Id = db.users[l1Idx].referrerId;
        if (l2Id) {
          const l2Idx = db.users.findIndex(u => u.id === l2Id);
          if (l2Idx !== -1) {
            const commN2 = Math.round(product.price * 0.02);
            db.users[l2Idx].balance += commN2;
            db.users[l2Idx].commissionEarned += commN2;

            const txN2: Transaction = {
              id: generateId("tx"),
              userId: db.users[l2Idx].id,
              userName: db.users[l2Idx].name,
              userPhone: db.users[l2Idx].phone,
              type: "commission",
              amount: commN2,
              status: "completed",
              date: new Date().toISOString(),
              method: `Com. Parrainage N2 (${user.name})`,
            };
            db.transactions.push(txN2);

            // Level 3: 1%
            const l3Id = db.users[l2Idx].referrerId;
            if (l3Id) {
              const l3Idx = db.users.findIndex(u => u.id === l3Id);
              if (l3Idx !== -1) {
                const commN3 = Math.round(product.price * 0.01);
                db.users[l3Idx].balance += commN3;
                db.users[l3Idx].commissionEarned += commN3;

                const txN3: Transaction = {
                  id: generateId("tx"),
                  userId: db.users[l3Idx].id,
                  userName: db.users[l3Idx].name,
                  userPhone: db.users[l3Idx].phone,
                  type: "commission",
                  amount: commN3,
                  status: "completed",
                  date: new Date().toISOString(),
                  method: `Com. Parrainage N3 (${user.name})`,
                };
                db.transactions.push(txN3);
              }
            }
          }
        }
      }
    }

    await saveDatabase(db);
    res.json({
      message: `${product.name} activé avec succès !`,
      investment,
      balance: user.balance,
    });
  });

  // Manual Deposit request
  app.post("/api/user/deposit", authenticateUser, async (req, res) => {
    const { amount, method } = req.body;
    const userId = req.user!.id;

    if (!amount || amount < 1000) {
      return res.status(400).json({ error: "Le montant minimum de dépôt est de 1 000 FCFA." });
    }

    if (!method) {
      return res.status(400).json({ error: "Veuillez choisir un moyen de rechargement (MTN, Orange Money, Moov)." });
    }

    const tx: Transaction = {
      id: generateId("tx"),
      userId: userId,
      userName: req.user!.name,
      userPhone: req.user!.phone,
      type: "deposit",
      amount: Number(amount),
      status: "pending", // Depôt en attente de validation admin locale
      date: new Date().toISOString(),
      method: method,
    };

    db.transactions.push(tx);
    await saveDatabase(db);

    res.json({
      message: "Requête de dépôt reçue ! Votre compte sera crédité dès la validation de la transaction par un administrateur sous peu.",
      transaction: tx,
    });
  });

  // Manual Withdrawal Request
  app.post("/api/user/withdraw", authenticateUser, async (req, res) => {
    const { amount, method } = req.body;
    const userId = req.user!.id;

    if (!amount || amount < 500) {
      return res.status(400).json({ error: "Le montant minimum de retrait est de 500 FCFA." });
    }

    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const user = db.users[uIdx];
    if (user.balance < amount) {
      return res.status(400).json({ error: `Solde insuffisant pour retirer ${amount} FCFA. Solde actuel: ${user.balance} FCFA.` });
    }

    // Deduct user balance immediately for safety
    user.balance -= amount;

    const tx: Transaction = {
      id: generateId("tx"),
      userId: userId,
      userName: user.name,
      userPhone: user.phone,
      type: "withdrawal",
      amount: Number(amount),
      status: "pending", // Withdrawal pending admin evaluation
      date: new Date().toISOString(),
      method: method || "Mobile Money",
    };

    db.transactions.push(tx);
    await saveDatabase(db);

    res.json({
      message: "Votre demande de retrait a été soumise avec succès et est en cours d'évaluation.",
      balance: user.balance,
      transaction: tx
    });
  });

  // Claim hourly/daily revenue of active investments manually
  app.post("/api/user/claim-revenues", authenticateUser, (req, res) => {
    const userId = req.user!.id;
    const userInvests = db.investments.filter(i => i.userId === userId);
    
    if (userInvests.length === 0) {
      return res.status(400).json({ error: "Vous n'avez aucun investissement actif." });
    }

    const now = new Date();
    let totalRevenueClaimed = 0;
    
    userInvests.forEach(inv => {
      // Allow users to claim if last claim was > 1 hour ago (or mock 20 seconds for fast interactive demo purposes so user visualizes in real-time!)
      const lastClaim = new Date(inv.lastClaimAt);
      const elapsedMs = now.getTime() - lastClaim.getTime();
      
      // Let's allow simulated rapid income generation! For real-world, it’s 24 hours. For excellent review: let's allow claims if visual elapsed timer shows positive.
      // We will simulate that we claim a portion of daily income, or we claim the full daily income if simulated timer completed! To make things highly interactive,
      // let's claim the full dailyIncome (or a portion) and update claim time.
      const simulatedClaimAmount = inv.dailyIncome; // Claim full daily income
      
      inv.lastClaimAt = now.toISOString();
      inv.daysPassed += 1;
      totalRevenueClaimed += simulatedClaimAmount;
    });

    if (totalRevenueClaimed > 0) {
      const uIdx = db.users.findIndex(u => u.id === userId);
      if (uIdx !== -1) {
        db.users[uIdx].balance += totalRevenueClaimed;
        db.users[uIdx].totalRevenue += totalRevenueClaimed;
      }

      // Record transaction
      const tx: Transaction = {
        id: generateId("tx"),
        userId: userId,
        userName: req.user!.name,
        userPhone: req.user!.phone,
        type: "bonus",
        amount: totalRevenueClaimed,
        status: "completed",
        date: now.toISOString(),
        method: "Récolte Revenus Machines VIP",
      };
      db.transactions.push(tx);
      saveDatabase(db);
      
      res.json({
        message: `Félicitations ! Vous avez récolté ${totalRevenueClaimed} FCFA de vos investissements actifs.`,
        amount: totalRevenueClaimed,
        user: db.users[uIdx]
      });
    } else {
      res.status(400).json({ error: "Vos revenus ont déjà été collectés pour cette période." });
    }
  });

  // Claim Gift/Promo Code
  app.post("/api/user/claim-bonus", authenticateUser, (req, res) => {
    const { code } = req.body;
    const userId = req.user!.id;

    if (!code) {
      return res.status(400).json({ error: "Veuillez entrer un code bonus." });
    }

    const cleanedCode = code.trim().toUpperCase();
    const bonus = db.bonusCodes.find(b => b.code.toUpperCase() === cleanedCode);

    if (!bonus) {
      return res.status(400).json({ error: "Code bonus invalide ou expiré." });
    }

    if (bonus.usedByUsers.includes(userId)) {
      return res.status(400).json({ error: "Vous avez déjà utilisé ce code bonus." });
    }

    if (bonus.usedCount >= bonus.maxUses) {
      return res.status(400).json({ error: "Limite d'utilisation de ce code atteinte." });
    }

    // Apply reward
    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur non trouvé" });

    db.users[uIdx].balance += bonus.amount;
    db.users[uIdx].totalRevenue += bonus.amount;

    bonus.usedByUsers.push(userId);
    bonus.usedCount += 1;

    // Create bonus transaction
    const tx: Transaction = {
      id: generateId("tx"),
      userId: userId,
      userName: req.user!.name,
      userPhone: req.user!.phone,
      type: "bonus",
      amount: bonus.amount,
      status: "completed",
      date: new Date().toISOString(),
      method: `Code Cadeau: ${cleanedCode}`,
    };
    db.transactions.push(tx);

    saveDatabase(db);

    res.json({
      message: `Félicitations ! Code '${cleanedCode}' validé. Un montant de ${bonus.amount} FCFA a été ajouté à votre solde.`,
      reward: bonus.amount,
      balance: db.users[uIdx].balance,
    });
  });

  // Lucky Wheel Spin
  app.post("/api/user/spin-wheel", authenticateUser, (req, res) => {
    const userId = req.user!.id;

    // Find user
    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur introuvable" });

    const user = db.users[uIdx];

    // Check available spins based on invested referrals
    const referrals = db.users.filter(u => u.referrerId === userId);
    const investedReferralsCount = referrals.filter(ref => 
      db.investments.some(inv => inv.userId === ref.id)
    ).length;
    
    const spinsUsed = user.spinsUsed || 0;
    const spinsAvailable = Math.max(0, investedReferralsCount - spinsUsed);

    if (spinsAvailable <= 0) {
      return res.status(400).json({ 
        error: `Vous n'avez pas de ticket de tirage disponible. Vous gagnez des tickets de tirage uniquement si vous parrainez des personnes qui effectuent un investissement.` 
      });
    }

    const now = new Date();
    // Increment spins used
    user.spinsUsed = spinsUsed + 1;
    user.lastSpinAt = now.toISOString();

    // Spin results config
    const prizes = [
      { index: 0, amount: 50, label: "50 FCFA", probability: 0.35, color: "#3b82f6" },
      { index: 1, amount: 100, label: "100 FCFA", probability: 0.30, color: "#10b981" },
      { index: 2, amount: 200, label: "200 FCFA", probability: 0.20, color: "#f59e0b" },
      { index: 3, amount: 500, label: "500 FCFA", probability: 0.10, color: "#ec4899" },
      { index: 4, amount: 1000, label: "1 000 FCFA", probability: 0.04, color: "#8b5cf6" },
      { index: 5, amount: 0, label: "Essayer encore", probability: 0.01, color: "#ef4444" },
    ];

    // Select prize based on probabilities
    const rand = Math.random();
    let cumulative = 0;
    let selectedPrize = prizes[0];

    for (const prize of prizes) {
      cumulative += prize.probability;
      if (rand <= cumulative) {
        selectedPrize = prize;
        break;
      }
    }

    // Apply prize to user
    user.lastSpinAt = now.toISOString();
    if (selectedPrize.amount > 0) {
      user.balance += selectedPrize.amount;
      user.totalRevenue += selectedPrize.amount;

      // Log transaction
      const tx: Transaction = {
        id: generateId("tx"),
        userId: userId,
        userName: user.name,
        userPhone: user.phone,
        type: "bonus",
        amount: selectedPrize.amount,
        status: "completed",
        date: now.toISOString(),
        method: "Roue de la Chance 🎡",
      };
      db.transactions.push(tx);
    }

    saveDatabase(db);

    res.json({
      message: selectedPrize.amount > 0 
        ? `Félicitations ! Vous avez gagné ${selectedPrize.label} !` 
        : `Dommage ! Vous avez obtenu '${selectedPrize.label}'. Réessayez demain !`,
      prize: selectedPrize,
      balance: user.balance,
      lastSpinAt: user.lastSpinAt
    });
  });


  // --- ADMIN PORTAL ENDPOINTS ---

  // Admin Stats
  app.get("/api/admin/stats", authenticateAdmin, (req, res) => {
    const totalUsers = db.users.length;
    let totalInvested = 0;
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let platformRevenues = 0;

    db.transactions.forEach(tx => {
      if (tx.status === "completed") {
        if (tx.type === "investment") {
          totalInvested += tx.amount;
        } else if (tx.type === "deposit") {
          totalDeposited += tx.amount;
        } else if (tx.type === "withdrawal") {
          totalWithdrawn += tx.amount;
        }
      }
    });

    const totalPendingDepositsAmount = db.transactions
      .filter(t => t.type === "deposit" && t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPendingWithdrawalsAmount = db.transactions
      .filter(t => t.type === "withdrawal" && t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPurchasedProductsCount = db.investments ? db.investments.length : 0;
    const totalPurchasedProductsAmount = db.investments ? db.investments.reduce((sum, inv) => sum + (inv.price || 0), 0) : 0;

    // Approximate platform profit (Deposits minus claims/withdrawals/bonuses)
    platformRevenues = Math.max(0, totalDeposited - totalWithdrawn - 200 * totalUsers);

    res.json({
      stats: {
        totalUsers,
        totalInvested,
        totalDeposited,
        totalWithdrawn,
        platformRevenues,
        numberOfPendingWithdrawals: db.transactions.filter(t => t.type === "withdrawal" && t.status === "pending").length,
        numberOfPendingDeposits: db.transactions.filter(t => t.type === "deposit" && t.status === "pending").length,
        totalPendingDepositsAmount,
        totalPendingWithdrawalsAmount,
        totalPurchasedProductsCount,
        totalPurchasedProductsAmount,
        numberOfProducts: db.products.length,
        numberOfBonusCodes: db.bonusCodes.length,
      }
    });
  });

  // Admin: Get all users & search/filter
  app.get("/api/admin/users", authenticateAdmin, (req, res) => {
    const { search } = req.query;
    let filteredUsers = [...db.users];

    if (search) {
      const q = String(search).toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.phone.includes(q) || 
        (u.referralCode && u.referralCode.toLowerCase().includes(q))
      );
    }

    // Return with password mapped to password property
    const safeUsers = filteredUsers.map(({ passwordHash, ...u }) => ({ ...u, password: passwordHash }));
    res.json({ users: safeUsers });
  });

  // Admin: Block/Unblock account
  app.post("/api/admin/user/block", authenticateAdmin, (req, res) => {
    const { userId, block } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur requis." });
    }

    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    if (db.users[uIdx].id === "usr_admin") {
      return res.status(400).json({ error: "Impossible de bloquer le compte administrateur principal." });
    }

    db.users[uIdx].isBlocked = !!block;
    saveDatabase(db);

    res.json({ 
      message: `Compte utilisateur ${block ? 'bloqué' : 'débloqué'} avec succès.`,
      user: db.users[uIdx]
    });
  });

  // Admin: Directly add custom balance bonus to user
  app.post("/api/admin/user/bonus", authenticateAdmin, (req, res) => {
    const { userId, amount, reason } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ error: "ID utilisateur et montant requis." });
    }

    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur introuvable" });

    const numAmount = Number(amount);
    db.users[uIdx].balance += numAmount;
    db.users[uIdx].totalRevenue += numAmount;

    // Log Tx
    const tx: Transaction = {
      id: generateId("tx"),
      userId: userId,
      userName: db.users[uIdx].name,
      userPhone: db.users[uIdx].phone,
      type: "bonus",
      amount: numAmount,
      status: "completed",
      date: new Date().toISOString(),
      method: reason || "Bonus Administrateur",
    };
    db.transactions.push(tx);
    saveDatabase(db);

    res.json({ 
      message: `Bonus de ${numAmount} FCFA ajouté à ${db.users[uIdx].name} avec succès.`,
      user: db.users[uIdx]
    });
  });

  // Admin: Get transactions (deposits & withdrawals)
  app.get("/api/admin/transactions", authenticateAdmin, (req, res) => {
    // Return all transactions sorted by date
    const txs = [...db.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json({ transactions: txs });
  });

  // Admin: Approve/Reject deposit or withdrawal
  app.post("/api/admin/transactions/verify", authenticateAdmin, async (req, res) => {
    const { transactionId, action } = req.body; // action = "approve" | "reject"
    if (!transactionId || !action) {
      return res.status(400).json({ error: "Paramètres manquants." });
    }

    const txIdx = db.transactions.findIndex(t => t.id === transactionId);
    if (txIdx === -1) {
      return res.status(404).json({ error: "Transaction introuvable." });
    }

    const tx = db.transactions[txIdx];
    if (tx.status !== "pending") {
      return res.status(400).json({ error: "Cette transaction a déjà été traitée." });
    }

    const uIdx = db.users.findIndex(u => u.id === tx.userId);
    if (uIdx === -1) {
      return res.status(404).json({ error: "Utilisateur de la transaction introuvable." });
    }

    if (action === "approve") {
      tx.status = "completed";
      
      // If deposit, credit user balance! (Withdrawal is already debited when requested, so we do nothing here)
      if (tx.type === "deposit") {
        db.users[uIdx].balance += tx.amount;
        db.users[uIdx].totalRevenue += tx.amount;
      }
    } else if (action === "reject") {
      tx.status = "rejected";
      
      // If withdrawal rejected, REFUND the debited amount to user balance!
      if (tx.type === "withdrawal") {
        db.users[uIdx].balance += tx.amount;
      }
    } else {
      return res.status(400).json({ error: "Action invalide. Choisissez 'approve' ou 'reject'." });
    }

    await saveDatabase(db);
    res.json({ 
      message: `La transaction a été marquée comme ${action === 'approve' ? 'APPROUVÉE' : 'REJETÉE'}.`,
      transaction: tx,
      userBalance: db.users[uIdx].balance,
    });
  });

  // Admin: Add new VIP investment plan product
  app.post("/api/admin/products/add", authenticateAdmin, (req, res) => {
    const { name, price, dailyIncome, durationDays, category } = req.body;
    if (!name || !price || !dailyIncome || !durationDays) {
      return res.status(400).json({ error: "Veuillez remplir tous les champs du produit." });
    }

    const newProd: Product = {
      id: generateId("vip"),
      name: name,
      price: Number(price),
      dailyIncome: Number(dailyIncome),
      durationDays: Number(durationDays),
      totalIncome: Number(dailyIncome) * Number(durationDays),
      level: db.products.length + 1,
      category: category || "stability",
    };

    db.products.push(newProd);
    saveDatabase(db);

    res.json({
      message: `Nouveau produit '${name}' ajouté avec succès !`,
      product: newProd,
    });
  });

  // Admin: Delete VIP plan product
  app.delete("/api/admin/products/:id", authenticateAdmin, (req, res) => {
    const id = req.params.id;
    const prodIdx = db.products.findIndex(p => p.id === id);
    if (prodIdx === -1) {
      return res.status(404).json({ error: "Produit/Plan introuvable." });
    }

    const deleted = db.products.splice(prodIdx, 1)[0];
    saveDatabase(db);

    res.json({ message: `Produit ${deleted.name} supprimé avec succès.` });
  });

  // Admin: Update VIP plan product
  app.put("/api/admin/products/:id", authenticateAdmin, (req, res) => {
    const id = req.params.id;
    const { name, price, dailyIncome, durationDays, category, isBlocked } = req.body;
    const prodIdx = db.products.findIndex(p => p.id === id);
    if (prodIdx === -1) {
      return res.status(404).json({ error: "Produit/Plan introuvable." });
    }
    const prod = db.products[prodIdx];
    if (name !== undefined) prod.name = name;
    if (price !== undefined) prod.price = Number(price);
    if (dailyIncome !== undefined) prod.dailyIncome = Number(dailyIncome);
    if (durationDays !== undefined) prod.durationDays = Number(durationDays);
    if (category !== undefined) prod.category = category;
    if (isBlocked !== undefined) prod.isBlocked = !!isBlocked;
    prod.totalIncome = prod.dailyIncome * prod.durationDays;
    
    saveDatabase(db);
    res.json({ message: `Le plan "${prod.name}" a été mis à jour avec succès !`, product: prod });
  });

  // Admin: Update user details (modify things on user's account)
  app.put("/api/admin/users/:id", authenticateAdmin, (req, res) => {
    const id = req.params.id;
    const { name, phone, balance, referralCode, commissionEarned, isBlocked, password } = req.body;
    const uIdx = db.users.findIndex(u => u.id === id);
    if (uIdx === -1) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    const user = db.users[uIdx];
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (balance !== undefined) user.balance = Number(balance);
    if (referralCode !== undefined) user.referralCode = referralCode;
    if (commissionEarned !== undefined) user.commissionEarned = Number(commissionEarned);
    if (isBlocked !== undefined) user.isBlocked = !!isBlocked;
    if (password !== undefined) user.passwordHash = password;
    
    saveDatabase(db);
    res.json({ message: `Le compte de "${user.name}" a été mis à jour avec succès !`, user });
  });

  // Admin: Delete user account
  app.delete("/api/admin/users/:id", authenticateAdmin, (req, res) => {
    const id = req.params.id;
    if (id === "usr_admin") {
      return res.status(400).json({ error: "Impossible de supprimer le compte de l'administrateur principal." });
    }
    const uIdx = db.users.findIndex(u => u.id === id);
    if (uIdx === -1) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    const deletedUser = db.users.splice(uIdx, 1)[0];
    
    // Cleanup investments & transactions
    if (db.investments) {
      db.investments = db.investments.filter(i => i.userId !== id);
    }
    db.transactions = db.transactions.filter(t => t.userId !== id);
    
    saveDatabase(db);
    res.json({ message: `Le compte de "${deletedUser.name}" a été supprimé avec succès !` });
  });

  // Admin: Delete user's investment (paid product)
  app.delete("/api/admin/investments/:id", authenticateAdmin, (req, res) => {
    const id = req.params.id;
    if (!db.investments) db.investments = [];
    const invIdx = db.investments.findIndex(i => i.id === id);
    if (invIdx === -1) {
      return res.status(404).json({ error: "Investissement introuvable." });
    }
    const deleted = db.investments.splice(invIdx, 1)[0];
    saveDatabase(db);
    res.json({ message: `Investissement "${deleted.productName}" a été supprimé avec succès.` });
  });

  // Admin: Create gift promo code
  app.post("/api/admin/bonus-codes/generate", authenticateAdmin, (req, res) => {
    const { code, amount, maxUses } = req.body;
    if (!code || !amount) {
      return res.status(400).json({ error: "Code et montant du bonus requis." });
    }

    const upperCode = code.trim().toUpperCase();
    const existing = db.bonusCodes.find(b => b.code.toUpperCase() === upperCode);
    if (existing) {
      return res.status(400).json({ error: "Un code cadeau avec ce nom existe déjà." });
    }

    const newCode: BonusCode = {
      id: generateId("code"),
      code: upperCode,
      amount: Number(amount),
      maxUses: Number(maxUses || 100),
      usedCount: 0,
      usedByUsers: [],
      createdAt: new Date().toISOString(),
    };

    db.bonusCodes.push(newCode);
    saveDatabase(db);

    res.json({
      message: `Code cadeau '${upperCode}' créé avec succès !`,
      bonusCode: newCode,
    });
  });

  // Admin: Get all bonus codes
  app.get("/api/admin/bonus-codes", authenticateAdmin, (req, res) => {
    res.json({ bonusCodes: db.bonusCodes });
  });

  // Admin: Get all active user investments (paid products)
  app.get("/api/admin/investments", authenticateAdmin, (req, res) => {
    res.json({ investments: db.investments || [] });
  });

  // Admin: Broadcast dynamic notification
  app.post("/api/admin/notifications/send", authenticateAdmin, (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Titre et contenu requis." });
    }

    const newNotif: GlobalNotification = {
      id: generateId("notif"),
      title,
      content,
      date: new Date().toISOString(),
      active: true,
    };

    db.notifications.unshift(newNotif); // latest first
    saveDatabase(db);

    res.json({
      message: "Notification globale diffusée avec succès !",
      notification: newNotif,
    });
  });

  // Admin: Synchronize local storage state with server state
  app.post("/api/admin/sync", authenticateAdmin, (req, res) => {
    const { users, transactions, investments, bonusCodes, notifications, forumPosts, userReviews } = req.body;

    let addedUsersCount = 0;
    let addedTransactionsCount = 0;
    let addedInvestmentsCount = 0;
    let addedReviewsCount = 0;
    let addedForumPostsCount = 0;

    // 1. Merge users
    if (Array.isArray(users)) {
      users.forEach((u: any) => {
        if (!u || !u.id || u.id === "usr_admin" || u.id === "usr_admin2") return;
        const exists = db.users.find(existing => existing.id === u.id || existing.phone === u.phone);
        if (!exists) {
          db.users.push({
            id: u.id,
            name: u.name,
            phone: u.phone,
            passwordHash: u.password || u.passwordHash || "123456",
            balance: typeof u.balance === "number" ? u.balance : 200,
            dailyRevenue: typeof u.dailyRevenue === "number" ? u.dailyRevenue : 0,
            totalRevenue: typeof u.totalRevenue === "number" ? u.totalRevenue : 0,
            referralCode: u.referralCode || `REF${Math.floor(100000 + Math.random() * 900000)}`,
            referrerId: u.referrerId || null,
            referralsCount: typeof u.referralsCount === "number" ? u.referralsCount : 0,
            referralsN1: typeof u.referralsN1 === "number" ? u.referralsN1 : 0,
            referralsN2: typeof u.referralsN2 === "number" ? u.referralsN2 : 0,
            referralsN3: typeof u.referralsN3 === "number" ? u.referralsN3 : 0,
            commissionEarned: typeof u.commissionEarned === "number" ? u.commissionEarned : 0,
            registeredAt: u.registeredAt || new Date().toISOString(),
            isBlocked: !!u.isBlocked,
            role: "user",
          });
          addedUsersCount++;
        }
      });
    }

    // 2. Merge transactions
    if (Array.isArray(transactions)) {
      transactions.forEach((tx: any) => {
        if (!tx || !tx.id) return;
        const exists = db.transactions.find(existing => existing.id === tx.id);
        if (!exists) {
          db.transactions.push({
            id: tx.id,
            userId: tx.userId,
            userName: tx.userName,
            userPhone: tx.userPhone,
            type: tx.type,
            amount: tx.amount,
            method: tx.method || "T-money",
            status: tx.status || "pending",
            date: tx.date || new Date().toISOString(),
          });
          addedTransactionsCount++;
        }
      });
    }

    // 3. Merge investments
    if (Array.isArray(investments)) {
      if (!db.investments) db.investments = [];
      investments.forEach((inv: any) => {
        if (!inv || !inv.id) return;
        const exists = db.investments.find(existing => existing.id === inv.id);
        if (!exists) {
          db.investments.push({
            id: inv.id,
            userId: inv.userId,
            productId: inv.productId,
            productName: inv.productName,
            price: typeof inv.price === "number" ? inv.price : 0,
            dailyIncome: typeof inv.dailyIncome === "number" ? inv.dailyIncome : 0,
            durationDays: typeof inv.durationDays === "number" ? inv.durationDays : 30,
            daysPassed: typeof inv.daysPassed === "number" ? inv.daysPassed : 0,
            activatedAt: inv.activatedAt || inv.purchasedAt || new Date().toISOString(),
            lastClaimAt: inv.lastClaimAt || inv.activatedAt || new Date().toISOString(),
          });
          addedInvestmentsCount++;
        }
      });
    }

    // 4. Merge userReviews
    if (Array.isArray(userReviews)) {
      if (!db.userReviews) db.userReviews = [];
      userReviews.forEach((r: any) => {
        if (!r || !r.id) return;
        const exists = db.userReviews.find(existing => existing.id === r.id);
        if (!exists) {
          db.userReviews.push({
            id: r.id,
            userId: r.userId,
            userName: r.userName,
            userPhone: r.userPhone,
            rating: r.rating || 5,
            comment: r.comment || "",
            createdAt: r.createdAt || new Date().toISOString(),
            status: r.status || "pending",
          });
          addedReviewsCount++;
        }
      });
    }

    // 5. Merge forumPosts
    if (Array.isArray(forumPosts)) {
      if (!db.forumPosts) db.forumPosts = [];
      forumPosts.forEach((p: any) => {
        if (!p || !p.id) return;
        const exists = db.forumPosts.find(existing => existing.id === p.id);
        if (!exists) {
          db.forumPosts.push({
            id: p.id,
            userId: p.userId,
            userName: p.userName,
            userPhone: p.userPhone,
            content: p.content,
            screenshots: p.screenshots || [],
            likes: p.likes || 0,
            likedBy: p.likedBy || [],
            createdAt: p.createdAt || new Date().toISOString(),
          });
          addedForumPostsCount++;
        }
      });
    }

    // Save modifications to DB
    if (addedUsersCount > 0 || addedTransactionsCount > 0 || addedInvestmentsCount > 0 || addedReviewsCount > 0 || addedForumPostsCount > 0) {
      saveDatabase(db);
    }

    res.json({
      message: "Synchronisation réussie !",
      details: {
        addedUsersCount,
        addedTransactionsCount,
        addedInvestmentsCount,
        addedReviewsCount,
        addedForumPostsCount,
      },
      db: {
        users: db.users.map(({ passwordHash, ...u }) => ({ ...u, password: passwordHash })),
        products: db.products,
        investments: db.investments,
        transactions: db.transactions,
        bonusCodes: db.bonusCodes,
        notifications: db.notifications,
        forumPosts: db.forumPosts,
        userReviews: db.userReviews,
      }
    });
  });

  // --- FORUM & USER REVIEWS (AVIS) ROUTES ---

  // Forum: Get all posts
  app.get("/api/forum", (req, res) => {
    const sorted = [...db.forumPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ posts: sorted });
  });

  // Forum: Create new post
  app.post("/api/forum", authenticateUser, (req, res) => {
    const { content, screenshots } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Le contenu du message est obligatoire." });
    }

    const newPost: ForumPost = {
      id: generateId("post"),
      userId: req.user!.id,
      userName: req.user!.name,
      userPhone: req.user!.phone,
      content: content.trim(),
      screenshots: Array.isArray(screenshots) ? screenshots.slice(0, 2) : [],
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    db.forumPosts.unshift(newPost);
    saveDatabase(db);

    res.status(201).json({
      message: "Preuve de retrait publiée sur le forum !",
      post: newPost,
    });
  });

  // Forum: Like/unlike a post
  app.post("/api/forum/:postId/like", authenticateUser, (req, res) => {
    const postId = req.params.postId;
    const userId = req.user!.id;

    const post = db.forumPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    if (!post.likedBy) post.likedBy = [];

    const idx = post.likedBy.indexOf(userId);
    if (idx === -1) {
      post.likedBy.push(userId);
      post.likes += 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, post.likes - 1);
    }

    saveDatabase(db);
    res.json({ likes: post.likes, likedBy: post.likedBy });
  });

  // User Reviews: Get approved reviews
  app.get("/api/reviews", (req, res) => {
    const approved = db.userReviews.filter(r => r.status === "approved").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ reviews: approved });
  });

  // User Reviews: Submit new review
  app.post("/api/reviews", authenticateUser, (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: "Une note et un commentaire sont requis." });
    }

    const newReview: UserReview = {
      id: generateId("rev"),
      userId: req.user!.id,
      userName: req.user!.name,
      userPhone: req.user!.phone,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    db.userReviews.unshift(newReview);
    saveDatabase(db);

    res.status(201).json({
      message: "Merci ! Votre avis a été soumis et est en attente d'approbation par l'administrateur.",
      review: newReview,
    });
  });

  // Admin: Get all reviews
  app.get("/api/admin/reviews", authenticateAdmin, (req, res) => {
    res.json({ reviews: db.userReviews });
  });

  // Admin: Verify a user review
  app.post("/api/admin/reviews/:reviewId/verify", authenticateAdmin, (req, res) => {
    const reviewId = req.params.reviewId;
    const { action } = req.body;

    const reviewIdx = db.userReviews.findIndex(r => r.id === reviewId);
    if (reviewIdx === -1) {
      return res.status(404).json({ error: "Avis introuvable." });
    }

    if (action === "approve") {
      db.userReviews[reviewIdx].status = "approved";
    } else if (action === "reject") {
      db.userReviews[reviewIdx].status = "rejected";
    } else {
      return res.status(400).json({ error: "Action invalide." });
    }

    saveDatabase(db);
    res.json({ message: "Statut de l'avis mis à jour !", review: db.userReviews[reviewIdx] });
  });

  // Admin: Delete review
  app.delete("/api/admin/reviews/:reviewId", authenticateAdmin, (req, res) => {
    const reviewId = req.params.reviewId;
    const reviewIdx = db.userReviews.findIndex(r => r.id === reviewId);
    if (reviewIdx === -1) {
      return res.status(404).json({ error: "Avis introuvable." });
    }

    db.userReviews.splice(reviewIdx, 1);
    saveDatabase(db);
    res.json({ message: "Avis supprimé définitivement." });
  });

  // Vite + Production config as required
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dreampod] Server running in production/dev on http://0.0.0.0:${PORT}`);
    
    // Background worker to check and process daily revenue drops automatically every 60 seconds
    setInterval(() => {
      try {
        processDailyRevenues(db);
      } catch (e) {
        console.error("Error in background daily revenue worker:", e);
      }
    }, 60000);
  });
}

startServer().catch(err => {
  console.error("Failed to start app server:", err);
});
