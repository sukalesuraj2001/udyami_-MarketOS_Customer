export interface SocialMediaAccount {
  platform: string;
  connected: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  data: GeneratedContentItem[];
}