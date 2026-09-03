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