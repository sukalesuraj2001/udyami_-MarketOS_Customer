import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth.service';
import {
  AdBudgetData,
  AdBudgetHistoryResponse,
  AdBudgetOrderResponse,
  AdBudgetOrderResult,
  AdBudgetVerifyPayload,
  AdBudgetVerifyResponse,
  AdBudgetVerifyResult,
} from '@core/interfaces/socialMediaAcounts.interface';

/**
 * The dedicated ad-spend budget a user pays into specifically to run/boost
 * ads on Facebook or Google. Deliberately separate from the Wallet backend —
 * its own table, its own Razorpay order/verify flow — so it never gets
 * confused with (or mixed into) any other balance in the app.
 */
@Injectable({ providedIn: 'root' })
export class AdBudgetService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private getUserId(): string {
    const userId = this.auth.storedLogin?.user?.userId;
    if (!userId) {
      throw new Error('You need to be signed in.');
    }
    return userId;
  }

  getAdBudget() {
    return this.http.get<AdBudgetData>(
      `${environment.apiUrl}${API_ENDPOINTS.AD_BUDGET.GET_BUDGET(this.getUserId())}`
    );
  }

  getAdBudgetHistory() {
    return this.http.get<AdBudgetHistoryResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AD_BUDGET.GET_HISTORY(this.getUserId())}`
    );
  }

  /** Starts a Razorpay order to add the given amount (in ₹) to the ad budget. */
  async createOrder(amount: number): Promise<AdBudgetOrderResult> {
    const response = await firstValueFrom(
      this.http.post<AdBudgetOrderResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.AD_BUDGET.CREATE_ORDER}`,
        { amount }
      )
    );

    if (!response?.success) {
      throw new Error(response?.message || 'Unable to start the recharge.');
    }

    return response.data;
  }

  /** Verifies a completed Razorpay payment and credits the ad budget. */
  async verifyPayment(payload: AdBudgetVerifyPayload): Promise<AdBudgetVerifyResult> {
    const response = await firstValueFrom(
      this.http.post<AdBudgetVerifyResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.AD_BUDGET.VERIFY_PAYMENT}`,
        payload
      )
    );

    if (!response?.success) {
      throw new Error(response?.message || 'We could not verify that payment.');
    }

    return response.data;
  }
}
