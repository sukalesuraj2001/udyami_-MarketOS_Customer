import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { AuthService } from '@core/services/auth.service';

/** Mirrors `MembershipType` on the backend (membership_plan.entity.ts). */
export type MembershipType =
  | 'BASIC' | 'PRIME' | 'PATRON' | 'TRIAL' | 'DIGITAL_MARKETING'
  | 'AUTO_BASIC' | 'AUTO_PRIME' | 'AUTO_PREMIUM'
  | 'BALANCED_BASIC' | 'BALANCED_PRIME' | 'BALANCED_PREMIUM'
  | 'STUDIO_BASIC' | 'STUDIO_PRIME' | 'STUDIO_PREMIUM';

/**
 * Jyovix's own content-creation plans — what this app's plan picker shows.
 * Everything else (BASIC/PRIME/PATRON/TRIAL) is Udyami Circle's civic
 * membership and DIGITAL_MARKETING is the ad-spend wallet top-up; neither
 * belongs in a social-media plan picker.
 */
export const MARKETING_MEMBERSHIP_TYPES: readonly MembershipType[] = [
  'AUTO_BASIC', 'AUTO_PRIME', 'AUTO_PREMIUM',
  'BALANCED_BASIC', 'BALANCED_PRIME', 'BALANCED_PREMIUM',
  'STUDIO_BASIC', 'STUDIO_PRIME', 'STUDIO_PREMIUM',
];

/** The three "splits" a plan tier belongs to — how much of the work AI vs a person does. */
export type PlanSplitId = 'auto' | 'balanced' | 'studio';

export interface PlanSplitMeta {
  id: PlanSplitId;
  /** Prefix of the three membershipType values that belong to this split. */
  prefix: string;
  name: string;
  splitLabel: string;
  aiShare: number;
  blurb: string;
  humanNote: string;
}

export const PLAN_SPLITS: readonly PlanSplitMeta[] = [
  {
    id: 'auto', prefix: 'AUTO_', name: 'Jyovix Auto', splitLabel: '90% AI · 10% human', aiShare: 90,
    blurb: 'AI does the research, the writing, the images, the checks and the ad buying. A person edits your videos and watches the money.',
    humanNote: 'A person edits every video and reviews anything the content check holds.',
  },
  {
    id: 'balanced', prefix: 'BALANCED_', name: 'Jyovix Balanced', splitLabel: '50% AI · 50% human', aiShare: 50,
    blurb: 'AI drafts and researches, your Jyovix team rewrites and crafts. Every caption is written by a person on top of an AI draft.',
    humanNote: 'A writer rewrites every caption, an editor cuts every video, a manager builds the campaigns from an AI plan.',
  },
  {
    id: 'studio', prefix: 'STUDIO_', name: 'Jyovix Studio', splitLabel: '90% human · 10% AI', aiShare: 10,
    blurb: 'People do the work. AI is used only to research your market and to put the posts out at the right time.',
    humanNote: 'A strategist, a writer, a designer and an editor work on your account.',
  },
];

/** 'AUTO_PRIME' → 'PRIME'. Assumes the type belongs to one of PLAN_SPLITS. */
export function tierIdOf(type: MembershipType): string {
  const split = PLAN_SPLITS.find((s) => type.startsWith(s.prefix));
  return split ? type.slice(split.prefix.length) : type;
}

export function isMarketingPlanType(type: MembershipType | null | undefined): boolean {
  return !!type && MARKETING_MEMBERSHIP_TYPES.includes(type);
}

export interface MembershipPlanFeature {
  featureId: string;
  featureName: string;
  displayOrder: number;
}

export interface MembershipPlan {
  planId: string;
  planName: string;
  membershipType: MembershipType;
  price: number;
  durationDays: number;
  badge: string | null;
  isPopular: boolean;
  isActive: boolean;
  features: MembershipPlanFeature[];
}

export interface MembershipHistoryItem {
  historyId: string;
  userId: string;
  planId: string;
  paymentId: string;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  plan?: MembershipPlan;
}

interface DigitalUserDataResponse {
  success: boolean;
  message: string;
  data: {
    isDigital: boolean;
    isBasic?: boolean;
    isPrime?: boolean;
    isPatron?: boolean;
    isTrial?: boolean;
    wallet?: {
      balanceCoins: number;
    };
  };
}

interface PlansResponse {
  success: boolean;
  message: string;
  totalCount: number;
  data: MembershipPlan[];
}

interface HistoryResponse {
  success: boolean;
  message: string;
  count: number;
  data: MembershipHistoryItem[];
}

export interface CreateOrderResult {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  razorpayKey: string;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: CreateOrderResult;
}

export interface VerifyPaymentPayload {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  paymentId: string;
  membershipId: string;
  planId?: string;
  planName?: string;
  membershipType?: MembershipType;
  amount?: number;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: VerifyPaymentResult;
}

/** @deprecated kept only for the type of the now-disabled bypass endpoint. */
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
  private readonly isBasicFlag = signal(false);
  private readonly isPrimeFlag = signal(false);
  private readonly isPatronFlag = signal(false);
  private readonly isTrialFlag = signal(false);

  readonly loaded = signal(false);
  readonly membershipActive = computed(() =>
    this.isDigital() && this.balanceCoins() > 0
  );
  readonly walletCoins = this.balanceCoins.asReadonly();
  readonly canUsePaidActions = computed(() =>
    this.isDigital() && this.balanceCoins() > 0
  );

  /** Any paid, non-digital tier the account currently holds (prime/patron/basic/trial). */
  readonly isBasic = this.isBasicFlag.asReadonly();
  readonly isPrime = this.isPrimeFlag.asReadonly();
  readonly isPatron = this.isPatronFlag.asReadonly();
  readonly isTrial = this.isTrialFlag.asReadonly();

  /** The membership type currently active on the account, or null. */
  readonly currentPlanType = computed<MembershipType | null>(() => {
    if (this.isDigital()) return 'DIGITAL_MARKETING';
    if (this.isPatronFlag()) return 'PATRON';
    if (this.isPrimeFlag()) return 'PRIME';
    if (this.isBasicFlag()) return 'BASIC';
    if (this.isTrialFlag()) return 'TRIAL';
    return null;
  });

  readonly hasAnyMembership = computed(() => this.currentPlanType() !== null);

  readonly plans = signal<MembershipPlan[]>([]);
  readonly plansLoading = signal(false);
  readonly plansError = signal<string | null>(null);

  /** The plans this app's picker should actually show — Jyovix's own tiers. */
  readonly marketingPlans = computed(() =>
    this.plans().filter((plan) => isMarketingPlanType(plan.membershipType))
  );

  readonly history = signal<MembershipHistoryItem[]>([]);
  readonly historyLoading = signal(false);

  /**
   * The Jyovix plan type currently active, derived from purchase history
   * since buying one deliberately does not set any flag on the account
   * (see razorpay.service.ts) — it is a separate product from civic
   * membership and the ad wallet.
   */
  readonly activeMarketingMembershipType = computed<MembershipType | null>(() => {
    const now = Date.now();
    const current = this.history().find((item) =>
      isMarketingPlanType(item.plan?.membershipType) && new Date(item.endDate).getTime() > now
    );
    return current?.plan?.membershipType ?? null;
  });

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

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

  /** Fetches the live catalogue of membership plans for the plan picker. */
  async loadPlans(): Promise<void> {
    this.plansLoading.set(true);
    this.plansError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<PlansResponse>(
          `${environment.apiUrl}${API_ENDPOINTS.MEMBERSHIP.GET_ALL_PLANS}`
        )
      );
      this.plans.set(response.data ?? []);
    } catch (error) {
      console.error('Failed to load membership plans:', error);
      this.plansError.set('We could not load the plans. Pull to refresh and try again.');
    } finally {
      this.plansLoading.set(false);
    }
  }

  async loadHistory(): Promise<void> {
    const userId = this.auth.userId;
    if (!userId) return;

    this.historyLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.get<HistoryResponse>(
          `${environment.apiUrl}${API_ENDPOINTS.MEMBERSHIP.HISTORY}?userId=${encodeURIComponent(userId)}`
        )
      );
      this.history.set(response.data ?? []);
    } catch (error) {
      console.error('Failed to load membership history:', error);
    } finally {
      this.historyLoading.set(false);
    }
  }

  /** Step 1 of the Razorpay flow: opens a pending payment against a plan. */
  async createOrder(planId: string): Promise<CreateOrderResult> {
    const response = await firstValueFrom(
      this.http.post<CreateOrderResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.MEMBERSHIP.CREATE_ORDER}`,
        { planId }
      )
    );

    if (!response?.success) {
      throw new Error(response?.message || 'Unable to start the purchase.');
    }

    return response.data;
  }

  /**
   * Step 2 of the Razorpay flow: verifies the signed payment and activates
   * the membership. Reloads status + history so the UI unlocks immediately.
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
    const response = await firstValueFrom(
      this.http.post<VerifyPaymentResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.MEMBERSHIP.VERIFY_PAYMENT}`,
        payload
      )
    );

    if (!response?.success) {
      throw new Error(response?.message || 'We could not verify that payment.');
    }

    await Promise.all([this.refresh(), this.loadHistory()]);
    return response.data;
  }

  /** Downloads the PDF receipt for a completed payment. */
  async downloadReceipt(paymentId: string): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(
        `${environment.apiUrl}${API_ENDPOINTS.MEMBERSHIP.RECEIPT(paymentId)}`,
        { responseType: 'blob' }
      )
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${paymentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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
    const userId = this.auth.userId;

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
      this.isBasicFlag.set(response.data?.isBasic === true);
      this.isPrimeFlag.set(response.data?.isPrime === true);
      this.isPatronFlag.set(response.data?.isPatron === true);
      this.isTrialFlag.set(response.data?.isTrial === true);
      this.loaded.set(true);
    } catch (error) {
      console.error('Failed to load membership status:', error);
      this.isDigital.set(false);
      this.balanceCoins.set(0);
      this.isBasicFlag.set(false);
      this.isPrimeFlag.set(false);
      this.isPatronFlag.set(false);
      this.isTrialFlag.set(false);
      this.loaded.set(true);
    }
  }
}
