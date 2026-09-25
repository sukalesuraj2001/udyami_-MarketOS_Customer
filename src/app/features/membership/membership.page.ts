import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';

import { MembershipService } from '@core/services/membership.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

/** Amount sent to /membership-purchase/activate-digital-user and shown on the card. */
export const MEMBERSHIP_PLAN_AMOUNT = 100000;

interface PlanFeature {
  icon: string;
  title: string;
  detail: string;
}

interface ConfettiPiece {
  x: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
}

const CONFETTI_COLORS = ['#d4a438', '#f0ce7a', '#b8862a', '#1f8f5f', '#ffffff', '#2a6fa8'];

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, IonicModule, ThemeToggleComponent],
  templateUrl: './membership.page.html',
  styleUrls: ['./membership.page.scss'],
})
export class MembershipPage implements OnDestroy {
  readonly membership = inject(MembershipService);
  private readonly alertCtrl = inject(AlertController);
  private readonly router = inject(Router);

  readonly amount = MEMBERSHIP_PLAN_AMOUNT;
  readonly displayAmount = signal(0);
  readonly activating = signal(false);
  readonly activated = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly features: PlanFeature[] = [
    { icon: 'calendar-outline', title: 'AI marketing calendar', detail: '30-day content plan built around your brand brief' },
    { icon: 'sparkles-outline', title: 'AI content studio', detail: 'Generate and regenerate posts, captions and creatives' },
    { icon: 'paper-plane-outline', title: 'Auto-publishing', detail: 'Approved posts go live on Facebook & Instagram on schedule' },
    { icon: 'megaphone-outline', title: 'Meta ad campaigns', detail: 'Launch and monitor paid campaigns from one place' },
    { icon: 'checkmark-done-outline', title: 'Approval control', detail: 'Nothing publishes or spends until you approve it' },
    { icon: 'bar-chart-outline', title: 'Reports & insights', detail: 'Performance briefs and downloadable weekly reports' },
    { icon: 'headset-outline', title: 'Priority care desk', detail: 'Incident tracking and a dedicated support team' },
  ];

  readonly confetti: ConfettiPiece[] = Array.from({ length: 36 }, (_, i) => ({
    x: Math.round(Math.random() * 100),
    delay: Math.round(Math.random() * 400),
    duration: 1600 + Math.round(Math.random() * 1400),
    rotate: Math.round(Math.random() * 720 - 360),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));

  private countFrame: number | null = null;

  ionViewWillEnter(): void {
    this.activated.set(false);
    this.errorMessage.set(null);
    void this.membership.reload();
    this.animatePrice();
  }

  ngOnDestroy(): void {
    if (this.countFrame !== null) {
      cancelAnimationFrame(this.countFrame);
    }
  }

  formatInr(value: number): string {
    return value.toLocaleString('en-IN');
  }

  async confirmActivation(): Promise<void> {
    if (this.activating() || this.membership.membershipActive()) {
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Activate membership?',
      message: `Your digital membership will be activated for ₹${this.formatInr(this.amount)}.`,
      cssClass: 'mk-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Activate', role: 'confirm', handler: () => void this.activate() },
      ],
    });
    await alert.present();
  }

  continueToDashboard(): void {
    this.activated.set(false);
    void this.router.navigateByUrl('/tabs/dashboard');
  }

  private async activate(): Promise<void> {
    this.activating.set(true);
    this.errorMessage.set(null);

    try {
      await this.membership.activate(this.amount);
      this.activated.set(true);
    } catch (error) {
      const message = error instanceof HttpErrorResponse
        ? error.error?.message
        : (error as Error)?.message;
      this.errorMessage.set(
        (Array.isArray(message) ? message.join(' ') : message) ||
        'We could not activate your membership. Please try again.'
      );
    } finally {
      this.activating.set(false);
    }
  }

  /** Counts the price up from zero with an ease-out curve. */
  private animatePrice(): void {
    if (this.countFrame !== null) {
      cancelAnimationFrame(this.countFrame);
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.displayAmount.set(this.amount);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayAmount.set(Math.round(this.amount * eased));
      this.countFrame = progress < 1 ? requestAnimationFrame(step) : null;
    };
    this.countFrame = requestAnimationFrame(step);
  }
}
