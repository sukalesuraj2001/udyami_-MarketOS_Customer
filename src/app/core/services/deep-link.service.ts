import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const SCHEME = 'com.jyovix.marketos:';

/**
 * Brings the member back into the app after signing in with Google in the
 * system browser: com.jyovix.marketos://settings?platform=youtube&status=…
 * closes the browser and opens Settings with the result.
 */
@Injectable({ providedIn: 'root' })
export class DeepLinkService {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private started = false;

  init(): void {
    if (this.started || !Capacitor.isNativePlatform()) {
      return;
    }
    this.started = true;

    App.addListener('appUrlOpen', ({ url }) => {
      if (!url?.startsWith(SCHEME)) {
        return;
      }

      // "com.jyovix.marketos://settings?x=1" → host "settings", query "x=1"
      const parsed = new URL(url.replace(SCHEME, 'https:'));
      const target = parsed.host === 'settings' ? '/tabs/settings' : '/tabs/dashboard';
      const queryParams: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => (queryParams[key] = value));

      Browser.close().catch(() => undefined);
      this.zone.run(() => this.router.navigate([target], { queryParams }));
    });
  }
}
