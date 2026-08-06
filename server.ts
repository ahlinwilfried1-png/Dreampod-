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
  TeamMember,
  PaymentChannel
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
  { id: "vip1", name: "VIP 1", price: 4000, dailyIncome: 500, durationDays: 200, totalIncome: 100000, level: 1, category: "stability", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
  { id: "vip2", name: "VIP 2", price: 15000, dailyIncome: 1600, durationDays: 200, totalIncome: 320000, level: 2, category: "stability", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80" },
  { id: "vip3", name: "VIP 3", price: 25000, dailyIncome: 3250, durationDays: 200, totalIncome: 650000, level: 3, category: "wellbeing", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" },
  { id: "vip4", name: "VIP 4", price: 50000, dailyIncome: 11100, durationDays: 200, totalIncome: 2220000, level: 4, category: "wellbeing", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80" },
  { id: "vip5", name: "VIP 5", price: 100000, dailyIncome: 24000, durationDays: 200, totalIncome: 4800000, level: 5, category: "activity", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80" },
  { id: "vip6", name: "VIP 6", price: 150000, dailyIncome: 36000, durationDays: 200, totalIncome: 7200000, level: 6, category: "activity", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80" },
  { id: "vip7", name: "VIP 7", price: 200000, dailyIncome: 50000, durationDays: 200, totalIncome: 10000000, level: 7, category: "activity", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80" },
  { id: "vip8", name: "VIP 8", price: 300000, dailyIncome: 75000, durationDays: 200, totalIncome: 15000000, level: 8, category: "activity", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" },
  { id: "vip9", name: "VIP 9", price: 400000, dailyIncome: 115000, durationDays: 200, totalIncome: 23000000, level: 9, category: "activity", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80" },
  { id: "vip10", name: "VIP 10", price: 800000, dailyIncome: 250000, durationDays: 200, totalIncome: 50000000, level: 10, category: "activity", image: "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800&q=80" },
];

const initialBonusCodes: BonusCode[] = [
  { id: "code1", code: "WELCOME200", amount: 200, maxUses: 1000, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
  { id: "code2", code: "GLOBAL2026", amount: 1500, maxUses: 100, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
  { id: "code3", code: "VIPPLUS", amount: 5000, maxUses: 10, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
];

const initialNotifications: GlobalNotification[] = [
  {
    id: "notif1",
    title: "Récompenser les agents exceptionnels",
    content: "Félicitations à tous nos agents d'équipe qui ont atteint un niveau de performance exceptionnel ce mois-ci. Des primes spéciales ont été créditées sur vos comptes.",
    date: "2026-08-02T08:33:32.000Z",
    active: true,
  },
  {
    id: "notif2",
    title: "Bonjour, bienvenue chez Veko !",
    content: "Bienvenue sur notre plateforme officielle ! Profitez de nos offres d'investissement quotidiennes sécurisées et des retraits rapides vers Mobile Money.",
    date: "2026-08-02T07:49:06.000Z",
    active: true,
  },
  {
    id: "notif3",
    title: "Preuve de retrait",
    content: "Découvrez les derniers certificats de retrait validés par nos utilisateurs dans la rubrique dédiée.",
    date: "2026-08-01T17:30:34.000Z",
    active: true,
  },
  {
    id: "notif4",
    title: "Les 3 voitures ayant bénéficié du plus grand investissement des utilisateurs",
    content: "Nos équipements phares de la semaine ont généré des plus-values record pour les investisseurs.",
    date: "2026-08-01T15:20:52.000Z",
    active: true,
  },
  {
    id: "notif5",
    title: "La meilleure preuve",
    content: "Consultez les témoignages récents de nos investisseurs satisfaits.",
    date: "2026-07-31T17:52:01.000Z",
    active: true,
  },
  {
    id: "notif6",
    title: "Si vous invitez avec succès 6 utilisateurs réels à rejoindre notre entreprise, l'entreprise vous offrira une voiture d'une valeur de 100 000 XAF pour vous aider à gagner de l'argent.",
    content: "Offre spéciale parrainage : Invitez 6 filleuls actifs et débloquez une prime géante instantanée.",
    date: "2026-07-31T16:48:21.000Z",
    active: true,
  },
  {
    id: "notif7",
    title: "Deux façons de gagner de l'argent",
    content: "Combinez les revenus quotidiens de vos machines d'investissement et le programme de parrainage à 3 niveaux (15%, 2%, 1%).",
    date: "2026-07-31T08:07:32.000Z",
    active: true,
  },
  {
    id: "notif8",
    title: "Emprunter de l'argent pour investir dans des produits de niveau supérieur et gagner plus d'argent",
    content: "Optimisez votre capital pour accéder aux plans VIP supérieurs et augmenter vos gains journaliers.",
    date: "2026-07-30T17:05:50.000Z",
    active: true,
  },
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
  paymentChannels: PaymentChannel[];
}

// Ensure database file exists
const cleanEnvVar = (val: string | undefined): string => {
  if (!val) return "";
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
};

const supabaseUrl = cleanEnvVar(process.env.SUPABASE_URL) || "https://vtdiulcssjsqososnwlf.supabase.co";
const supabaseServiceKey = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZGl1bGNzc2pzcW9zb3Nud2xmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjAwNDg1MCwiZXhwIjoyMTAxNTgwODUwfQ.S-vyLMfWtSE25WIpj6deiM4zwqFXitcKdclJRH0GV7U";
const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

let isSupabaseHealthy = false;
let supabaseStatus = supabase ? "disconnected" : "disconnected";
let lastDbLoadedTime = 0;
const DB_LOAD_CACHE_MS = 200;
let db: DatabaseSchema;

let globalDbVersion = Date.now();
const sseClients = new Set<any>();

function broadcastSyncEvent() {
  globalDbVersion = Date.now();
  const payload = `data: ${JSON.stringify({ version: globalDbVersion, timestamp: new Date().toISOString() })}\n\n`;
  for (const clientRes of Array.from(sseClients)) {
    try {
      clientRes.write(payload);
    } catch (e) {
      sseClients.delete(clientRes);
    }
  }
}

if (supabase) {
  console.log("Supabase Client initialized with URL:", supabaseUrl);
} else {
  console.warn("Supabase Client NOT initialized. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
}

async function checkAndRestoreSupabaseHealth(): Promise<boolean> {
  if (!supabase) {
    isSupabaseHealthy = false;
    supabaseStatus = "disconnected";
    return false;
  }
  try {
    const { error } = await supabase.from("dreampod_state").select("id").limit(1);
    if (!error) {
      if (!isSupabaseHealthy) {
        console.log("[Supabase] Connexion et table 'dreampod_state' validées avec succès !");
      }
      isSupabaseHealthy = true;
      supabaseStatus = "connected";
      return true;
    } else {
      const msg = error.message || "";
      if (msg.includes("Invalid API key") || msg.includes("invalid") || msg.includes("JWT") || error.code === "PGRST301") {
        isSupabaseHealthy = false;
        supabaseStatus = "bad_credentials";
      } else if (msg.includes("Could not find the table") || msg.includes("does not exist") || error.code === "PGRST205" || error.code === "42P01") {
        isSupabaseHealthy = false;
        supabaseStatus = "table_missing";
      } else {
        isSupabaseHealthy = false;
        supabaseStatus = "error";
      }
      return false;
    }
  } catch (err: any) {
    isSupabaseHealthy = false;
    supabaseStatus = "error";
    return false;
  }
}

async function saveToSupabase(dbData: DatabaseSchema) {
  if (!supabase) return;
  if (!isSupabaseHealthy) {
    await checkAndRestoreSupabaseHealth();
  }
  if (!isSupabaseHealthy) return;

  try {
    const { error } = await supabase
      .from("dreampod_state")
      .upsert({
        id: "global_db",
        data: dbData,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      console.warn("Error upserting database state to Supabase:", error.message);
      if (error.message?.includes("does not exist") || error.code === "42P01" || error.code === "PGRST205") {
        isSupabaseHealthy = false;
        supabaseStatus = "table_missing";
      }
    } else {
      console.log("Database state successfully synchronized to Supabase!");
      isSupabaseHealthy = true;
      supabaseStatus = "connected";
    }
  } catch (err: any) {
    console.warn("Failed to connect or save to Supabase:", err.message || err);
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

  // Migrate: Ensure main admin usr_admin exists in users table
  if (!parsed.users.some((u: any) => u.id === "usr_admin")) {
    parsed.users.push({
      id: "usr_admin",
      name: "Dreampod Admin",
      phone: "+22800000000",
      passwordHash: "admin123",
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
      role: "admin",
    });
  }

  // Migrate: Ensure admin2 exists in users table
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

  // Migrate: Ensure admin_master exists in users table
  if (!parsed.users.some((u: any) => u.id === "usr_admin_master")) {
    parsed.users.push({
      id: "usr_admin_master",
      name: "Administrateur Général",
      phone: "+22890000000",
      passwordHash: "admin2026",
      balance: 1000000,
      dailyRevenue: 0,
      totalRevenue: 500000,
      referralCode: "MASTER1",
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

  // Migrate: Ensure admin_niger exists in users table
  if (!parsed.users.some((u: any) => u.id === "usr_admin_niger")) {
    parsed.users.push({
      id: "usr_admin_niger",
      name: "Administrateur Niger",
      phone: "+22780000000",
      passwordHash: "dreampod227",
      balance: 1000000,
      dailyRevenue: 0,
      totalRevenue: 500000,
      referralCode: "NIGER7",
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

  // Migrate: Ensure demo user usr_demo exists in users table
  if (!parsed.users.some((u: any) => u.id === "usr_demo")) {
    parsed.users.push({
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
      registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isBlocked: false,
      role: "user",
    });
  }

  if (!parsed.forumPosts || !Array.isArray(parsed.forumPosts) || parsed.forumPosts.length === 0) {
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

  if (!parsed.userReviews || !Array.isArray(parsed.userReviews) || parsed.userReviews.length === 0) {
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

  // Migrate existing products or populate default VIP plans
  const defaultProducts = [
    { id: "vip1", name: "VIP 1", price: 4000, dailyIncome: 500, durationDays: 200, totalIncome: 100000, level: 1, category: "stability", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
    { id: "vip2", name: "VIP 2", price: 15000, dailyIncome: 1600, durationDays: 200, totalIncome: 320000, level: 2, category: "stability", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80" },
    { id: "vip3", name: "VIP 3", price: 25000, dailyIncome: 3250, durationDays: 200, totalIncome: 650000, level: 3, category: "wellbeing", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" },
    { id: "vip4", name: "VIP 4", price: 50000, dailyIncome: 11100, durationDays: 200, totalIncome: 2220000, level: 4, category: "wellbeing", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80" },
    { id: "vip5", name: "VIP 5", price: 100000, dailyIncome: 24000, durationDays: 200, totalIncome: 4800000, level: 5, category: "activity", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80" },
    { id: "vip6", name: "VIP 6", price: 150000, dailyIncome: 36000, durationDays: 200, totalIncome: 7200000, level: 6, category: "activity", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80" },
    { id: "vip7", name: "VIP 7", price: 200000, dailyIncome: 50000, durationDays: 200, totalIncome: 10000000, level: 7, category: "activity", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80" },
    { id: "vip8", name: "VIP 8", price: 300000, dailyIncome: 75000, durationDays: 200, totalIncome: 15000000, level: 8, category: "activity", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" },
    { id: "vip9", name: "VIP 9", price: 400000, dailyIncome: 115000, durationDays: 200, totalIncome: 23000000, level: 9, category: "activity", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80" },
    { id: "vip10", name: "VIP 10", price: 800000, dailyIncome: 250000, durationDays: 200, totalIncome: 50000000, level: 10, category: "activity", image: "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800&q=80" },
  ];

  if (!parsed.products || !Array.isArray(parsed.products)) {
    parsed.products = defaultProducts;
  } else {
    parsed.products = parsed.products.map((p: any) => ({
      ...p,
      price: Number(p.price) || 0,
      dailyIncome: Number(p.dailyIncome) || 0,
      durationDays: Number(p.durationDays) || 1,
      totalIncome: (Number(p.dailyIncome) || 0) * (Number(p.durationDays) || 1),
      isBlocked: p.isBlocked ?? false,
    }));
  }

  if (!parsed.transactions || !Array.isArray(parsed.transactions) || parsed.transactions.length === 0) {
    parsed.transactions = [
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
  }

  if (!parsed.investments || !Array.isArray(parsed.investments)) {
    parsed.investments = [];
  }

  if (!parsed.bonusCodes || !Array.isArray(parsed.bonusCodes) || parsed.bonusCodes.length === 0) {
    parsed.bonusCodes = [
      {
        code: "WELCOME100",
        amount: 500,
        usedCount: 1,
        maxUses: 100,
        usedByUsers: ["usr_demo"],
        createdAt: new Date().toISOString(),
      },
      {
        code: "SUPERBONUS",
        amount: 1000,
        usedCount: 0,
        maxUses: 50,
        usedByUsers: [],
        createdAt: new Date().toISOString(),
      }
    ];
  }

  if (!parsed.notifications || !Array.isArray(parsed.notifications) || parsed.notifications.length === 0) {
    parsed.notifications = [
      {
        id: "notif_1",
        title: "Bienvenue sur Dreampod !",
        content: "Investissez dans nos machines VIP et obtenez des revenus journaliers garantis. Retraits rapides via Mobile Money.",
        createdAt: new Date().toISOString(),
        authorName: "Équipe Dreampod",
      }
    ];
  }

  if (!parsed.paymentChannels || !Array.isArray(parsed.paymentChannels)) {
    parsed.paymentChannels = [];
  } else {
    const preconfiguredNumbers = [
      "+227 99 88 77 66",
      "+227 90 44 55 66",
      "+227 96 11 22 33",
      "+228 90 12 34 56",
      "+227 92 11 22 33",
      "+227 93 11 22 33"
    ];
    parsed.paymentChannels = parsed.paymentChannels.filter((c: any) => c && c.number && !preconfiguredNumbers.includes(c.number));
  }

  // Ensure official online payment channel exists
  const sendavapayOfficial = {
    id: "chan_sendavapay_official",
    name: "Paiement Direct (Mobile Money)",
    operator: "Sendavapay",
    countries: "Tous pays (BJ, TG, CI, BF, CM, NE)",
    number: "https://sendavapay.com/pay/SPYY45UYRN9",
    simOwnerName: "Portail Officiel Sendavapay",
    instructions: "Cliquez sur le lien pour effectuer votre rechargement en toute sécurité via Sendavapay.",
    active: true
  };

  parsed.paymentChannels = parsed.paymentChannels.map((c: any) => {
    if (c) {
      if (c.number && c.number.includes("westpay.cfd")) {
        c.number = "https://sendavapay.com/pay/SPYY45UYRN9";
      }
      if (c.name && c.name.includes("WestPay")) {
        c.name = c.name.replace(/WestPay/g, "Paiement Direct");
      }
      if (c.operator && c.operator.includes("WestPay")) {
        c.operator = "Sendavapay";
      }
      if (c.simOwnerName && c.simOwnerName.includes("WestPay")) {
        c.simOwnerName = "Portail Officiel Sendavapay";
      }
      if (c.instructions && c.instructions.includes("WestPay")) {
        c.instructions = c.instructions.replace(/WestPay/g, "Sendavapay");
      }
    }
    return c;
  });

  if (!parsed.paymentChannels.some((c: any) => c.id === "chan_sendavapay_official" || c.number?.includes("sendavapay.com"))) {
    parsed.paymentChannels.unshift(sendavapayOfficial);
  }

  return parsed as DatabaseSchema;
}

async function loadDatabase(force = false): Promise<DatabaseSchema> {
  const now = Date.now();
  if (!force && typeof db !== "undefined" && db && db.users && db.users.length > 0 && (now - lastDbLoadedTime < DB_LOAD_CACHE_MS)) {
    return db;
  }

  // 1. Try loading from Supabase first if client exists
  if (supabase) {
    try {
      console.log("Loading database state from Supabase table 'dreampod_state'...");
      const { data, error } = await supabase
        .from("dreampod_state")
        .select("data")
        .eq("id", "global_db")
        .single();
        
      if (data && data.data && data.data.users && Array.isArray(data.data.users)) {
        console.log(`[Supabase Load Success] Loaded ${data.data.users.length} users from Supabase.`);
        isSupabaseHealthy = true;
        supabaseStatus = "connected";
        const migrated = migrateDatabase(data.data);
        await saveToSupabase(migrated);
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2), "utf8");
        } catch (e) {}
        lastDbLoadedTime = Date.now();
        db = migrated;
        return db;
      } else if (error) {
        if (error.code === "PGRST116") {
          console.log("[Supabase] No 'global_db' record found in 'dreampod_state'. Will seed default data...");
          isSupabaseHealthy = true;
          supabaseStatus = "connected";
        } else if (error.message?.includes("does not exist") || error.code === "42P01" || error.code === "PGRST205") {
          isSupabaseHealthy = false;
          supabaseStatus = "table_missing";
        } else {
          console.warn("[Supabase Load Error]:", error.message);
        }
      }
    } catch (err: any) {
      console.warn("[Supabase Load Exception]:", err.message || err);
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

    const adminUserNiger = {
      id: "usr_admin_niger",
      name: "Administrateur Niger",
      phone: "+22780000000",
      passwordHash: "dreampod227",
      balance: 1000000,
      dailyRevenue: 0,
      totalRevenue: 500000,
      referralCode: "NIGER7",
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

    const initialPaymentChannels: PaymentChannel[] = [];

    const dbData: DatabaseSchema = {
      users: [adminUser, adminUser2, adminUserNiger, promoUser],
      products: initialProducts,
      investments: initialInvestments,
      transactions: initialTransactions,
      bonusCodes: initialBonusCodes,
      notifications: initialNotifications,
      forumPosts: initialForumPosts,
      userReviews: initialUserReviews,
      paymentChannels: initialPaymentChannels,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf8");
    if (supabase && isSupabaseHealthy) {
      await saveToSupabase(dbData);
    }
    lastDbLoadedTime = Date.now();
    db = dbData;
    return dbData;
  }

  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data) as DatabaseSchema;
    const migrated = migrateDatabase(parsed);
    fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2), "utf8");
    if (supabase && isSupabaseHealthy) {
      await saveToSupabase(migrated);
    }
    lastDbLoadedTime = Date.now();
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
  broadcastSyncEvent();
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
        const isWellbeing = inv.category === "wellbeing" || 
                            (inv.category as string) === "bien_etre" || 
                            inv.productName?.toLowerCase().includes("wellbeing") || 
                            inv.productName?.toLowerCase().includes("bien-être") || 
                            inv.productName?.toLowerCase().includes("bien être") || 
                            inv.productName?.toLowerCase().includes("agricole") || 
                            inv.productName?.toLowerCase().includes("lait");

        if (isWellbeing) {
          // Wellbeing products: Income drops in full ONLY at the end of the cycle (when daysPassed reaches durationDays)
          inv.daysPassed += actualPeriods;
          inv.lastClaimAt = new Date(lastClaim.getTime() + actualPeriods * oneDayMs).toISOString();

          if (inv.daysPassed >= inv.durationDays) {
            const totalCredited = inv.totalIncome || (inv.dailyIncome * inv.durationDays);
            const uIdx = db.users.findIndex(u => u.id === inv.userId);
            if (uIdx !== -1) {
              db.users[uIdx].balance += totalCredited;
              db.users[uIdx].totalRevenue += totalCredited;

              const tx: any = {
                id: generateId("tx"),
                userId: inv.userId,
                userName: db.users[uIdx].name,
                userPhone: db.users[uIdx].phone,
                type: "income",
                amount: totalCredited,
                status: "completed",
                date: now.toISOString(),
                method: `Revenu de fin de cycle (Bien-être) - ${inv.productName}`,
              };
              db.transactions.push(tx);
            }
          }
          dbModified = true;
        } else {
          // Standard VIP products: Daily income distribution every 24h
          const totalCredited = actualPeriods * inv.dailyIncome;
          inv.daysPassed += actualPeriods;
          inv.lastClaimAt = new Date(lastClaim.getTime() + actualPeriods * oneDayMs).toISOString();

          const uIdx = db.users.findIndex(u => u.id === inv.userId);
          if (uIdx !== -1) {
            db.users[uIdx].balance += totalCredited;
            db.users[uIdx].totalRevenue += totalCredited;

            const tx: any = {
              id: generateId("tx"),
              userId: inv.userId,
              userName: db.users[uIdx].name,
              userPhone: db.users[uIdx].phone,
              type: "income",
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

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Verify Supabase health once at startup
  if (supabase) {
    try {
      console.log("Running startup health check on Supabase connection...");
      const { error } = await supabase.from("dreampod_state").select("id").limit(1);
      if (error) {
        const msg = error.message || "";
        if (msg.includes("Invalid API key") || msg.includes("invalid") || msg.includes("JWT") || error.code === "PGRST301") {
          console.warn("\n==================================================");
          console.warn("ATTENTION: La clé API Supabase est INVALIDE ou incorrecte.");
          console.warn("Supabase sera temporairement désactivé pour éviter les ralentissements.");
          console.warn("Le serveur utilisera le stockage local ultra-rapide 'db.json'.");
          console.warn("==================================================\n");
          isSupabaseHealthy = false;
          supabaseStatus = "bad_credentials";
        } else if (msg.includes("Could not find the table") || msg.includes("does not exist") || error.code === "PGRST205" || error.code === "42P01") {
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
          isSupabaseHealthy = false;
          supabaseStatus = "table_missing";
        } else {
          console.warn("Supabase load error during health check:", error.message);
          isSupabaseHealthy = false;
          supabaseStatus = "error";
        }
      } else {
        console.log("[Supabase] Connexion validée avec succès sur 'dreampod_state' !");
        isSupabaseHealthy = true;
        supabaseStatus = "connected";
      }
    } catch (err: any) {
      console.warn("[Supabase] Exception de connexion lors du démarrage :", err.message || err);
      isSupabaseHealthy = false;
      supabaseStatus = "error";
    }
  }

  // Setup database local in-memory/JSON sync
  db = await loadDatabase();

  // Middleware to automatically reload the database from Supabase/local file on every API request.
  // This guarantees that all devices (and multiple serverless containers) operate on the same real-time data.
  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      try {
        db = await loadDatabase(true);
        processDailyRevenues(db);
      } catch (e: any) {
        console.error("Failed to dynamically reload database in request middleware:", e.message || e);
      }
    }
    next();
  });

  // Simple JWT auth simulator middleware
  const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}
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

  const authenticateAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await authenticateUser(req, res, () => {
      if (req.user && req.user.role === "admin") {
        next();
      } else {
        res.status(403).json({ error: "Accès refusé. Droits Administrateur requis." });
      }
    });
  };

  // Extended Express Request types are declared globally at top-level

  // --- REALTIME SYNC API ROUTES ---
  app.get("/api/sync/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (typeof (res as any).flushHeaders === "function") {
      (res as any).flushHeaders();
    }

    res.write(`data: ${JSON.stringify({ version: globalDbVersion, timestamp: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    const keepAlive = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch (e) {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  app.get("/api/sync/version", (req, res) => {
    res.json({ version: globalDbVersion, timestamp: new Date().toISOString() });
  });

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}
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
  app.post("/api/auth/login", async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Numéro de téléphone et mot de passe indispensables." });
    }

    let normalizedPhone = phone.trim();
    if (normalizedPhone.toLowerCase() === "admin") {
      normalizedPhone = "+22800000000";
    } else if (normalizedPhone.toLowerCase() === "admin2") {
      normalizedPhone = "+22900000002";
    } else if (normalizedPhone.toLowerCase() === "admin3") {
      normalizedPhone = "+22780000000";
    } else if (normalizedPhone.toLowerCase() === "admin4" || normalizedPhone.toLowerCase() === "admin_master") {
      normalizedPhone = "+22890000000";
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
    if (!db.notifications || db.notifications.length === 0) {
      db.notifications = initialNotifications;
      saveDatabase(db);
    }
    const activeNotifs = db.notifications.filter(n => n.active !== false);
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

    // Single-use constraint for VIP 0
    const isVip0Product =
      product.id === "vip0" ||
      product.id === "vp0" ||
      product.level === 0 ||
      product.name.toLowerCase().includes("vip 0") ||
      product.name.toLowerCase().includes("vp 0") ||
      product.name.toLowerCase().includes("découverte") ||
      product.name.toLowerCase().includes("decouverte");

    if (isVip0Product) {
      const alreadySubscribedVip0 = db.investments.some(
        inv => inv.userId === userId && (
          inv.productId === product.id ||
          inv.productId === "vip0" ||
          inv.productId === "vp0" ||
          inv.productName.toLowerCase().includes("vip 0") ||
          inv.productName.toLowerCase().includes("vp 0") ||
          inv.productName.toLowerCase().includes("découverte") ||
          inv.productName.toLowerCase().includes("decouverte")
        )
      );
      if (alreadySubscribedVip0) {
        return res.status(400).json({
          error: "Vous avez déjà bénéficié de l'offre spéciale VIP 0. Ce produit est réservé à un usage unique par utilisateur."
        });
      }
    }

    // Bien-être reinvestment constraint: Must reinvest in a standard VIP product before buying another Bien-être product
    const isWellbeingProduct =
      product.category === "wellbeing" ||
      (product.category as string) === "bien_etre" ||
      product.name?.toLowerCase().includes("wellbeing") ||
      product.name?.toLowerCase().includes("bien-être") ||
      product.name?.toLowerCase().includes("bien être") ||
      product.name?.toLowerCase().includes("agricole") ||
      product.name?.toLowerCase().includes("lait");

    if (isWellbeingProduct) {
      const userInvs = (db.investments || [])
        .filter(inv => inv.userId === userId)
        .sort((a, b) => new Date(a.activatedAt || 0).getTime() - new Date(b.activatedAt || 0).getTime());

      if (userInvs.length > 0) {
        const lastInv = userInvs[userInvs.length - 1];
        const lastIsWellbeing =
          lastInv.category === "wellbeing" ||
          (lastInv.category as string) === "bien_etre" ||
          lastInv.productName?.toLowerCase().includes("wellbeing") ||
          lastInv.productName?.toLowerCase().includes("bien-être") ||
          lastInv.productName?.toLowerCase().includes("bien être") ||
          lastInv.productName?.toLowerCase().includes("agricole") ||
          lastInv.productName?.toLowerCase().includes("lait");

        if (lastIsWellbeing) {
          return res.status(400).json({
            error: "Pour souscrire à un nouveau produit Bien-être, vous devez d'abord réinvestir dans un plan VIP principal."
          });
        }
      }
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
      totalIncome: product.totalIncome || (product.dailyIncome * product.durationDays),
      category: product.category || "wellbeing",
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
    // Level 1: 15%
    if (user.referrerId) {
      const l1Idx = db.users.findIndex(u => u.id === user.referrerId);
      if (l1Idx !== -1) {
        const commN1 = Math.round(product.price * 0.15);
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
    const { amount, method, simOwnerName, receiverNumber, screenshot, txRefId } = req.body;
    const userId = req.user!.id;

    if (!amount || amount < 4000) {
      return res.status(400).json({ error: "Le montant minimum de dépôt est de 4 000 FCFA / XAF." });
    }

    if (!method) {
      return res.status(400).json({ error: "Veuillez choisir un moyen de rechargement (Airtel, Moov, Orange, TMoney, Amana, Nita)." });
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
      simOwnerName: simOwnerName || undefined,
      receiverNumber: receiverNumber || undefined,
      screenshot: screenshot || undefined,
      txRefId: txRefId || undefined,
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
    const { amount, withdrawalCode } = req.body;
    const userId = req.user!.id;

    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur non trouvé" });
    const user = db.users[uIdx];

    // Check withdrawal time restriction: 9h to 18h GMT - admins can bypass
    if (user.role !== "admin") {
      try {
        const utcFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "UTC",
          hour: "numeric",
          hour12: false,
        });
        const currentGMTHour = parseInt(utcFormatter.format(new Date()), 10);

        if (currentGMTHour < 9 || currentGMTHour >= 18) {
          return res.status(400).json({
            error: "Les retraits sont actuellement fermés. Veuillez revenir pendant les heures d'ouverture des retraits."
          });
        }
      } catch (e) {
        // Fallback to UTC hour if timezone formatting fails
        const currentGMTHour = new Date().getUTCHours();
        if (currentGMTHour < 9 || currentGMTHour >= 18) {
          return res.status(400).json({
            error: "Les retraits sont actuellement fermés. Veuillez revenir pendant les heures d'ouverture des retraits."
          });
        }
      }
    }

    // Check if user has linked a wallet
    if (!user.linkedWalletNumber || !user.linkedWalletOperator) {
      return res.status(400).json({ error: "Avant d'effectuer un retrait, vous devez lier votre portefeuille mobile money à votre compte." });
    }

    // Check withdrawalCode
    if (!withdrawalCode || String(withdrawalCode).trim() !== String(user.withdrawalCode).trim()) {
      return res.status(400).json({ error: "Le code de retrait fourni est incorrect." });
    }

    // Check if user has at least one active product (daysPassed < durationDays)
    const hasActiveProduct = db.investments.some(inv => inv.userId === userId && inv.daysPassed < inv.durationDays);
    if (!hasActiveProduct && user.role !== "admin") {
      return res.status(400).json({ error: "Vous devez d'abord acheter un produit avant de pouvoir effectuer un retrait." });
    }

    if (!amount || amount < 1200) {
      return res.status(400).json({ error: "Le montant minimum de retrait est de 1 200 FCFA." });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: `Solde insuffisant pour retirer ${amount} FCFA. Solde actuel: ${user.balance} FCFA.` });
    }

    // Deduct user balance immediately for safety
    user.balance -= amount;

    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    const rand4 = String(Math.floor(1000 + Math.random() * 9000));
    const txRefId = `B${yy}${mm}${dd}${hh}${min}${ss}${rand4}`;

    const tx: Transaction = {
      id: generateId("tx"),
      txRefId: txRefId,
      userId: userId,
      userName: user.name,
      userPhone: user.phone,
      type: "withdrawal",
      amount: Number(amount),
      status: "pending", // Withdrawal pending admin evaluation
      date: d.toISOString(),
      method: `${user.linkedWalletOperator.toUpperCase()} (${user.linkedWalletNumber})`,
      linkedWalletOperator: user.linkedWalletOperator,
      linkedWalletNumber: user.linkedWalletNumber,
      linkedWalletOwnerName: user.linkedWalletOwnerName,
    };

    db.transactions.push(tx);
    await saveDatabase(db);

    res.json({
      message: "Votre demande de retrait a été soumise avec succès et est en cours d'évaluation.",
      balance: user.balance,
      transaction: tx
    });
  });

  // Link payment wallet
  app.post("/api/user/link-wallet", authenticateUser, async (req, res) => {
    const { operator, number, ownerName, withdrawalCode } = req.body;
    if (!operator || !number || !ownerName || !withdrawalCode) {
      return res.status(400).json({ error: "Veuillez remplir tous les champs (Opérateur, Numéro, Nom du titulaire et Code de retrait)." });
    }

    const uIdx = db.users.findIndex(u => u.id === req.user!.id);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur non trouvé" });

    db.users[uIdx].linkedWalletOperator = operator;
    db.users[uIdx].linkedWalletNumber = number;
    db.users[uIdx].linkedWalletOwnerName = ownerName;
    db.users[uIdx].withdrawalCode = withdrawalCode;

    await saveDatabase(db);

    const safeUser = getSafeUser(db, db.users[uIdx]);
    res.json({
      message: "Votre portefeuille de paiement a été lié avec succès !",
      user: safeUser
    });
  });

  // Get active payment channels
  app.get("/api/payment-channels", async (req, res) => {
    res.json({ channels: db.paymentChannels || [] });
  });

  // Admin: Update payment channels
  app.post("/api/admin/payment-channels", authenticateUser, async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { channels } = req.body;
    if (!channels || !Array.isArray(channels)) {
      return res.status(400).json({ error: "Format des canaux de paiement invalide." });
    }

    db.paymentChannels = channels;
    await saveDatabase(db);

    res.json({
      message: "Configuration des canaux de paiement mise à jour avec succès !",
      channels: db.paymentChannels,
    });
  });

  // Claim hourly/daily revenue of active investments manually
  app.post("/api/user/claim-revenues", authenticateUser, async (req, res) => {
    const userId = req.user!.id;
    const userInvests = db.investments.filter(i => i.userId === userId);
    
    if (userInvests.length === 0) {
      return res.status(400).json({ error: "Vous n'avez aucun investissement actif." });
    }

    const now = new Date();
    let totalRevenueClaimed = 0;
    
    userInvests.forEach(inv => {
      const lastClaim = new Date(inv.lastClaimAt);
      const elapsedMs = now.getTime() - lastClaim.getTime();
      
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
      await saveDatabase(db);
      
      res.json({
        message: `Félicitations ! Vous avez récolté ${totalRevenueClaimed} FCFA de vos investissements actifs.`,
        amount: totalRevenueClaimed,
        user: db.users[uIdx]
      });
    } else {
      res.status(400).json({ error: "Vos revenus ont déjà été collectés pour cette période." });
    }
  });

  // Daily Check-In (Pointage)
  app.post("/api/user/checkin", authenticateUser, async (req, res) => {
    const userId = req.user!.id;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const hasCheckedInToday = db.transactions.some(tx => 
      tx.userId === userId && 
      tx.type === "bonus" && 
      tx.method === "Pointage quotidien" && 
      tx.date.startsWith(todayStr)
    );

    if (hasCheckedInToday) {
      return res.status(400).json({ error: "Vous avez déjà effectué votre pointage aujourd'hui. Revenez demain !" });
    }

    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const checkInReward = 100; // 100 FCFA (Bonus journalier de pointage)
    db.users[uIdx].balance += checkInReward;
    db.users[uIdx].totalRevenue += checkInReward;

    const tx: Transaction = {
      id: generateId("tx"),
      userId: userId,
      userName: req.user!.name,
      userPhone: req.user!.phone,
      type: "bonus",
      amount: checkInReward,
      status: "completed",
      date: now.toISOString(),
      method: "Pointage quotidien",
    };
    db.transactions.push(tx);

    await saveDatabase(db);

    res.json({
      message: `Félicitations ! Votre pointage a été validé. Un bonus de ${checkInReward} FCFA a été ajouté à votre solde.`,
      reward: checkInReward,
      balance: db.users[uIdx].balance,
    });
  });

  // Claim Gift/Promo Code
  app.post("/api/user/claim-bonus", authenticateUser, async (req, res) => {
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

    await saveDatabase(db);

    res.json({
      message: `Félicitations ! Code '${cleanedCode}' validé. Un montant de ${bonus.amount} FCFA a été ajouté à votre solde.`,
      reward: bonus.amount,
      balance: db.users[uIdx].balance,
    });
  });

  // Lucky Wheel Spin
  app.post("/api/user/spin-wheel", authenticateUser, async (req, res) => {
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

    await saveDatabase(db);

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

  // Middleware to automatically synchronize and refresh the in-memory database
  // before serving any admin actions, so they see registrations/updates from other devices instantly.
  app.use("/api/admin", async (req, res, next) => {
    try {
      db = await loadDatabase(true);
    } catch (err) {
      console.warn("Error refreshing database for admin route:", err);
    }
    next();
  });

  // Admin Stats
  app.get("/api/admin/stats", authenticateAdmin, async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}

    const totalUsers = db.users ? db.users.length : 0;
    let totalInvested = 0;
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let platformRevenues = 0;

    (db.transactions || []).forEach(tx => {
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

    const totalPendingDepositsAmount = (db.transactions || [])
      .filter(t => t.type === "deposit" && t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPendingWithdrawalsAmount = (db.transactions || [])
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
        numberOfPendingWithdrawals: (db.transactions || []).filter(t => t.type === "withdrawal" && t.status === "pending").length,
        numberOfPendingDeposits: (db.transactions || []).filter(t => t.type === "deposit" && t.status === "pending").length,
        totalPendingDepositsAmount,
        totalPendingWithdrawalsAmount,
        totalPurchasedProductsCount,
        totalPurchasedProductsAmount,
        numberOfProducts: (db.products || []).length,
        numberOfBonusCodes: (db.bonusCodes || []).length,
      },
      isSupabaseHealthy: isSupabaseHealthy,
      supabaseStatus: supabaseStatus
    });
  });

  // Admin: Get all users & search/filter with complete financial telemetry
  app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}

    const { search } = req.query;
    let filteredUsers = [...(db.users || [])];

    if (search) {
      const q = String(search).toLowerCase().trim();
      const cleanQ = q.replace(/[\s\-\(\)]/g, "");
      filteredUsers = filteredUsers.filter(u => {
        const uName = (u.name || "").toLowerCase();
        const uPhone = u.phone || "";
        const cleanPhone = uPhone.replace(/[\s\-\(\)]/g, "");
        const uRef = (u.referralCode || "").toLowerCase();
        return (
          uName.includes(q) ||
          uPhone.includes(q) ||
          (cleanQ && cleanPhone.includes(cleanQ)) ||
          uRef.includes(q)
        );
      });
    }

    const txs = db.transactions || [];
    const invs = db.investments || [];

    // Return with password mapped to password property & full financial breakdown
    const safeUsers = filteredUsers.map(({ passwordHash, ...u }) => {
      const userTxs = txs.filter(t => t.userId === u.id);
      const userInvs = invs.filter(i => i.userId === u.id);

      const totalDeposited = userTxs
        .filter(t => t.type === "deposit" && t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawn = userTxs
        .filter(t => t.type === "withdrawal" && t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);

      const pendingDepositsCount = userTxs.filter(t => t.type === "deposit" && t.status === "pending").length;
      const pendingWithdrawalsCount = userTxs.filter(t => t.type === "withdrawal" && t.status === "pending").length;

      const activeInvestmentsCount = userInvs.length;
      const totalInvested = userInvs.reduce((sum, inv) => sum + (inv.price || 0), 0);

      return {
        ...u,
        password: passwordHash,
        totalDeposited,
        totalWithdrawn,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        activeInvestmentsCount,
        totalInvested,
        transactionsCount: userTxs.length
      };
    });

    res.json({ users: safeUsers });
  });

  // Admin: Block/Unblock account
  app.post("/api/admin/user/block", authenticateAdmin, async (req, res) => {
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
    await saveDatabase(db);

    res.json({ 
      message: `Compte utilisateur ${block ? 'bloqué' : 'débloqué'} avec succès.`,
      user: db.users[uIdx]
    });
  });

  // Admin: Directly add custom balance bonus to user
  app.post("/api/admin/user/bonus", authenticateAdmin, async (req, res) => {
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
    await saveDatabase(db);

    res.json({ 
      message: `Bonus de ${numAmount} FCFA ajouté à ${db.users[uIdx].name} avec succès.`,
      user: db.users[uIdx]
    });
  });

  // Admin: Get transactions (deposits & withdrawals)
  app.get("/api/admin/transactions", authenticateAdmin, async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}
    // Return all transactions sorted by date
    const txs = [...(db.transactions || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    const { name, price, dailyIncome, durationDays, category, image } = req.body;
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
      category: category || "wellbeing",
      image: image || undefined,
    };

    db.products.push(newProd);
    saveDatabase(db);

    res.json({
      message: `Nouveau produit '${name}' ajouté avec succès !`,
      product: newProd,
    });
  });

  // Admin: Delete VIP plan product
  app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    const prodIdx = db.products.findIndex(p => p.id === id);
    if (prodIdx === -1) {
      return res.status(404).json({ error: "Produit/Plan introuvable." });
    }

    const deleted = db.products.splice(prodIdx, 1)[0];
    
    // Also remove any active paid investments associated with this deleted product
    if (db.investments) {
      db.investments = db.investments.filter(i => i.productId !== id);
    }

    await saveDatabase(db);

    res.json({ message: `Produit ${deleted.name} supprimé avec succès.` });
  });

  // Admin: Update VIP plan product
  app.put("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    const { name, price, dailyIncome, durationDays, category, isBlocked, image } = req.body;
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
    if (image !== undefined) prod.image = image;
    prod.totalIncome = prod.dailyIncome * prod.durationDays;
    
    await saveDatabase(db);
    res.json({ message: `Le plan "${prod.name}" a été mis à jour avec succès !`, product: prod });
  });

  // Admin: Update user details (modify things on user's account)
  app.put("/api/admin/users/:id", authenticateAdmin, async (req, res) => {
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
    
    await saveDatabase(db);
    res.json({ message: `Le compte de "${user.name}" a été mis à jour avec succès !`, user });
  });

  // Admin: Delete user account
  app.delete("/api/admin/users/:id", authenticateAdmin, async (req, res) => {
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
    
    await saveDatabase(db);
    res.json({ message: `Le compte de "${deletedUser.name}" a été supprimé avec succès !` });
  });

  // Admin: Delete user's investment (paid product)
  app.delete("/api/admin/investments/:id", authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    if (!db.investments) db.investments = [];
    const invIdx = db.investments.findIndex(i => i.id === id);
    if (invIdx === -1) {
      return res.status(404).json({ error: "Investissement introuvable." });
    }
    const deleted = db.investments.splice(invIdx, 1)[0];

    // Recalculate user daily revenue
    const user = db.users.find(u => u.id === deleted.userId);
    if (user && user.dailyRevenue !== undefined) {
      user.dailyRevenue = Math.max(0, user.dailyRevenue - (deleted.dailyIncome || 0));
    }

    await saveDatabase(db);
    res.json({ message: `Investissement "${deleted.productName}" a été supprimé avec succès.` });
  });

  // Admin: Create gift promo code
  app.post("/api/admin/bonus-codes/generate", authenticateAdmin, async (req, res) => {
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
    await saveDatabase(db);

    res.json({
      message: `Code cadeau '${upperCode}' créé avec succès !`,
      bonusCode: newCode,
    });
  });

  // Admin: Get all bonus codes
  app.get("/api/admin/bonus-codes", authenticateAdmin, async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}
    res.json({ bonusCodes: db.bonusCodes || [] });
  });

  // Admin: Get all active user investments (paid products)
  app.get("/api/admin/investments", authenticateAdmin, async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}
    res.json({ investments: db.investments || [] });
  });

  // Admin: Broadcast dynamic notification
  app.post("/api/admin/notifications/send", authenticateAdmin, async (req, res) => {
    const { title, content, image } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Titre et contenu requis." });
    }

    const newNotif: GlobalNotification = {
      id: generateId("notif"),
      title,
      content,
      image: image ? String(image).trim() : undefined,
      date: new Date().toISOString(),
      active: true,
    };

    db.notifications.unshift(newNotif); // latest first
    await saveDatabase(db);

    res.json({
      message: "Notification globale diffusée avec succès !",
      notification: newNotif,
    });
  });

  // Admin: Delete a notification
  app.delete("/api/admin/notifications/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    db.notifications = (db.notifications || []).filter(n => n.id !== id);
    await saveDatabase(db);
    res.json({ message: "Annonce supprimée avec succès." });
  });

  // Admin: Synchronize local storage state with server state
  app.post("/api/admin/sync", authenticateAdmin, async (req, res) => {
    try {
      db = await loadDatabase(true);
    } catch (e) {}

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
            amount: typeof tx.amount === "number" ? tx.amount : Number(tx.amount || 0),
            method: tx.method || "T-money",
            status: tx.status || "pending",
            date: tx.date || new Date().toISOString(),
            simOwnerName: tx.simOwnerName,
            receiverNumber: tx.receiverNumber,
            screenshot: tx.screenshot,
            txRefId: tx.txRefId,
            linkedWalletOperator: tx.linkedWalletOperator,
            linkedWalletNumber: tx.linkedWalletNumber,
            linkedWalletOwnerName: tx.linkedWalletOwnerName,
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
      await saveDatabase(db);
    } else {
      // Force sync to Supabase to ensure cloud state is synchronized
      await saveDatabase(db);
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

  // User Reviews: Submit new review / proof
  app.post("/api/reviews", authenticateUser, (req, res) => {
    const { rating, comment, image } = req.body;
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
      image: image || undefined,
      createdAt: new Date().toISOString(),
      status: "approved",
    };

    db.userReviews.unshift(newReview);
    saveDatabase(db);

    res.status(201).json({
      message: "Merci ! Votre preuve de retrait a été publiée avec succès et est visible immédiatement.",
      review: newReview,
    });
  });

  // Admin: Get all reviews
  app.get("/api/admin/reviews", authenticateAdmin, (req, res) => {
    res.json({ reviews: db.userReviews });
  });

  // Admin: Create official review/proof with image
  app.post("/api/admin/reviews", authenticateAdmin, (req, res) => {
    const { userName, userPhone, rating, comment, image } = req.body;
    if (!comment) {
      return res.status(400).json({ error: "Un commentaire ou témoignage est requis." });
    }

    const newReview: UserReview = {
      id: generateId("rev"),
      userId: (req as any).user?.id || "admin_official",
      userName: userName || "Membre Nutrien Ag",
      userPhone: userPhone || "+22890000000",
      rating: Number(rating) || 5,
      comment: comment.trim(),
      image: image || undefined,
      createdAt: new Date().toISOString(),
      status: "approved",
    };

    db.userReviews.unshift(newReview);
    saveDatabase(db);

    res.status(201).json({
      message: "Preuve / Certificat officiel publié avec succès !",
      review: newReview,
    });
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

  // Global Express Error Handler Middleware to format all unhandled backend crashes/exceptions as JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled API Error:", err);
    res.status(500).json({
      error: "Une erreur interne du serveur est survenue.",
      message: err.message || String(err),
    });
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
