import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ToastService } from '@core/services/toast.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { ApprovalService } from '@core/services/approval';
import { GeneratedContentItem } from '@core/interfaces/socialMediaAcounts.interface';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.scss'],
})
export class CampaignsPage {
  private toast = inject(ToastService);
  private approvalService = inject(ApprovalService);

  publishedContents = signal<GeneratedContentItem[]>([]);
  isLoadingPublished = signal(false);
  publishedError = signal(false);

  platformCounts = computed(() => {
    const counts = { instagram: 0, meta: 0, google: 0, linkedin: 0, other: 0 };

    for (const content of this.publishedContents()) {
      counts[this.getPlatformKey(content.platform)] += 1;
    }

    return counts;
  });

  showCaps = signal(false);
  dailyCap = '₹3,000';
  monthlyCeiling = '₹90,000';
  breaker = '2.5× trailing average';

  ionViewWillEnter(): void {
    this.loadPublishedContent();
  }

  loadPublishedContent(): void {
    this.isLoadingPublished.set(true);
    this.publishedError.set(false);

    this.approvalService.getGeneratedContent().subscribe({
      next: (response) => {
        this.publishedContents.set(
          (response?.data ?? []).filter((content) => this.isPublished(content))
        );
        this.isLoadingPublished.set(false);
      },
      error: () => {
        this.publishedContents.set([]);
        this.publishedError.set(true);
        this.isLoadingPublished.set(false);
      },
    });
  }

  getPlatformKey(platform: string | null): 'instagram' | 'meta' | 'google' | 'linkedin' | 'other' {
    const normalized = String(platform || '').toLowerCase();

    if (normalized.includes('instagram')) return 'instagram';
    if (normalized.includes('meta') || normalized.includes('facebook')) return 'meta';
    if (normalized.includes('google')) return 'google';
    if (normalized.includes('linkedin')) return 'linkedin';

    return 'other';
  }

  private isPublished(content: GeneratedContentItem): boolean {
    return String(content.status || '').toUpperCase() === 'PUBLISHED'
      || Boolean(content.publishedAt);
  }

  getPlatformLabel(platform: string | null): string {
    const key = this.getPlatformKey(platform);

    return {
      instagram: 'Instagram',
      meta: 'Meta Ads',
      google: 'Google Ads',
      linkedin: 'LinkedIn',
      other: platform || 'Other channel',
    }[key];
  }

  getPlatformIcon(platform: string | null): string {
    const key = this.getPlatformKey(platform);

    return {
      instagram: 'logo-instagram',
      meta: 'logo-facebook',
      google: 'logo-google',
      linkedin: 'logo-linkedin',
      other: 'megaphone-outline',
    }[key];
  }

  getPublishedHeadline(content: GeneratedContentItem): string {
    return content.aiResponse?.marketingContent?.headline
      || content.productName
      || 'Published campaign content';
  }

  getPublishedCaption(content: GeneratedContentItem): string {
    return content.aiResponse?.marketingContent?.caption || '';
  }

  isVideoContent(content: GeneratedContentItem): boolean {
    const mediaType = String(content.mediaType || '').toLowerCase();
    const contentType = String(content.contentType || '').toLowerCase();
    const activityType = String(content.activityType || '').toLowerCase();
    const mediaUrl = String(content.mediaUrl || '').toLowerCase().split('?')[0];

    return mediaType.startsWith('video')
      || contentType.includes('video')
      || contentType.includes('reel')
      || activityType.includes('video')
      || activityType.includes('reel')
      || /\.(mp4|webm|mov|m4v|avi)$/.test(mediaUrl);
  }

  getPublishedDate(content: GeneratedContentItem): string {
    const date = new Date(content.publishedAt || content.updatedAt || content.createdAt);

    if (Number.isNaN(date.getTime())) return 'Published recently';

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  saveCaps(): void {
    this.showCaps.set(false);
    this.toast.show('Caps updated', 'Enforced on the ad account, not just here', 'ok');
  }
}
