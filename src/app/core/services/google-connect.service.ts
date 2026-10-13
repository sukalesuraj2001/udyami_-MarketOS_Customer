import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { firstValueFrom } from 'rxjs';

import {
  GoogleConnection,
  GoogleProduct,
  Ga4PropertyList,
  GoogleAnalyticsReport,
} from '@app/core/interfaces/google.interface';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { environment } from '@env/environment';

/**
 * Google Analytics 4 and YouTube, connected through Google's own sign-in.
 * Each product asks only for its own permissions.
 */
@Injectable({ providedIn: 'root' })
export class GoogleConnectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Opens Google's consent screen. Google refuses sign-in inside an app's
   * WebView, so the phone app uses the system browser and comes back through
   * the com.jyovix.marketos:// deep link; the web app just navigates.
   */
  async connect(product: GoogleProduct): Promise<void> {
    const native = Capacitor.isNativePlatform();

    // Fresh single-use URL on every tap (valid 10 minutes).
    const { url } = await firstValueFrom(
      this.http.get<{ url: string }>(`${this.baseUrl}${API_ENDPOINTS.GOOGLE.OAUTH_CONNECT}`, {
        params: { product: product.toLowerCase(), client: native ? 'app' : 'web' },
      })
    );

    if (native) {
      await Browser.open({ url });
    } else {
      window.location.href = url;
    }
  }

  getConnections() {
    return this.http.get<GoogleConnection[]>(`${this.baseUrl}${API_ENDPOINTS.GOOGLE.CONNECTIONS}`);
  }

  getProperties() {
    return this.http.get<Ga4PropertyList>(`${this.baseUrl}${API_ENDPOINTS.GOOGLE.ANALYTICS_PROPERTIES}`);
  }

  getAnalyticsReport() {
    return this.http.get<GoogleAnalyticsReport>(`${this.baseUrl}${API_ENDPOINTS.GOOGLE.ANALYTICS_REPORT}`);
  }

  selectProperty(propertyId: string) {
    return this.http.post<{ propertyId: string; displayName: string; accountName: string }>(
      `${this.baseUrl}${API_ENDPOINTS.GOOGLE.ANALYTICS_SELECT_PROPERTY}`,
      { propertyId }
    );
  }

  disconnect(product: GoogleProduct) {
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}${API_ENDPOINTS.GOOGLE.DISCONNECT(product.toLowerCase())}`
    );
  }
}
