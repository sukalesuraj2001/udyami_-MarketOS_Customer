import { Injectable } from '@angular/core';

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  prefillName?: string;
  prefillEmail?: string;
  themeColor?: string;
}

export interface RazorpayPaymentResult {
  razorpayPaymentId: string;
  razorpaySignature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: string, handler: (response: unknown) => void): void;
    };
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Loads the Razorpay checkout script on demand and opens its modal. Shared
 * between any flow that needs to take a payment (membership plans, wallet
 * top-ups) so the script-loading/modal-wiring logic only lives in one place.
 */
@Injectable({ providedIn: 'root' })
export class RazorpayCheckoutService {
  private scriptPromise: Promise<void> | null = null;

  ensureScript(): Promise<void> {
    if (window.Razorpay) {
      return Promise.resolve();
    }

    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      this.scriptPromise = new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Could not load the payment gateway.')));
      });
      return this.scriptPromise;
    }

    this.scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load the payment gateway. Check your connection and try again.'));
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }

  /**
   * Resolves with the payment result on success, `null` if the user dismissed
   * the modal, and rejects only when the gateway itself could not be opened.
   */
  async open(options: RazorpayCheckoutOptions): Promise<RazorpayPaymentResult | null> {
    await this.ensureScript();

    const RazorpayCtor = window.Razorpay;
    if (!RazorpayCtor) {
      throw new Error('Could not load the payment gateway. Check your connection and try again.');
    }

    return new Promise<RazorpayPaymentResult | null>((resolve, reject) => {
      const razorpay = new RazorpayCtor({
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.orderId,
        name: options.name,
        description: options.description,
        theme: { color: options.themeColor ?? '#d4a438' },
        prefill: {
          name: options.prefillName ?? '',
          email: options.prefillEmail ?? '',
        },
        modal: {
          ondismiss: () => resolve(null),
        },
        handler: (response: unknown) => {
          const result = response as { razorpay_payment_id?: string; razorpay_signature?: string };
          if (!result?.razorpay_payment_id || !result?.razorpay_signature) {
            reject(new Error('The payment response was incomplete. Please contact support if the amount was deducted.'));
            return;
          }
          resolve({
            razorpayPaymentId: result.razorpay_payment_id,
            razorpaySignature: result.razorpay_signature,
          });
        },
      });

      razorpay.on('payment.failed', (response: unknown) => {
        const description = (response as { error?: { description?: string } })?.error?.description;
        reject(new Error(description || 'That payment did not go through. Please try again.'));
      });

      razorpay.open();
    });
  }
}
