import { computed, Injectable, signal } from '@angular/core';
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

  constructor(
    private readonly http: HttpClient,
    private readonly alertController: AlertController,
  ) { }

  load(): void {
    void this.refresh();
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
      buttons: [{ text: 'Close', role: 'cancel' }],
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