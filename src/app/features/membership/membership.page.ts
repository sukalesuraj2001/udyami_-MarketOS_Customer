import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';

import {
  MembershipPlan,
  MembershipService,
  PlanSplitId,
  PLAN_SPLITS,
  tierIdOf,
} from '@core/services/membership.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { MenuButtonComponent } from '@shared/components/menu-button/menu-button.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

interface ConfettiPiece {
  x: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
}

interface SplitTierView {
  tierId: string;
  plan: MembershipPlan;
}

interface SplitView {
  id: PlanSplitId;
  name: string;
  splitLabel: string;
  aiShare: number;
  blurb: string;
  humanNote: string;
  tiers: SplitTierView[];
  selectedPlan: MembershipPlan | null;
}

const TIER_ORDER = ['BASIC', 'PRIME', 'PREMIUM'];

/** One badge icon per split — the three tiers within a split share it. */
const SPLIT_ICON: Record<PlanSplitId, string> = {
  auto: 'rocket-outline',
  balanced: 'diamond-outline',
  studio: 'trophy-outline',
};

const CONFETTI_COLORS = ['#d4a438', '#f0ce7a', '#b8862a', '#1f8f5f', '#ffffff', '#2a6fa8'];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: string, handler: (response: unknown) => void): void;
    };
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, IonicModule, ThemeToggleComponent, MenuButtonComponent],
  templateUrl: './membership.page.html',
  styleUrls: ['./membership.page.scss'],
})
export class MembershipPage implements OnDestroy {
  readonly membership = inject(MembershipService);
  private readonly auth = inject(AuthService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** planId of the card currently mid-purchase, for a per-card spinner. */
  readonly payingPlanId = signal<string | null>(null);
  readonly activated = signal(false);
  readonly activatedPlanName = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly lastPaymentId = signal<string | null>(null);
  readonly downloadingReceiptId = signal<string | null>(null);

  readonly confetti: ConfettiPiece[] = Array.from({ length: 36 }, (_, i) => ({
    x: Math.round(Math.random() * 100),
    delay: Math.round(Math.random() * 400),
    duration: 1600 + Math.round(Math.random() * 1400),
    rotate: Math.round(Math.random() * 720 - 360),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));

  /** Which tier (Basic/Prime/Premium) is showing within each split's card. */
  private readonly selectedTierBySplit = signal<Partial<Record<PlanSplitId, string>>>({});

  /** The 3 splits, each with whichever of its 3 tiers actually exist in the DB. */
  readonly splitViews = computed<SplitView[]>(() => {
    const plans = this.membership.marketingPlans();
    const chosen = this.selectedTierBySplit();

    return PLAN_SPLITS.map((split): SplitView => {
      const tiers: SplitTierView[] = TIER_ORDER
        .map((tierId) => plans.find((p) => p.membershipType === `${split.prefix}${tierId}`))
        .filter((plan): plan is MembershipPlan => !!plan)
        .map((plan) => ({ tierId: tierIdOf(plan.membershipType), plan }));

      const activeTierId = chosen[split.id]
        ?? tiers.find((t) => t.plan.isPopular)?.tierId
        ?? tiers[0]?.tierId
        ?? null;

      return {
        ...split,
        tiers,
        selectedPlan: tiers.find((t) => t.tierId === activeTierId)?.plan ?? null,
      };
    }).filter((view) => view.tiers.length > 0);
  });

  /** The purchased plan's own name (e.g. "Jyovix Auto — Prime"), for the status chip. */
  readonly activePlanName = computed<string | null>(() => {
    const activeType = this.membership.activeMarketingMembershipType();
    if (!activeType) return null;

    for (const split of this.splitViews()) {
      const match = split.tiers.find((t) => t.plan.membershipType === activeType);
      if (match) return match.plan.planName;
    }
    return null;
  });

  iconForSplit(id: PlanSplitId): string {
    return SPLIT_ICON[id] ?? 'sparkles-outline';
  }

  chooseTier(splitId: PlanSplitId, tierId: string): void {
    this.selectedTierBySplit.update((current) => ({ ...current, [splitId]: tierId }));
  }

  ionViewWillEnter(): void {
    this.activated.set(false);
    this.errorMessage.set(null);
    void this.membership.reload();
    void this.membership.loadPlans();
    void this.membership.loadHistory();
  }

  ngOnDestroy(): void {
    // nothing to tear down — Razorpay's own modal cleans itself up on close.
  }

  formatInr(value: number): string {
    return Math.round(value).toLocaleString('en-IN');
  }

  /** The plan currently held by this account, if any, is shown as "Active". */
  isCurrentPlan(plan: MembershipPlan): boolean {
    return this.membership.activeMarketingMembershipType() === plan.membershipType;
  }

  async retryPlans(): Promise<void> {
    await this.membership.loadPlans();
  }

  async confirmPurchase(plan: MembershipPlan): Promise<void> {
    if (this.payingPlanId() || this.isCurrentPlan(plan)) {
      return;
    }

    const alert = await this.alertCtrl.create({
      header: `Subscribe to ${plan.planName}?`,
      message: `You will be charged ₹${this.formatInr(plan.price)} for ${plan.durationDays} days of access.`,
      cssClass: 'mk-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Continue', role: 'confirm', handler: () => void this.purchase(plan) },
      ],
    });
    await alert.present();
  }

  continueToDashboard(): void {
    this.activated.set(false);
    void this.router.navigateByUrl('/tabs/dashboard');
  }

  async downloadReceipt(paymentId: string): Promise<void> {
    if (this.downloadingReceiptId()) return;

    this.downloadingReceiptId.set(paymentId);
    try {
      await this.membership.downloadReceipt(paymentId);
    } catch (error) {
      await this.toast.show('Could not download receipt', this.readError(error), 'no');
    } finally {
      this.downloadingReceiptId.set(null);
    }
  }

  /** Runs the full create-order → Razorpay checkout → verify-payment flow. */
  private async purchase(plan: MembershipPlan): Promise<void> {
    this.payingPlanId.set(plan.planId);
    this.errorMessage.set(null);

    try {
      await this.ensureRazorpayScript();
      const order = await this.membership.createOrder(plan.planId);
      await this.openCheckout(plan, order.orderId, order.amount, order.currency, order.razorpayKey, order.paymentId);
    } catch (error) {
      this.errorMessage.set(this.readError(error));
      this.payingPlanId.set(null);
    }
  }

  private openCheckout(
    plan: MembershipPlan,
    orderId: string,
    amount: number,
    currency: string,
    razorpayKey: string,
    paymentId: string,
  ): Promise<void> {
    return new Promise((resolve) => {
      const user = this.auth.storedLogin?.user;
      const RazorpayCtor = window.Razorpay;

      if (!RazorpayCtor) {
        this.errorMessage.set('Could not load the payment gateway. Check your connection and try again.');
        this.payingPlanId.set(null);
        resolve();
        return;
      }

      const razorpay = new RazorpayCtor({
        key: razorpayKey,
        amount,
        currency,
        order_id: orderId,
        name: 'Jyovix Marketing',
        description: `${plan.planName} membership`,
        theme: { color: '#d4a438' },
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
        },
        modal: {
          ondismiss: () => {
            this.payingPlanId.set(null);
            resolve();
          },
        },
        handler: (response: unknown) => {
          void this.onPaymentSuccess(plan, paymentId, orderId, response).finally(resolve);
        },
      });

      razorpay.on('payment.failed', (response: unknown) => {
        const description = (response as { error?: { description?: string } })?.error?.description;
        this.errorMessage.set(description || 'That payment did not go through. Please try again.');
        this.payingPlanId.set(null);
        resolve();
      });

      razorpay.open();
    });
  }

  private async onPaymentSuccess(
    plan: MembershipPlan,
    paymentId: string,
    orderId: string,
    rawResponse: unknown,
  ): Promise<void> {
    const response = rawResponse as {
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    try {
      if (!response?.razorpay_payment_id || !response?.razorpay_signature) {
        throw new Error('The payment response was incomplete. Please contact support if the amount was deducted.');
      }

      await this.membership.verifyPayment({
        paymentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });

      this.lastPaymentId.set(paymentId);
      this.activatedPlanName.set(plan.planName);
      this.activated.set(true);
    } catch (error) {
      this.errorMessage.set(this.readError(error, 'We could not confirm your payment. If the amount was deducted, it will reconcile shortly — contact support with your payment ID if not.'));
    } finally {
      this.payingPlanId.set(null);
    }
  }

  private ensureRazorpayScript(): Promise<void> {
    if (window.Razorpay) {
      return Promise.resolve();
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Could not load the payment gateway.')));
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load the payment gateway. Check your connection and try again.'));
      document.head.appendChild(script);
    });
  }

  private readError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
    const message = error instanceof HttpErrorResponse
      ? error.error?.message
      : (error as Error)?.message;
    return (Array.isArray(message) ? message.join(' ') : message) || fallback;
  }
}
