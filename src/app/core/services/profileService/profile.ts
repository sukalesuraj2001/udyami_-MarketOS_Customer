import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SocialMediaAccount, WalletData } from '@app/core/interfaces/socialMediaAcounts.interface';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { environment } from '@env/environment';

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UserProfile {
  name: string;
  profile?: {
    profileImage?: string | null;
    selectedBusinessVertical?: string | null;
    businessDetails?: {
      businessName?: string | null;
    } | null;
  } | null;
}

export interface SocialMediaAccountPayload {
  userId: string;
  platform: string;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class Profile {

  constructor(private http: HttpClient) { }

  /**
   * Get logged-in user's ID from localStorage
   */
  private getUserId(): string {
    const stored = localStorage.getItem('marketos.auth');

    if (!stored) {
      throw new Error('User is not logged in.');
    }

    const authData = JSON.parse(stored);
    const userId = authData?.user?.userId;

    if (!userId) {
      throw new Error('User ID not found.');
    }

    return userId;
  }

  /**
   * Get user profile
   */
  getUserProfileData() {
    const userId = this.getUserId();

    return this.http.get<UserProfileResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.USER.GET_USER_BY_ID(userId)}`
    );
  }

  /**
   * Connect social media account
   */
  connectSocialMediaAccount(
    platform: string,
    username: string,
    password: string
  ) {
    const userId = this.getUserId();

    const payload: SocialMediaAccountPayload = {
      userId,
      platform,
      username,
      password,
    };

    return this.http.post(
      `${environment.apiUrl}${API_ENDPOINTS.PROFILE.ADD_SOCIAL_ACCOUNT}`,
      payload
    );
  }

  getUserSocialMediaAccount() {
    const userId = this.getUserId();

    return this.http.get<SocialMediaAccount[]>(
      `${environment.apiUrl}${API_ENDPOINTS.PROFILE.GET_USER_SOCIAL_ACCOUNT(userId)}`
    );
  }

  // get user wallet amount 

  /**
 * Get logged-in user's wallet data
 */
  getUserWalletData() {
    const userId = this.getUserId();

    return this.http.get<WalletData>(
      `${environment.apiUrl}${API_ENDPOINTS.WALLET.GET_WALLET_DATA(userId)}`
    );
  }
}