export interface AffiliateUser {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  referralCode: string;
  totalClicks: number;
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateReferral {
  id: string;
  referralCode: string;
  referrerId: string;
  visitorId?: string;
  referredUserId?: string;
  referredUserEmail?: string;
  referredUserName?: string;
  orderId?: string;
  orderTotal?: number;
  commissionAmount?: number;
  status: 'pending' | 'clicked' | 'registered' | 'ordered' | 'approved' | 'rejected' | 'paid' | 'purchased';
  clickedAt?: string;
  registeredAt?: string;
  orderedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  referralId: string;
  orderId: string;
  orderTotal: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  paidBy?: string;
  notes?: string;
}

export interface AffiliateSettings {
  id: string;
  defaultCommissionRate: number; // Percentage (e.g., 5 for 5%)
  minPayoutAmount: number; // Minimum amount for payout
  payoutMethods: string[]; // Available payout methods
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateStats {
  totalClicks: number;
  totalReferrals: number;
  totalOrders: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  conversionRate: number;
}

export interface AffiliateFollower {
  id: string;
  affiliateId: string;
  userId: string;
  email: string;
  displayName: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  createdAt: string;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  processedBy?: string;
  completedBy?: string;
  rejectedBy?: string;
  notes?: string;
}

export interface AffiliateMonthlyStats {
  month: string; // Format: YYYY-MM
  totalClicks: number;
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  conversionRate: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  processedBy?: string;
  completedBy?: string;
  rejectedBy?: string;
  notes?: string;
}