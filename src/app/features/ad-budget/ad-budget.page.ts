import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertController, IonicModule } from '@ionic/angular';

import { AdBudgetService } from '@core/services/ad-budget.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { RazorpayCheckoutService } from '@core/services/razorpay-checkout.service';
import { AdBudgetTransactionItem } from '@core/interfaces/socialMediaAcounts.interface';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { MenuButtonComponent } from '@shared/components/menu-button/menu-button.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

@Component({
  selector: 'app-ad-budget',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, IonicModule, ThemeToggleComponent, MenuButtonComponent],
  templateUrl: './ad-budget.page.html',
  styleUrls: ['./ad-budget.page.scss'],
})
export class AdBudgetPage {
  private readonly adBudgetService = inject(AdBudgetService);
  private readonly auth = inject(AuthService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toast = inject(ToastService);
  private readonly razorpay = inject(RazorpayCheckoutService);

  readonly balance = signal<number | null>(null);
  readonly balanceLoading = signal(true);
  readonly history = signal<AdBudgetTransactionItem[]>([]);
  readonly historyLoading = signal(true);
  readonly processing = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly spentThisMonth = computed(() => {
    const now = new Date();
    return this.history()
      .filter((t) => {
        if (t.type !== 'DEBIT' || t.status !== 'SUCCESS') return false;
        const d = new Date(t.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);
  });

  ionViewWillEnter(): void {
    this.errorMessage.set(null);
    this.loadBudget();
    this.loadHistory();
  }

  formatInr(value: number): string {
    return Math.round(value).toLocaleString('en-IN');
  }

  tagForTransaction(t: AdBudgetTransactionItem): 'ok' | 'pend' | 'no' {
    if (t.status === 'SUCCESS') return 'ok';
    if (t.status === 'PENDING') return 'pend';
    return 'no';
  }

  private loadBudget(): void {
    this.balanceLoading.set(true);
    this.adBudgetService.getAdBudget().subscribe({
      next: (budget) => {
        this.balance.set(budget?.balanceAmount ?? 0);
        this.balanceLoading.set(false);
      },
      error: () => {
        // A brand-new account has no ad budget row yet — treat as ₹0, not an error.
        this.balance.set(0);
        this.balanceLoading.set(false);
      },
    });
  }

  private loadHistory(): void {
    this.historyLoading.set(true);
    this.adBudgetService.getAdBudgetHistory().subscribe({
      next: (response) => {
        this.history.set(response?.data ?? []);
        this.historyLoading.set(false);
      },
      error: () => {
        this.history.set([]);
        this.historyLoading.set(false);
      },
    });
  }

  async changeBudget(): Promise<void> {
    if (this.processing()) return;

    const alert = await this.alertCtrl.create({
      header: 'Add to your ad budget',
      message: 'This goes straight to Facebook or Google — Jyovix takes no share of it.',
      cssClass: 'mk-alert',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount in ₹',
          min: 1,
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Continue',
          role: 'confirm',
          handler: (data: { amount?: string }) => {
            const amount = Number(data?.amount);
            if (!Number.isFinite(amount) || amount < 1) {
              void this.toast.show('Enter a valid amount', 'Amount must be at least ₹1.', 'no');
              return false;
            }
            void this.purchase(Math.round(amount));
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async purchase(amount: number): Promise<void> {
    this.processing.set(true);
    this.errorMessage.set(null);

    try {
      const order = await this.adBudgetService.createOrder(amount);
      const user = this.auth.storedLogin?.user;

      const result = await this.razorpay.open({
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        orderId: order.razorpayOrderId,
        name: 'Jyovix Marketing',
        description: 'Ad budget recharge',
        prefillName: user?.name,
        prefillEmail: user?.email,
      });

      if (!result) {
        // user dismissed the Razorpay modal — nothing to verify
        return;
      }

      const verified = await this.adBudgetService.verifyPayment({
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });

      this.balance.set(verified.balanceAmount);
      await this.toast.show('Budget updated', `₹${this.formatInr(verified.amountAdded)} added to your ad budget.`, 'ok');
      this.loadHistory();
    } catch (error) {
      const message = this.readError(error);
      this.errorMessage.set(message);
      await this.toast.show('Could not update budget', message, 'no');
    } finally {
      this.processing.set(false);
    }
  }

  private readError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
    const message = error instanceof HttpErrorResponse
      ? error.error?.message
      : (error as Error)?.message;
    return (Array.isArray(message) ? message.join(' ') : message) || fallback;
  }
}
