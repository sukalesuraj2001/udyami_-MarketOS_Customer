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

export interface BusinessDetails {
  sector?: string | null;
  businessName?: string | null;
  businessType?: string | null;
  gstNumber?: string | null;
  registrationNumber?: string | null;
  ownerName?: string | null;
  establishedYear?: number | string | null;
  employees?: number | string | null;
  annualTurnover?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  website?: string | null;
  email?: string | null;
  businessMobile?: string | null;
  [key: string]: unknown;
}

/** Fields accepted by /userprofile/createUserProfile, as returned under `profile`. */
export interface UserProfileDetails {
  username?: string | null;
  gender?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  alternateMobile?: string | null;
  homeAddress?: string | null;
  officeAddress?: string | null;
  state?: string | null;
  district?: string | null;
  assembly?: string | null;
  ward?: string | null;
  pincode?: string | null;
  familyCount?: number | string | null;
  children?: string | string[] | null;
  interests?: string | string[] | null;
  hobbies?: string | string[] | null;
  selectedBusinessVertical?: string | null;
  hasBusiness?: boolean | string | null;
  profileImage?: string | null;
  businessImages?: string | string[] | null;
  businessDetails?: BusinessDetails | null;
  [key: string]: unknown;
}

export interface UserProfile {
  name: string;
  email?: string | null;
  mobileNumber?: string | null;
  homeLocation?: string | null;
  businessLocation?: string | null;
  hasBusiness?: boolean | null;
  profile?: UserProfileDetails | null;
  [key: string]: unknown;
}

/** Text fields of the createUserProfile multipart body. */
export interface CreateUserProfilePayload {
  username: string;
  gender: string;
  email: string;
  mobileNumber: string;
  alternateMobile: string;
  homeAddress: string;
  officeAddress: string;
  state: string;
  district: string;
  assembly: string;
  ward: string;
  pincode: string;
  familyCount: number | null;
  children: string;
  interests: string;
  hobbies: string;
  selectedBusinessVertical: string;
  hasBusiness: boolean;
  /** Serialised as JSON in the multipart body. */
  businessDetails: Record<string, unknown> | null;
}

export interface CreateUserProfileFiles {
  profileImage?: File | null;
  /** Gallery, logo and product images — all sent as `businessImages`. */
  businessImages?: File[];
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
   * Create the user's profile (multipart: text fields + optional images)
   */
  createUserProfile(payload: CreateUserProfilePayload, files: CreateUserProfileFiles = {}) {
    const form = new FormData();
    form.append('userId', this.getUserId());

    for (const [key, value] of Object.entries(payload)) {
      if (key === 'businessDetails') {
        continue;
      }
      form.append(key, value === null || value === undefined ? '' : String(value));
    }

    if (payload.hasBusiness && payload.businessDetails) {
      form.append('businessDetails', JSON.stringify(payload.businessDetails));
    }

    form.append('profileImage', files.profileImage ?? '');
    for (const image of files.businessImages ?? []) {
      form.append('businessImages', image);
    }

    return this.http.post<{ success?: boolean; message?: string }>(
      `${environment.apiUrl}${API_ENDPOINTS.USER_PROFILE.CREATE}`,
      form
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