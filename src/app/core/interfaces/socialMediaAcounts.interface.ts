export interface SocialMediaAccount {
  platform: string;
  connected: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface FacebookPage {
  id: string;
  name: string;
  instagramId: string | null;
  instagramUsername: string | null;
  selected: boolean;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  active: boolean;
  selected: boolean;
}

export interface WalletData {
  walletId: string;
  user: {
    userId: string;
    name: string;
    email: string;
    mobileNumber: string;
    isDigital: boolean;
  };
  balanceCoins: number;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionItem {
  walletTransactionId: string;
  type: 'DEBIT' | 'CREDIT';
  amountCoins: number;
  referenceType: 'CAMPAIGN' | 'REFUND' | 'RECHARGE';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

export interface WalletHistoryResponse {
  success: boolean;
  data: WalletTransactionItem[];
}

/**
 * The dedicated ad-spend budget — separate from the Wallet above. Money paid
 * in here funds running/boosting ads on Facebook or Google; it is its own
 * account, not shared with the Wallet balance shown elsewhere in the app.
 */
export interface AdBudgetData {
  adBudgetId: string;
  balanceAmount: number;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** This month's content usage against the plan's post/video quota, used to show the upgrade banner once it's hit. */
export interface ContentQuotaStatus {
  hasQuota: boolean;
  planName: string | null;
  postLimit: number | null;
  videoLimit: number | null;
  postsUsed: number;
  videosUsed: number;
  postLimitReached: boolean;
  videoLimitReached: boolean;
  limitReached: boolean;
}

export interface AdBudgetTransactionItem {
  adBudgetTransactionId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  referenceType: 'AD_SPEND' | 'REFUND' | 'RECHARGE';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

export interface AdBudgetHistoryResponse {
  success: boolean;
  data: AdBudgetTransactionItem[];
}

export interface AdBudgetOrderResult {
  adBudgetId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number; // paise
  amountInRupees: number;
  currency: string;
  transactionId: string;
}

export interface AdBudgetOrderResponse {
  success: boolean;
  message: string;
  data: AdBudgetOrderResult;
}

export interface AdBudgetVerifyResult {
  adBudgetId: string;
  balanceAmount: number;
  amountAdded: number;
  transactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

export interface AdBudgetVerifyResponse {
  success: boolean;
  message: string;
  data: AdBudgetVerifyResult;
}

export interface AdBudgetVerifyPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}


export interface GeneratedContentItem {
  id: string;
  userId: string;
  calendarId: string;
  activityId: string;
  activityType: string | null;
  platform: string | null;
  contentType: string | null;
  productId: string | null;
  productName: string | null;
  businessData: any;
  productData: any;
  prompt: string | null;
  generatedContent: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  storagePath: string | null;
  aiResponse: any;
  status: string;
  /** The real flag the backend sets (`isActive` above is not a field the API returns). */
  active?: boolean;
  isActive?: boolean;
  errorMessage: string | null;
  retryCount: number;
  approvedBy: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  publishedUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedContentResponse {
  userId: string;
  total: number;
  startDate?: string;
  endDate?: string;
  data: GeneratedContentItem[];
}