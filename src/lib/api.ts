/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Product, Investment, Transaction, BonusCode, GlobalNotification, ForumPost, UserReview, TeamMember } from "../types";

const TOKEN_KEY = "dreampod_auth_token";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const BACKEND_URL = "https://ais-pre-wpq5a34ir5qewcez66evtj-473372860465.europe-west1.run.app";

// Determine if we are running in a real full-stack environment where Express serves frontend + backend
const isLocalOrCloudRun = (): boolean => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  
  // If we are on static hosting providers like Vercel, Netlify, or GitHub Pages, we don't have our Node backend
  if (
    hostname.includes("vercel.app") || 
    hostname.includes("netlify.app") || 
    hostname.includes("github.io")
  ) {
    return false;
  }
  
  // For all other cases (localhost, Cloud Run, VPS, Railway, custom domains with custom backends),
  // we are running a real full-stack application and should use the server API.
  return true;
};

// Determine if we need to call the remote Cloud Run URL (such as when running on Vercel)
const getApiBase = (): string => {
  if (typeof window === "undefined") return "";
  
  // Explicit API URL overrides everything
  const envApiUrl = (import.meta as any).env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // If we are in a real full-stack environment (localhost, run.app, custom deployed domain, etc.)
  // we use relative paths since Express serves the client and API on the same domain/origin
  if (isLocalOrCloudRun()) {
    return "";
  }
  
  // Otherwise, if on Vercel/Netlify, we point to our live backend URL
  return BACKEND_URL;
};

const API_BASE = getApiBase();

let useLocalFallback = false;
try {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  if (
    hostname.includes("vercel.app") || 
    hostname.includes("github.io") || 
    hostname.includes("netlify.app") ||
    hostname.includes("web.app") ||
    hostname.includes("firebaseapp.com") ||
    hostname.includes("surge.sh")
  ) {
    useLocalFallback = true;
  } else {
    // If we previously saved a fallback flag, use it; otherwise default to false (which tries the live backend first)
    useLocalFallback = localStorage.getItem("dreampod_use_local_fallback") === "true";
  }
} catch (e) {}

// --- LOCAL STORAGE DATABASE SIMULATION (MIRRORS SERVER.TS EXACTLY) ---

function getLocalDb() {
  const defaultProducts: Product[] = [
    { id: "vip1", name: "VIP 1 - Plan Élite", price: 5000, dailyIncome: 1000, durationDays: 30, totalIncome: 30000, level: 1, category: "stability" },
    { id: "vip2", name: "VIP 2 - Plan Premium", price: 10000, dailyIncome: 2500, durationDays: 30, totalIncome: 75000, level: 2, category: "stability" },
    { id: "vip3", name: "VIP 3 - Plan Gold", price: 25000, dailyIncome: 7000, durationDays: 30, totalIncome: 210000, level: 3, category: "wellbeing" },
    { id: "vip4", name: "VIP 4 - Plan Platinum", price: 50000, dailyIncome: 16000, durationDays: 30, totalIncome: 480000, level: 4, category: "wellbeing" },
    { id: "vip5", name: "VIP 5 - Plan Infini", price: 100000, dailyIncome: 35000, durationDays: 30, totalIncome: 1050000, level: 5, category: "activity" },
    { id: "vip6", name: "VIP 6 - Plan Saphir", price: 250000, dailyIncome: 95000, durationDays: 30, totalIncome: 2850000, level: 6, category: "activity" },
  ];

  const defaultBonusCodes: BonusCode[] = [
    { id: "code1", code: "WELCOME200", amount: 200, maxUses: 1000, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
    { id: "code2", code: "GLOBAL2026", amount: 1500, maxUses: 100, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
    { id: "code3", code: "VIPPLUS", amount: 5000, maxUses: 10, usedCount: 0, usedByUsers: [], createdAt: new Date().toISOString() },
  ];

  const defaultNotifications: GlobalNotification[] = [
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

  const defaultUsers = [
    {
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
    },
    {
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
    },
    {
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
    }
  ];

  const defaultInvestments: Investment[] = [
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

  const defaultTransactions: Transaction[] = [
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

  const defaultForumPosts: ForumPost[] = [
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

  const defaultUserReviews: UserReview[] = [
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

  try {
    const raw = localStorage.getItem("dreampod_local_db");
    if (!raw) {
      const db = {
        users: defaultUsers,
        products: defaultProducts,
        investments: defaultInvestments,
        transactions: defaultTransactions,
        bonusCodes: defaultBonusCodes,
        notifications: defaultNotifications,
        forumPosts: defaultForumPosts,
        userReviews: defaultUserReviews,
      };
      saveLocalDb(db);
      return db;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = defaultUsers;
    if (!parsed.products) parsed.products = defaultProducts;
    if (!parsed.investments) parsed.investments = defaultInvestments;
    if (!parsed.transactions) parsed.transactions = defaultTransactions;
    if (!parsed.bonusCodes) parsed.bonusCodes = defaultBonusCodes;
    if (!parsed.notifications) parsed.notifications = defaultNotifications;
    if (!parsed.forumPosts) parsed.forumPosts = defaultForumPosts;
    if (!parsed.userReviews) parsed.userReviews = defaultUserReviews;
    return parsed;
  } catch (e) {
    const db = {
      users: defaultUsers,
      products: defaultProducts,
      investments: defaultInvestments,
      transactions: defaultTransactions,
      bonusCodes: defaultBonusCodes,
      notifications: defaultNotifications,
      forumPosts: defaultForumPosts,
      userReviews: defaultUserReviews,
    };
    saveLocalDb(db);
    return db;
  }
}

function saveLocalDb(db: any) {
  try {
    localStorage.setItem("dreampod_local_db", JSON.stringify(db));
  } catch (e) {}
}

function generateLocalId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

function getSafeUserLocal(db: any, user: any): User {
  if (!user) return user;
  const users = db.users || [];
  const investments = db.investments || [];
  
  // Calculate N1
  const level1 = users.filter((u: any) => u && u.referrerId === user.id);
  const referralsN1 = level1.length;

  // Calculate N2
  const level1Ids = new Set(level1.map((u: any) => u.id));
  const level2 = users.filter((u: any) => u && u.referrerId && level1Ids.has(u.referrerId));
  const referralsN2 = level2.length;

  // Calculate N3
  const level2Ids = new Set(level2.map((u: any) => u.id));
  const level3 = users.filter((u: any) => u && u.referrerId && level2Ids.has(u.referrerId));
  const referralsN3 = level3.length;

  const referralsCount = referralsN1 + referralsN2 + referralsN3;

  // Invested referrals count (Level 1 only, with active investments for wheel spins)
  const investedReferralsCount = level1.filter((ref: any) => 
    investments.some((inv: any) => inv && inv.userId === ref.id)
  ).length;
  
  const spinsUsed = user.spinsUsed || 0;
  const spinsAvailable = Math.max(0, investedReferralsCount - spinsUsed);

  // Calculate dynamic dailyRevenue
  const activeInvestments = investments.filter((i: any) => i && i.userId === user.id && i.daysPassed < i.durationDays);
  const dailyRevenue = activeInvestments.reduce((sum: number, i: any) => sum + (i.dailyIncome || 0), 0);

  const { passwordHash, ...safeUser } = user;
  return {
    ...safeUser,
    referralsCount,
    referralsN1,
    referralsN2,
    referralsN3,
    spinsAvailable,
    dailyRevenue,
  };
}

function processDailyRevenuesLocal(db: any) {
  const now = new Date();
  let dbModified = false;

  if (!db.investments) db.investments = [];
  if (!db.users) db.users = [];

  db.investments.forEach((inv: any) => {
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
        inv.lastClaimAt = new Date(lastClaim.getTime() + actualPeriods * oneDayMs).toISOString();

        const uIdx = db.users.findIndex((u: any) => u.id === inv.userId);
        if (uIdx !== -1) {
          db.users[uIdx].balance += totalCredited;
          db.users[uIdx].totalRevenue += totalCredited;
          
          // Generate a transaction log
          const tx: any = {
            id: generateLocalId("tx"),
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
    saveLocalDb(db);
  }
}

function getLocalCurrentUser(db: any): any {
  const token = getToken();
  if (!token || !token.startsWith("token_")) {
    throw new Error("Authentification requise. Veuillez vous connecter.");
  }
  const tokenContent = token.substring("token_".length);
  const lastUnderscoreIndex = tokenContent.lastIndexOf("_");
  if (lastUnderscoreIndex === -1) {
    throw new Error("Session invalide. Veuillez vous reconnecter.");
  }
  const userId = tokenContent.substring(0, lastUnderscoreIndex);
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }
  if (user.isBlocked) {
    throw new Error("Votre compte est bloqué. Veuillez contacter le support client.");
  }
  return user;
}

async function handleLocalRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  const db = getLocalDb();
  processDailyRevenuesLocal(db);
  
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth: Register
  if (path === "/api/auth/register" && method === "POST") {
    const { name, phone, password, referrerCode } = body;
    if (!phone || !password) {
      throw new Error("Veuillez remplir tous les champs obligatoires (Téléphone, Mot de passe).");
    }
    const normalizedPhone = phone.trim();
    const existing = db.users.find((u: any) => u.phone === normalizedPhone);
    if (existing) {
      throw new Error("Ce numéro de téléphone est déjà utilisé.");
    }
    let referrerId = undefined;
    if (referrerCode) {
      const parent = db.users.find((u: any) => u.referralCode && u.referralCode.toUpperCase() === referrerCode.trim().toUpperCase());
      if (parent) {
        referrerId = parent.id;
      } else {
        // Fallback to default admin code instead of throwing an error, to avoid blocking registration
        const fallbackAdmin = db.users.find((u: any) => u.role === "admin" || u.id === "usr_admin");
        if (fallbackAdmin) {
          referrerId = fallbackAdmin.id;
        }
      }
    }
    const userId = generateLocalId("usr");
    const selfReferralCode = `REP${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      id: userId,
      name: name && name.trim() ? name.trim() : `Membre_${normalizedPhone.slice(-4)}`,
      phone: normalizedPhone,
      passwordHash: password,
      balance: 200, // Welcome bonus
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
    saveLocalDb(db);
    
    const token = `token_${userId}_${Date.now()}`;
    setToken(token);
    return { token, user: getSafeUserLocal(db, newUser) } as any;
  }

  // Auth: Login
  if (path === "/api/auth/login" && method === "POST") {
    const { phone, password } = body;
    if (!phone || !password) {
      throw new Error("Veuillez entrer votre numéro de téléphone et votre mot de passe.");
    }
    const normalizedPhone = phone.trim();
    const user = db.users.find((u: any) => u.phone === normalizedPhone || u.name === normalizedPhone);
    if (!user || user.passwordHash !== password) {
      throw new Error("Numéro de téléphone ou mot de passe incorrect.");
    }
    if (user.isBlocked) {
      throw new Error("Votre compte est bloqué. Veuillez contacter le support client.");
    }
    const token = `token_${user.id}_${Date.now()}`;
    setToken(token);
    return { token, user: getSafeUserLocal(db, user) } as any;
  }

  // User: Profile
  if (path === "/api/user/profile" && method === "GET") {
    const user = getLocalCurrentUser(db);
    return { user: getSafeUserLocal(db, user) } as any;
  }

  // User: Change Password
  if (path === "/api/user/change-password" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const { oldPassword, newPassword } = body;
    if (user.passwordHash !== oldPassword) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }
    user.passwordHash = newPassword;
    saveLocalDb(db);
    return { message: "Mot de passe modifié avec succès !" } as any;
  }

  // User: Stats and Downline
  if (path === "/api/user/stats" && method === "GET") {
    const user = getLocalCurrentUser(db);
    const userInvestments = db.investments.filter((i: any) => i.userId === user.id);
    const userTransactions = db.transactions.filter((t: any) => t.userId === user.id).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Downline calculation
    const level1 = db.users.filter((u: any) => u && u.referrerId === user.id);
    const level2Referrals: any[] = [];
    level1.forEach((l1: any) => {
      const l2 = db.users.filter((u: any) => u && u.referrerId === l1.id);
      level2Referrals.push(...l2);
    });
    const level3Referrals: any[] = [];
    level2Referrals.forEach((l2: any) => {
      const l3 = db.users.filter((u: any) => u && u.referrerId === l2.id);
      level3Referrals.push(...l3);
    });

    const teamList: TeamMember[] = [
      ...level1.map((u: any) => ({ id: u.id, name: u.name, phone: u.phone, registeredAt: u.registeredAt, level: 1, investmentCount: db.investments.filter((i: any) => i.userId === u.id).length })),
      ...level2Referrals.map((u: any) => ({ id: u.id, name: u.name, phone: u.phone, registeredAt: u.registeredAt, level: 2, investmentCount: db.investments.filter((i: any) => i.userId === u.id).length })),
      ...level3Referrals.map((u: any) => ({ id: u.id, name: u.name, phone: u.phone, registeredAt: u.registeredAt, level: 3, investmentCount: db.investments.filter((i: any) => i.userId === u.id).length })),
    ];

    return {
      user: getSafeUserLocal(db, user),
      investments: userInvestments,
      transactions: userTransactions,
      products: db.products,
      team: teamList,
    } as any;
  }

  // Products: List
  if (path === "/api/products" && method === "GET") {
    return { products: db.products } as any;
  }

  // User: Invest (VIP subscription)
  if (path === "/api/user/invest" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const { productId } = body;
    const product = db.products.find((p: any) => p.id === productId);
    if (!product) {
      throw new Error("Plan d'investissement introuvable.");
    }
    if (user.balance < product.price) {
      throw new Error("Solde insuffisant pour souscrire à ce plan.");
    }

    user.balance -= product.price;
    const newInv = {
      id: generateLocalId("inv"),
      userId: user.id,
      productId: product.id,
      productName: product.name,
      price: product.price,
      dailyIncome: product.dailyIncome,
      durationDays: product.durationDays,
      daysPassed: 0,
      activatedAt: new Date().toISOString(),
      lastClaimAt: new Date().toISOString(),
    };
    db.investments.push(newInv);

    const tx = {
      id: generateLocalId("tx"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: "investment",
      amount: product.price,
      status: "completed",
      date: new Date().toISOString(),
      method: `Achat ${product.name}`,
    };
    db.transactions.push(tx);

    // Multilevel commissions:
    // N1: 20%
    if (user.referrerId) {
      const p1 = db.users.find((u: any) => u.id === user.referrerId);
      if (p1) {
        const commN1 = Math.round(product.price * 0.20);
        p1.balance += commN1;
        p1.commissionEarned += commN1;
        db.transactions.push({
          id: generateLocalId("tx"),
          userId: p1.id,
          userName: p1.name,
          userPhone: p1.phone,
          type: "commission",
          amount: commN1,
          status: "completed",
          date: new Date().toISOString(),
          method: `Com. Parrainage N1 (${user.name})`,
        });

        // N2: 2%
        if (p1.referrerId) {
          const p2 = db.users.find((u: any) => u.id === p1.referrerId);
          if (p2) {
            const commN2 = Math.round(product.price * 0.02);
            p2.balance += commN2;
            p2.commissionEarned += commN2;
            db.transactions.push({
              id: generateLocalId("tx"),
              userId: p2.id,
              userName: p2.name,
              userPhone: p2.phone,
              type: "commission",
              amount: commN2,
              status: "completed",
              date: new Date().toISOString(),
              method: `Com. Parrainage N2 (${user.name})`,
            });

            // N3: 1%
            if (p2.referrerId) {
              const p3 = db.users.find((u: any) => u.id === p2.referrerId);
              if (p3) {
                const commN3 = Math.round(product.price * 0.01);
                p3.balance += commN3;
                p3.commissionEarned += commN3;
                db.transactions.push({
                  id: generateLocalId("tx"),
                  userId: p3.id,
                  userName: p3.name,
                  userPhone: p3.phone,
                  type: "commission",
                  amount: commN3,
                  status: "completed",
                  date: new Date().toISOString(),
                  method: `Com. Parrainage N3 (${user.name})`,
                });
              }
            }
          }
        }
      }
    }

    saveLocalDb(db);
    return { message: "Investissement validé !", investment: newInv, balance: user.balance } as any;
  }

  // User: Claim Revenues (automatic drops done in bg)
  if (path === "/api/user/claim-revenues" && method === "POST") {
    return { message: "Gains collectés avec succès !" } as any;
  }

  // User: Claim Gift Code (Bonus)
  if (path === "/api/user/claim-bonus" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const { code } = body;
    const cleanCode = code.trim().toUpperCase();
    const bonus = db.bonusCodes.find((b: any) => b.code.toUpperCase() === cleanCode);
    if (!bonus) {
      throw new Error("Code cadeau invalide ou expiré.");
    }
    if (!bonus.usedByUsers) bonus.usedByUsers = [];
    if (bonus.usedByUsers.includes(user.id)) {
      throw new Error("Vous avez déjà utilisé ce code cadeau.");
    }
    if (bonus.usedCount >= (bonus.maxUses || 100)) {
      throw new Error("Ce code cadeau a atteint sa limite d'utilisation.");
    }

    user.balance += bonus.amount;
    user.totalRevenue += bonus.amount;
    bonus.usedCount += 1;
    bonus.usedByUsers.push(user.id);

    db.transactions.push({
      id: generateLocalId("tx"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: "bonus",
      amount: bonus.amount,
      status: "completed",
      date: new Date().toISOString(),
      method: `Code Cadeau : ${cleanCode}`,
    });

    saveLocalDb(db);
    return { message: `Félicitations ! Vous avez reçu un bonus de ${bonus.amount} FCFA !`, balance: user.balance } as any;
  }

  // User: Spin Lucky Wheel
  if (path === "/api/user/spin-wheel" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const safeUser = getSafeUserLocal(db, user);
    if (safeUser.spinsAvailable <= 0) {
      throw new Error("Aucun tour disponible. Invitez des filleuls à investir pour obtenir des tours gratuits !");
    }

    const prizes = [
      { amount: 100, label: "100 FCFA", color: "#F59E0B" },
      { amount: 500, label: "500 FCFA", color: "#10B981" },
      { amount: 1000, label: "1 000 FCFA", color: "#3B82F6" },
      { amount: 2000, label: "2 000 FCFA", color: "#8B5CF6" },
      { amount: 5000, label: "5 000 FCFA", color: "#EC4899" },
      { amount: 10000, label: "10 000 FCFA", color: "#EF4444" },
    ];

    const chosenIdx = Math.floor(Math.random() * prizes.length);
    const prize = prizes[chosenIdx];

    user.balance += prize.amount;
    user.totalRevenue += prize.amount;
    user.spinsUsed = (user.spinsUsed || 0) + 1;
    user.lastSpinAt = new Date().toISOString();

    db.transactions.push({
      id: generateLocalId("tx"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: "bonus",
      amount: prize.amount,
      status: "completed",
      date: new Date().toISOString(),
      method: `Roue de la Fortune (Gain: ${prize.label})`,
    });

    saveLocalDb(db);
    return {
      message: `Bravo ! Vous avez gagné ${prize.label} !`,
      prize: { index: chosenIdx, amount: prize.amount, label: prize.label, color: prize.color },
      balance: user.balance,
      lastSpinAt: user.lastSpinAt,
    } as any;
  }

  // User: Submit Deposit
  if (path === "/api/user/deposit" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const { amount, method: depMethod } = body;
    if (!amount || amount <= 0) {
      throw new Error("Montant invalide.");
    }
    const tx = {
      id: generateLocalId("tx"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: "deposit",
      amount: Number(amount),
      status: "pending",
      date: new Date().toISOString(),
      method: depMethod || "Mobile Money",
    };
    db.transactions.push(tx);
    saveLocalDb(db);
    return { message: "Demande de dépôt soumise avec succès ! En attente d'approbation par l'administrateur.", transaction: tx } as any;
  }

  // User: Submit Withdrawal
  if (path === "/api/user/withdraw" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const { amount, method: wtdMethod } = body;
    const wtdAmount = Number(amount);
    if (!wtdAmount || wtdAmount <= 0) {
      throw new Error("Montant de retrait invalide.");
    }
    if (user.balance < wtdAmount) {
      throw new Error("Solde insuffisant pour effectuer ce retrait.");
    }

    user.balance -= wtdAmount;
    const tx = {
      id: generateLocalId("tx"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: "withdrawal",
      amount: wtdAmount,
      status: "pending",
      date: new Date().toISOString(),
      method: wtdMethod || "Mobile Money",
    };
    db.transactions.push(tx);
    saveLocalDb(db);
    return { message: "Demande de retrait soumise avec succès ! Elle sera traitée sous peu.", transaction: tx, balance: user.balance } as any;
  }

  // Global: Notifications
  if (path === "/api/notifications" && method === "GET") {
    return { notifications: db.notifications } as any;
  }

  // Forum: List
  if (path === "/api/forum" && method === "GET") {
    return { posts: db.forumPosts } as any;
  }

  // Forum: Post Evidence
  if (path === "/api/forum" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const { content, screenshots } = body;
    if (!content) {
      throw new Error("Le contenu du message est obligatoire.");
    }
    const newPost = {
      id: generateLocalId("post"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      content: content.trim(),
      screenshots: Array.isArray(screenshots) ? screenshots.slice(0, 2) : [],
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    db.forumPosts.unshift(newPost);
    saveLocalDb(db);
    return { message: "Preuve de retrait publiée sur le forum !", post: newPost } as any;
  }

  // Forum: Like Post
  if (path.startsWith("/api/forum/") && path.endsWith("/like") && method === "POST") {
    const user = getLocalCurrentUser(db);
    const postId = path.split("/")[3];
    const post = db.forumPosts.find((p: any) => p.id === postId);
    if (!post) {
      throw new Error("Post introuvable.");
    }
    if (!post.likedBy) post.likedBy = [];
    const idx = post.likedBy.indexOf(user.id);
    if (idx === -1) {
      post.likedBy.push(user.id);
      post.likes += 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, post.likes - 1);
    }
    saveLocalDb(db);
    return { likes: post.likes, likedBy: post.likedBy } as any;
  }

  // Reviews: Approved List
  if (path === "/api/reviews" && method === "GET") {
    return { reviews: db.userReviews.filter((r: any) => r.status === "approved") } as any;
  }

  // Reviews: Submit Review
  if (path === "/api/reviews" && method === "POST") {
    const user = getLocalCurrentUser(db);
    const { rating, comment } = body;
    if (!rating || !comment) {
      throw new Error("Une note et un commentaire sont requis.");
    }
    const newReview = {
      id: generateLocalId("rev"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    db.userReviews.unshift(newReview);
    saveLocalDb(db);
    return { message: "Merci ! Votre avis a été soumis et est en attente d'approbation.", review: newReview } as any;
  }

  // Admin: Stats Dashboard
  if (path === "/api/admin/stats" && method === "GET") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    
    const usersCount = db.users.length;
    const totalDeposits = db.transactions.filter((t: any) => t.type === "deposit" && t.status === "completed").reduce((s: number, t: any) => s + t.amount, 0);
    const totalWithdrawals = db.transactions.filter((t: any) => t.type === "withdrawal" && t.status === "completed").reduce((s: number, t: any) => s + t.amount, 0);
    const activeInvestmentsCount = db.investments.length;

    return {
      stats: {
        usersCount,
        totalDeposits,
        totalWithdrawals,
        activeInvestmentsCount,
        recentTransactions: db.transactions.slice(-10),
      }
    } as any;
  }

  // Admin: Users list
  if (path.startsWith("/api/admin/users") && method === "GET") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    
    const searchParams = new URLSearchParams(path.split("?")[1] || "");
    const search = searchParams.get("search") || "";
    
    let list = db.users;
    if (search) {
      const q = search.toLowerCase();
      list = db.users.filter((u: any) => u.name.toLowerCase().includes(q) || u.phone.includes(q));
    }
    return { users: list.map((u: any) => getSafeUserLocal(db, u)) } as any;
  }

  // Admin: Block/Unblock user
  if (path === "/api/admin/user/block" && method === "POST") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const { userId, block } = body;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    user.isBlocked = !!block;
    saveLocalDb(db);
    return { message: `Compte ${block ? "bloqué" : "débloqué"} avec succès !` } as any;
  }

  // Admin: Manual Balance Bonus
  if (path === "/api/admin/user/bonus" && method === "POST") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const { userId, amount, reason } = body;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    
    const bonusAmt = Number(amount);
    user.balance += bonusAmt;
    user.totalRevenue += bonusAmt;

    db.transactions.push({
      id: generateLocalId("tx"),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: "bonus",
      amount: bonusAmt,
      status: "completed",
      date: new Date().toISOString(),
      method: reason || "Bonus Administrateur",
    });

    saveLocalDb(db);
    return { message: `Bonus de ${bonusAmt} FCFA accordé avec succès !` } as any;
  }

  // Admin: Transactions history
  if (path === "/api/admin/transactions" && method === "GET") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    return { transactions: db.transactions.slice().reverse() } as any;
  }

  // Admin: Verify Transaction (Approve/Reject)
  if (path === "/api/admin/transactions/verify" && method === "POST") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const { transactionId, action } = body;
    const tx = db.transactions.find((t: any) => t.id === transactionId);
    if (!tx) throw new Error("Transaction introuvable.");

    if (action === "approve") {
      tx.status = "completed";
      if (tx.type === "deposit") {
        const user = db.users.find((u: any) => u.id === tx.userId);
        if (user) {
          user.balance += tx.amount;
          user.totalRevenue += tx.amount;
        }
      }
    } else if (action === "reject") {
      tx.status = "rejected";
      if (tx.type === "withdrawal") {
        // Refund withdrawal balance
        const user = db.users.find((u: any) => u.id === tx.userId);
        if (user) {
          user.balance += tx.amount;
        }
      }
    }
    saveLocalDb(db);
    return { message: `La transaction a été ${action === "approve" ? "approuvée" : "rejetée"} avec succès !` } as any;
  }

  // Admin: Add new VIP product
  if (path === "/api/admin/products/add" && method === "POST") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const newProd = {
      id: generateLocalId("vip"),
      ...body,
      totalIncome: Number(body.dailyIncome) * Number(body.durationDays),
    };
    db.products.push(newProd);
    saveLocalDb(db);
    return { message: "Plan créé avec succès !", product: newProd } as any;
  }

  // Admin: Delete VIP product
  if (path.startsWith("/api/admin/products/") && method === "DELETE") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const id = path.split("/")[4];
    const idx = db.products.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      db.products.splice(idx, 1);
      saveLocalDb(db);
    }
    return { message: "Plan supprimé." } as any;
  }

  // Admin: Generate gift code
  if (path === "/api/admin/bonus-codes/generate" && method === "POST") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const { code, amount, maxUses } = body;
    const upperCode = code.trim().toUpperCase();
    const existing = db.bonusCodes.find((b: any) => b.code === upperCode);
    if (existing) throw new Error("Un code cadeau avec ce nom existe déjà.");
    
    const newCode = {
      id: generateLocalId("code"),
      code: upperCode,
      amount: Number(amount),
      maxUses: Number(maxUses || 100),
      usedCount: 0,
      usedByUsers: [],
      createdAt: new Date().toISOString(),
    };
    db.bonusCodes.push(newCode);
    saveLocalDb(db);
    return { message: `Code cadeau '${upperCode}' créé !`, bonusCode: newCode } as any;
  }

  // Admin: Get gift codes
  if (path === "/api/admin/bonus-codes" && method === "GET") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    return { bonusCodes: db.bonusCodes } as any;
  }

  // Admin: Broadcast notice
  if (path === "/api/admin/notifications/send" && method === "POST") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const { title, content } = body;
    const newNotif = {
      id: generateLocalId("notif"),
      title,
      content,
      date: new Date().toISOString(),
      active: true,
    };
    db.notifications.unshift(newNotif);
    saveLocalDb(db);
    return { message: "Notification diffusée !", notification: newNotif } as any;
  }

  // Admin: All reviews
  if (path === "/api/admin/reviews" && method === "GET") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    return { reviews: db.userReviews } as any;
  }

  // Admin: All investments
  if (path === "/api/admin/investments" && method === "GET") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    return { investments: db.investments } as any;
  }

  // Admin: Verify Review (Approve/Reject)
  if (path.startsWith("/api/admin/reviews/") && path.endsWith("/verify") && method === "POST") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const reviewId = path.split("/")[4];
    const { action } = body;
    const rev = db.userReviews.find((r: any) => r.id === reviewId);
    if (!rev) throw new Error("Avis introuvable.");
    rev.status = action === "approve" ? "approved" : "rejected";
    saveLocalDb(db);
    return { message: "Statut de l'avis mis à jour !", review: rev } as any;
  }

  // Admin: Delete review
  if (path.startsWith("/api/admin/reviews/") && method === "DELETE") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const reviewId = path.split("/")[4];
    const idx = db.userReviews.findIndex((r: any) => r.id === reviewId);
    if (idx !== -1) {
      db.userReviews.splice(idx, 1);
      saveLocalDb(db);
    }
    return { message: "Avis supprimé." } as any;
  }

  // Admin: Edit User details
  if (path.startsWith("/api/admin/users/") && method === "PUT") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const userId = path.split("/")[4];
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    
    const { name, phone, balance, referralCode, commissionEarned, isBlocked, password } = body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (balance !== undefined) user.balance = Number(balance);
    if (referralCode !== undefined) user.referralCode = referralCode;
    if (commissionEarned !== undefined) user.commissionEarned = Number(commissionEarned);
    if (isBlocked !== undefined) user.isBlocked = !!isBlocked;
    if (password !== undefined) user.passwordHash = password;

    saveLocalDb(db);
    return { message: "Compte mis à jour avec succès !", user } as any;
  }

  // Admin: Delete user
  if (path.startsWith("/api/admin/users/") && method === "DELETE") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const userId = path.split("/")[4];
    const idx = db.users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      db.users.splice(idx, 1);
      saveLocalDb(db);
    }
    return { message: "Compte supprimé." } as any;
  }

  // Admin: Edit VIP Product
  if (path.startsWith("/api/admin/products/") && method === "PUT") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const productId = path.split("/")[4];
    const prod = db.products.find((p: any) => p.id === productId);
    if (!prod) throw new Error("Plan introuvable.");

    Object.assign(prod, body);
    prod.totalIncome = Number(prod.dailyIncome) * Number(prod.durationDays);
    saveLocalDb(db);
    return { message: "Plan mis à jour !", product: prod } as any;
  }

  // Admin: Delete Investment (Subscribed VIP)
  if (path.startsWith("/api/admin/investments/") && method === "DELETE") {
    const admin = getLocalCurrentUser(db);
    if (admin.role !== "admin") throw new Error("Accès refusé.");
    const id = path.split("/")[4];
    const idx = db.investments.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      db.investments.splice(idx, 1);
      saveLocalDb(db);
    }
    return { message: "Investissement supprimé." } as any;
  }

  // Admin: Local fallback mock for sync (returns local db for offline use)
  if (path === "/api/admin/sync" && method === "POST") {
    return {
      message: "Synchronisation simulée en local (mode hors-ligne)",
      details: { addedUsersCount: 0, addedTransactionsCount: 0, addedInvestmentsCount: 0, addedReviewsCount: 0, addedForumPostsCount: 0 },
      db: db
    } as any;
  }

  throw new Error(`Route locale inconnue: ${path}`);
}

// Perform automated fetch with auth header
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (useLocalFallback && path !== "/api/admin/sync") {
    try {
      return await handleLocalRequest<T>(path, options);
    } catch (localErr) {
      console.error("Local request handler failed, retrying server:", localErr);
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    console.warn("API request failed, falling back to Local Database:", err);
    useLocalFallback = true;
    try {
      localStorage.setItem("dreampod_use_local_fallback", "true");
    } catch (e) {}
    return handleLocalRequest<T>(path, options);
  }

  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn("JSON parsing failed (possibly auth redirect or server offline), falling back to Local Database:", e);
    useLocalFallback = true;
    try {
      localStorage.setItem("dreampod_use_local_fallback", "true");
    } catch (err2) {}
    return handleLocalRequest<T>(path, options);
  }

  if (path === "/api/admin/sync" && response.ok) {
    useLocalFallback = false;
    try {
      localStorage.setItem("dreampod_use_local_fallback", "false");
    } catch (e) {}
  }

  if (!response.ok) {
    // If it's a 404 (route not found - e.g. purely static hosting) or a 5xx server/gateway error, fall back to local database simulation
    if (response.status === 404 || response.status >= 500) {
      console.warn(`Server status ${response.status}, falling back to Local Database simulation`);
      useLocalFallback = true;
      try {
        localStorage.setItem("dreampod_use_local_fallback", "true");
      } catch (err3) {}
      return handleLocalRequest<T>(path, options);
    }
    const errMsg = json.error || json.message || "Une erreur est survenue lors de la communication.";
    const err = new Error(errMsg) as any;
    err.status = response.status;
    throw err;
  }

  return json as T;
}

export const api = {
  // Auth
  register: (data: any) => request<any>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: any) => request<any>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  
  // User Profile
  getProfile: () => request<{ user: User }>("/api/user/profile"),
  changePassword: (data: any) => request<any>("/api/user/change-password", { method: "POST", body: JSON.stringify(data) }),
  getStats: () => request<{ user: User; investments: Investment[]; transactions: Transaction[]; products: Product[]; team: TeamMember[] }>("/api/user/stats"),
  
  // Products
  getProducts: () => request<{ products: Product[] }>("/api/products"),
  invest: (productId: string) => request<{ message: string; investment: Investment; balance: number }>("/api/user/invest", {
    method: "POST",
    body: JSON.stringify({ productId }),
  }),
  claimRevenues: () => request<any>("/api/user/claim-revenues", { method: "POST" }),
  claimBonusCode: (code: string) => request<any>("/api/user/claim-bonus", {
    method: "POST",
    body: JSON.stringify({ code }),
  }),
  spinWheel: () => request<{ message: string; prize: { index: number; amount: number; label: string; color: string }; balance: number; lastSpinAt: string }>("/api/user/spin-wheel", {
    method: "POST"
  }),
  
  // Transactions
  deposit: (amount: number, method: string) => request<any>("/api/user/deposit", {
    method: "POST",
    body: JSON.stringify({ amount, method }),
  }),
  withdraw: (amount: number, method: string) => request<any>("/api/user/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount, method }),
  }),

  // Notifications
  getNotifications: () => request<{ notifications: GlobalNotification[] }>("/api/notifications"),

  // Forum API
  getForumPosts: () => request<{ posts: ForumPost[] }>("/api/forum"),
  createForumPost: (content: string, screenshots: string[]) => request<any>("/api/forum", {
    method: "POST",
    body: JSON.stringify({ content, screenshots }),
  }),
  likeForumPost: (postId: string) => request<any>(`/api/forum/${postId}/like`, {
    method: "POST",
  }),

  // User Reviews API
  getReviews: () => request<{ reviews: UserReview[] }>("/api/reviews"),
  submitReview: (rating: number, comment: string) => request<any>("/api/reviews", {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  }),

  // --- ADMIN API ---
  admin: {
    getStats: () => request<{ stats: any }>("/api/admin/stats"),
    getUsers: (search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      return request<{ users: any[] }>(`/api/admin/users${q}`);
    },
    blockUser: (userId: string, block: boolean) => request<any>("/api/admin/user/block", {
      method: "POST",
      body: JSON.stringify({ userId, block }),
    }),
    addUserBonus: (userId: string, amount: number, reason?: string) => request<any>("/api/admin/user/bonus", {
      method: "POST",
      body: JSON.stringify({ userId, amount, reason }),
    }),
    getTransactions: () => request<{ transactions: Transaction[] }>("/api/admin/transactions"),
    verifyTransaction: (transactionId: string, action: "approve" | "reject") => request<any>("/api/admin/transactions/verify", {
      method: "POST",
      body: JSON.stringify({ transactionId, action }),
    }),
    addProduct: (product: any) => request<any>("/api/admin/products/add", {
      method: "POST",
      body: JSON.stringify(product),
    }),
    deleteProduct: (id: string) => request<any>(`/api/admin/products/${id}`, { method: "DELETE" }),
    generateBonusCode: (code: string, amount: number, maxUses?: number) => request<any>("/api/admin/bonus-codes/generate", {
      method: "POST",
      body: JSON.stringify({ code, amount, maxUses }),
    }),
    getBonusCodes: () => request<{ bonusCodes: BonusCode[] }>("/api/admin/bonus-codes"),
    sendNotification: (title: string, content: string) => request<any>("/api/admin/notifications/send", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    }),
    getReviews: () => request<{ reviews: UserReview[] }>("/api/admin/reviews"),
    getInvestments: () => request<{ investments: Investment[] }>("/api/admin/investments"),
    verifyReview: (reviewId: string, action: "approve" | "reject") => request<any>(`/api/admin/reviews/${reviewId}/verify`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),
    deleteReview: (reviewId: string) => request<any>(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
    }),
    updateUser: (userId: string, data: any) => request<any>(`/api/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    deleteUser: (userId: string) => request<any>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    }),
    updateProduct: (productId: string, data: any) => request<any>(`/api/admin/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    deleteInvestment: (id: string) => request<any>(`/api/admin/investments/${id}`, {
      method: "DELETE",
    }),
    sync: (data: any) => request<{ message: string; details: any; db: any }>("/api/admin/sync", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  }
};

export function getLocalDbExport() {
  return getLocalDb();
}

export function saveLocalDbExport(db: any) {
  saveLocalDb(db);
}

export function getUseLocalFallback() {
  return useLocalFallback;
}

export function setUseLocalFallback(val: boolean) {
  useLocalFallback = val;
  try {
    localStorage.setItem("dreampod_use_local_fallback", val ? "true" : "false");
  } catch (e) {}
}
