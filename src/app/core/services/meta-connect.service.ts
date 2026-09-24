import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { FacebookPage, MetaAdAccount } from '@app/core/interfaces/socialMediaAcounts.interface';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { environment } from '@env/environment';

/**
 * Facebook / Instagram / Meta Ads connection through Meta's OAuth login.
 * Replaces the manual username/password form for these platforms.
 */
@Injectable({ providedIn: 'root' })
export class MetaConnectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Single-use Meta login URL, valid for 10 minutes. Request a fresh one on every click. */
  getConnectUrl() {
    return this.http.get<{ url: string }>(`${this.baseUrl}${API_ENDPOINTS.FACEBOOK.OAUTH_CONNECT}`);
  }

  getPages() {
    return this.http.get<FacebookPage[]>(`${this.baseUrl}${API_ENDPOINTS.FACEBOOK.PAGES}`);
  }

  selectPage(pageId: string) {
    return this.http.post<{ pageId: string; pageName: string; instagramId: string | null }>(
      `${this.baseUrl}${API_ENDPOINTS.FACEBOOK.SELECT_PAGE}`,
      { pageId }
    );
  }

  getAdAccounts() {
    return this.http.get<MetaAdAccount[]>(`${this.baseUrl}${API_ENDPOINTS.FACEBOOK.AD_ACCOUNTS}`);
  }

  selectAdAccount(adAccountId: string) {
    return this.http.post<{ adAccountId: string; name: string }>(
      `${this.baseUrl}${API_ENDPOINTS.FACEBOOK.SELECT_AD_ACCOUNT}`,
      { adAccountId }
    );
  }

  disconnect() {
    return this.http.delete<{ success: boolean; removed: number }>(
      `${this.baseUrl}${API_ENDPOINTS.FACEBOOK.DISCONNECT}`
    );
  }
}
