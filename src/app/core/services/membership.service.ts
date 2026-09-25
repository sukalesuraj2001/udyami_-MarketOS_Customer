import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';

interface DigitalUserDataResponse {
  success: boolean;
  message: string;
  data: {
    isDigital: boolean;
    wallet?: {
      balanceCoins: number;
    };
  };
}

export interface ActivateMembershipResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export const MEMBERSHIP_PAGE_URL = '/tabs/membership';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly isDigital = signal(false);
  private readonly balanceCoins = signal(0);
  readonly loaded = signal(false);
  readonly membershipActive = computed(() =>
    this.isDigital() && this.balanceCoins() > 0
  );
  readonly walletCoins = this.balanceCoins.asReadonly();
  readonly canUsePaidActions = computed(() =>
    this.isDigital() && this.balanceCoins() > 0
  );

  private readonly router = inject(Router);

  constructor(
    private readonly http: HttpClient,
    private readonly alertController: AlertController,
  ) { }

  load(): void {
    void this.refresh();
  }

  /** Re-fetches membership status; every page reading these signals updates. */
  reload(): Promise<void> {
    return this.refresh();
  }

  /**
   * Activates the digital membership, then reloads the status so every page
   * unlocks paid actions straight away.
   */
  async activate(amount: number): Promise<ActivateMembershipResponse> {
    const userId = this.getUserId();

    if (!userId) {
      throw new Error('User is not logged in.');
    }

    const response = await firstValueFrom(
      this.http.post<ActivateMembershipResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.MEMBERSHIP.ACTIVATE_DIGITAL_USER}`,
        { userId, amount }
      )
    );

    if (response?.success === false) {
      throw new Error(response.message || 'Unable to activate membership.');
    }

    await this.refresh();
    return response;
  }

  openMembershipPage(): void {
    void this.router.navigateByUrl(MEMBERSHIP_PAGE_URL);
  }

  async requireActiveMembership(): Promise<boolean> {
    await this.refresh();

    if (this.membershipActive()) {
      return true;
    }

    await this.showRenewalPrompt();
    return false;
  }

  async showRenewalPrompt(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Renew membership',
      message: this.balanceCoins() > 0
        ? 'Your digital membership is inactive. Please renew to continue.'
        : 'Your wallet has 0 coins. Please renew your membership to continue.',
      buttons: [
        { text: 'Not now', role: 'cancel' },
        { text: 'View plans', handler: () => this.openMembershipPage() },
      ],
      cssClass: 'mk-alert',
    });

    await alert.present();
  }

  private async refresh(): Promise<void> {
    const userId = this.getUserId();

    if (!userId) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<DigitalUserDataResponse>(
          `${environment.apiUrl}${API_ENDPOINTS.USER.GET_DIGITAL_USER_DATA(userId)}`
        )
      );
      this.isDigital.set(response.data?.isDigital === true);
      this.balanceCoins.set(response.data?.wallet?.balanceCoins ?? 0);
      this.loaded.set(true);
    } catch (error) {
      console.error('Failed to load membership status:', error);
      this.isDigital.set(false);
      this.balanceCoins.set(0);
      this.loaded.set(true);
    }
  }

  private getUserId(): string | null {
    const stored = localStorage.getItem('marketos.auth');

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored)?.user?.userId || null;
    } catch {
      return null;
    }
  }
}