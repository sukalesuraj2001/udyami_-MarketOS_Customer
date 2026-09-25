import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { MembershipService } from '@core/services/membership.service';
import { ApprovalService } from '@core/services/approval';
import { FeedItem, Kpi } from '@core/models/models';
import { GeneratedContentItem } from '@core/interfaces/socialMediaAcounts.interface';
import { Profile, UserProfile } from '@app/core/services/profileService/profile';
import { getProfileCompletion } from '@app/core/services/profileService/profile-completion';
import { BusinessReminderComponent } from '@shared/components/business-reminder/business-reminder.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, IonicModule, KpiCardComponent, SectionHeaderComponent, ThemeToggleComponent, BusinessReminderComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  data = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private approvalService = inject(ApprovalService);
  readonly membership = inject(MembershipService);
  private profileService = inject(Profile);
  private readonly userProfile = signal<UserProfile | null>(null);
  readonly profileCompletion = computed(() => getProfileCompletion(this.userProfile()));
  /** Saved profile exists but businessDetails is empty. */
  readonly showBusinessReminder = computed(() =>
    this.profileCompletion().hasProfile && !this.profileCompletion().hasBusinessDetails
  );
  readonly approvalKpis = signal<Kpi[]>([
    { label: 'Published', value: '0', sub: 'Content published to social media', accent: 'green' },
    { label: 'Rejected', value: '0', sub: 'Content rejected from approval' },
    { label: 'Pending approval', value: '0', sub: 'Content waiting for your decision', accent: 'gold' },
    { label: 'Total content', value: '0', sub: 'Generated content in your workspace' },
  ]);
  readonly isLoadingApprovalCounts = signal(false);

  skeletonRows = Array.from({ length: 4 });

  ionViewWillEnter(): void {
    this.loadApprovalCounts();
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.profileService.getUserProfileData().subscribe({
      next: (response) => this.userProfile.set(response.data ?? null),
      error: (error) => console.error('Failed to load user profile:', error),
    });
  }

  openBusinessDetails(): void {
    this.router.navigate(['/tabs/profile-edit'], { queryParams: { section: 'business' } });
  }

  private loadApprovalCounts(): void {
    this.isLoadingApprovalCounts.set(true);
    this.approvalService.getGeneratedContent().subscribe({
      next: (response) => {
        const contents = response?.data ?? [];
        this.data.feed.set(this.buildActivityFeed(contents));
        const published = contents.filter((content) =>
          this.isPublished(content)
        ).length;
        const rejected = contents.filter((content) =>
          content.isActive === false
          || String(content.status || '').toUpperCase() === 'REJECTED'
        ).length;
        const pending = contents.filter((content) =>
          String(content.status || '').toUpperCase() === 'GENERATED'
        ).length;

        this.approvalKpis.set([
          { label: 'Published', value: String(published), sub: 'Content published to social media', accent: 'green' },
          { label: 'Rejected', value: String(rejected), sub: 'Content rejected from approval' },
          { label: 'Pending approval', value: String(pending), sub: 'Content waiting for your decision', accent: 'gold' },
          { label: 'Total content', value: String(contents.length), sub: 'Generated content in your workspace' },
        ]);
        this.isLoadingApprovalCounts.set(false);
      },
      error: (error) => {
        console.error('Failed to load approval counts:', error);
        this.isLoadingApprovalCounts.set(false);
      },
    });
  }

  private isPublished(content: { status?: string | null; publishedAt?: string | null }): boolean {
    return String(content.status || '').toUpperCase() === 'PUBLISHED'
      || Boolean(content.publishedAt);
  }

  private buildActivityFeed(contents: GeneratedContentItem[]): FeedItem[] {
    return [...contents]
      .sort((first, second) => this.getActivityTimestamp(second) - this.getActivityTimestamp(first))
      .slice(0, 6)
      .map((content) => {
        const status = String(content.status || '').toUpperCase();
        const platform = content.platform || 'channel';
        const name = content.productName || 'marketing content';

        if (this.isPublished(content)) {
          return { time: this.formatActivityTime(content), text: `${name} published to ${platform}`, tone: 'ok' };
        }

        if (status === 'REJECTED') {
          return { time: this.formatActivityTime(content), text: `${name} rejected`, tone: 'gold' };
        }

        if (status === 'GENERATED') {
          return { time: this.formatActivityTime(content), text: `${name} waiting for approval`, tone: 'gold' };
        }

        return { time: this.formatActivityTime(content), text: `${name} status updated`, tone: 'neu' };
      });
  }

  private getActivityTimestamp(content: GeneratedContentItem): number {
    const timestamp = new Date(content.publishedAt || content.updatedAt || content.createdAt).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private formatActivityTime(content: GeneratedContentItem): string {
    const timestamp = this.getActivityTimestamp(content);

    if (!timestamp) return 'Recently';

    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  }

  goApprovals(): void {
    this.router.navigateByUrl('/approvals');
  }

  actOnCreative(): void {
    this.data.addRetireCreativeApproval();
    this.toast.show('Queued for approval', 'Retire Creative 07 — added to your queue', 'ok');
  }

  renewMembership(): void {
    this.membership.openMembershipPage();
  }

  refresh(ev: CustomEvent): void {
    this.loadApprovalCounts();
    this.loadUserProfile();
    setTimeout(() => (ev.target as HTMLIonRefresherElement).complete(), 700);
  }

  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 17) {
      return 'Good afternoon';
    }

    if (hour < 21) {
      return 'Good evening';
    }

    return 'Good night';
  }
  get ownerName(): string {
    try {
      const stored = localStorage.getItem('marketos.auth');

      if (!stored) {
        return '';
      }

      const auth = JSON.parse(stored);

      return auth?.user?.name ?? '';
    } catch {
      return '';
    }
  }
}
