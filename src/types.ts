/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number; // in FCFA
  dailyRevenue: number;
  totalRevenue: number;
  referralCode: string;
  referrerId?: string;
  referralsCount: number;
  referralsN1: number;
  referralsN2: number;
  referralsN3: number;
  commissionEarned: number;
  registeredAt: string;
  isBlocked: boolean;
  role: 'user' | 'admin';
  lastSpinAt?: string;
  spinsUsed?: number;
  spinsAvailable?: number;
  investedReferralsCount?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  dailyIncome: number;
  durationDays: number;
  totalIncome: number;
  level: number; // VIP level
  category?: 'stability' | 'wellbeing' | 'activity';
  isBlocked?: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  dailyIncome: number;
  durationDays: number;
  daysPassed: number;
  activatedAt: string;
  lastClaimAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userPhone?: string;
  userName?: string;
  type: 'deposit' | 'withdrawal' | 'commission' | 'bonus' | 'investment';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  method?: string; // MTN Mobile Money, Orange Money, etc.
}

export interface BonusCode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  usedByUsers: string[]; // List of user IDs who claimed it
  createdAt: string;
}

export interface GlobalNotification {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  content: string;
  screenshots: string[]; // Up to 2 screenshot base64 images
  likes: number;
  likedBy: string[]; // list of userIds
  createdAt: string;
}

export interface UserReview {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  level: number; // 1, 2, or 3
  registeredAt: string;
  totalInvested: number;
}


