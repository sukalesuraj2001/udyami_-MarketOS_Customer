import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { MenuButtonComponent } from '@shared/components/menu-button/menu-button.component';
import { MembershipService } from '@core/services/membership.service';
import { AuthService } from '@core/services/auth.service';
import { ApprovalService } from '@core/services/approval';
import { LeadsService, LeadItem, leadDisplayName, leadSource, formatLeadTime, isRecentLead } from '@core/services/leadsService/leads';
import { BadgeCountsService } from '@core/services/badge-counts.service';
import { Kpi } from '@core/models/models';
import { ContentQuotaStatus, GeneratedContentItem } from '@core/interfaces/socialMediaAcounts.interface';
import { Profile, UserProfile } from '@app/core/services/profileService/profile';
import { getProfileCompletion } from '@app/core/services/profileService/profile-completion';

function startOfMonth(offset = 0): Date {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isInMonth(dateStr: string | null | undefined, offset: number): boolean {
  if (!dateStr) return false;
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return false;
  const from = startOfMonth(offset).getTime();
  const to = startOfMonth(offset + 1).getTime();
  return ts >= from && ts < to;
}

function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, KpiCardComponent, ThemeToggleComponent, MenuButtonComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly approvalService = inject(ApprovalService);
  private readonly leadsService = inject(LeadsService);
  private readonly profileService = inject(Profile);
  private readonly badges = inject(BadgeCountsService);
  readonly membership = inject(MembershipService);

  private readonly userProfile = signal<UserProfile | null>(null);
  readonly profileCompletion = computed(() => getProfileCompletion(this.userProfile()));
  readonly showProfileGate = computed(() =>
    this.profileCompletion().hasProfile && !this.profileCompletion().hasBusinessDetails
  );
  readonly profileGateMessage = computed(() => {
    const labels = this.profileCompletion().missingLabels;
    return labels.length
      ? `We still need your ${listOf(labels)} before your content is as sharp as it can be.`
      : 'A few business details are still missing.';
  });

  private readonly contents = signal<GeneratedContentItem[]>([]);
  readonly contentsLoading = signal(true);

  private readonly leads = signal<LeadItem[]>([]);
  readonly leadsLoading = signal(true);

  private readonly walletBalance = signal<number | null>(null);
  private readonly walletSpentThisMonth = signal<number | null>(null);

  readonly contentQuota = signal<ContentQuotaStatus | null>(null);

  readonly pendingContents = computed(() =>
    this.contents().filter((c) => this.statusOf(c) === 'GENERATED')
  );
  readonly pendingCount = computed(() => this.pendingContents().length);

  readonly decisionItems = computed(() =>
    [...this.pendingContents()]
      .sort((a, b) => this.timestampOf(b) - this.timestampOf(a))
      .slice(0, 4)
  );

  readonly latestLeads = computed(() =>
    [...this.leads()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
  );

  readonly kpis = computed<Kpi[]>(() => {
    const contents = this.contents();
    const thisMonth = contents.filter((c) => isInMonth(c.createdAt, 0));
    const published = thisMonth.filter((c) => this.isPublished(c)).length;
    const total = thisMonth.length;

    const leads = this.leads();
    const enquiriesThisMonth = leads.filter((l) => isInMonth(l.createdAt, 0)).length;
    const enquiriesLastMonth = leads.filter((l) => isInMonth(l.createdAt, -1)).length;
    const delta = enquiriesThisMonth - enquiriesLastMonth;

    const balance = this.walletBalance();
    const spent = this.walletSpentThisMonth();

    return [
      {
        label: 'Waiting for you',
        value: String(this.pendingCount()),
        sub: 'content to approve',
      },
      {
        label: 'Enquiries this month',
        value: String(enquiriesThisMonth),
        sub: delta === 0 ? 'No change vs last month' : 'vs last month',
        trend: delta === 0 ? undefined : (delta > 0 ? 'up' : 'down'),
        trendLabel: delta === 0 ? undefined : (delta > 0 ? `+${delta}` : String(delta)),
      },
      {
        label: 'Ad budget left',
        value: balance == null ? '—' : `₹${this.formatInr(balance)}`,
        sub: spent && spent > 0
          ? `₹${this.formatInr(spent)} spent this month`
          : (balance && balance > 0 ? 'Available to spend on ads' : 'Recharge to run ads'),
        meterPct: spent && spent > 0 && balance != null
          ? Math.min(100, (spent / (spent + balance)) * 100)
          : undefined,
      },
      {
        label: 'Posts published',
        value: total > 0 ? `${published}/${total}` : String(published),
        sub: 'this month',
      },
    ];
  });

  ionViewWillEnter(): void {
    this.loadProfile();
    this.loadContent();
    this.loadLeads();
    this.loadWallet();
    this.loadContentQuota();
  }

  refresh(ev: CustomEvent): void {
    this.loadProfile();
    this.loadContent();
    this.loadLeads();
    this.loadWallet();
    this.loadContentQuota();
    setTimeout(() => (ev.target as HTMLIonRefresherElement).complete(), 700);
  }

  get businessName(): string {
    const business = this.userProfile()?.profile?.businessDetails?.businessName;
    return (typeof business === 'string' && business.trim()) || this.ownerName || 'there';
  }

  get ownerName(): string {
    return this.auth.storedLogin?.user?.name ?? '';
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
  }

  thumbLabelFor(content: GeneratedContentItem): string {
    const source = content.productName || content.contentType || content.platform || 'post';
    return source.split(/\s+/)[0].slice(0, 9).toUpperCase();
  }

  titleFor(content: GeneratedContentItem): string {
    return content.productName || this.platformLabel(content.platform) + ' content';
  }

  platformLabel(platform: string | null): string {
    if (!platform) return 'Social';
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  }

  decisionSubtitle(content: GeneratedContentItem): string {
    const ts = this.timestampOf(content);
    const when = ts ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(ts) : 'recently';
    return `${this.platformLabel(content.platform)} · ${when}`;
  }

  leadName(lead: LeadItem): string {
    return leadDisplayName(lead);
  }

  leadSubtitle(lead: LeadItem): string {
    return `${leadSource(lead)} · ${formatLeadTime(lead.createdAt)}`;
  }

  leadIsNew(lead: LeadItem): boolean {
    return isRecentLead(lead);
  }

  formatInr(value: number): string {
    return Math.round(value).toLocaleString('en-IN');
  }

  goApprovals(): void {
    this.router.navigateByUrl('/tabs/approvals');
  }

  goLeads(): void {
    this.router.navigateByUrl('/tabs/leads');
  }

  openBusinessDetails(): void {
    this.router.navigate(['/tabs/profile-edit'], { queryParams: { section: 'business' } });
  }

  renewMembership(): void {
    this.membership.openMembershipPage();
  }

  private loadProfile(): void {
    this.profileService.getUserProfileData().subscribe({
      next: (response) => this.userProfile.set(response.data ?? null),
      error: (error) => console.error('Failed to load user profile:', error),
    });
  }

  private loadContent(): void {
    this.contentsLoading.set(true);
    this.approvalService.getGeneratedContent().subscribe({
      next: (response) => {
        this.contents.set(response?.data ?? []);
        this.contentsLoading.set(false);
        this.badges.refreshContent();
      },
      error: (error) => {
        console.error('Failed to load generated content:', error);
        this.contentsLoading.set(false);
      },
    });
  }

  private loadLeads(): void {
    this.leadsLoading.set(true);
    this.leadsService.getLeads().subscribe({
      next: (response) => {
        this.leads.set(response?.success ? response.data : []);
        this.leadsLoading.set(false);
        this.badges.refreshLeads();
      },
      error: (error) => {
        console.error('Failed to load leads:', error);
        this.leadsLoading.set(false);
      },
    });
  }

  private loadWallet(): void {
    this.profileService.getUserWalletData().subscribe({
      next: (wallet) => this.walletBalance.set(wallet?.balanceCoins ?? 0),
      error: (error) => {
        console.error('Failed to load wallet:', error);
        this.walletBalance.set(null);
      },
    });

    this.profileService.getUserWalletHistory().subscribe({
      next: (response) => {
        const transactions = response?.data ?? [];
        const spent = transactions
          .filter((t) => t.type === 'DEBIT' && t.status === 'SUCCESS' && isInMonth(t.createdAt, 0))
          .reduce((sum, t) => sum + t.amountCoins, 0);
        this.walletSpentThisMonth.set(spent);
      },
      error: () => this.walletSpentThisMonth.set(null),
    });
  }

  goMembership(): void {
    this.membership.openMembershipPage();
  }

  private loadContentQuota(): void {
    this.approvalService.getContentQuotaUsage().subscribe({
      next: (usage) => this.contentQuota.set(usage),
      error: () => this.contentQuota.set(null),
    });
  }

  private statusOf(content: GeneratedContentItem): string {
    return String(content.status || '').toUpperCase();
  }

  private isPublished(content: GeneratedContentItem): boolean {
    return this.statusOf(content) === 'PUBLISHED' || Boolean(content.publishedAt);
  }

  private timestampOf(content: GeneratedContentItem): number {
    const ts = new Date(content.publishedAt || content.updatedAt || content.createdAt).getTime();
    return Number.isNaN(ts) ? 0 : ts;
  }
}
