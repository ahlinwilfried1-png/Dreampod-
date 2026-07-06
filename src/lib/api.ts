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

// Determine if we need to call the remote Cloud Run URL (such as when running on Vercel)
const getApiBase = (): string => {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname;
  
  // If we are already on localhost, or on the Cloud Run domain directly, we use relative paths
  if (
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    hostname.includes("run.app")
  ) {
    return "";
  }
  
  // Otherwise (e.g. on Vercel or any other external domains), point to our live backend
  return (import.meta as any).env.VITE_API_URL || BACKEND_URL;
};

const API_BASE = getApiBase();

// Perform automated fetch with auth header
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error("Erreur de réponse du serveur.");
  }

  if (!response.ok) {
    throw new Error(json.error || json.message || "Une erreur est survenue lors de la communication.");
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
  }
};
