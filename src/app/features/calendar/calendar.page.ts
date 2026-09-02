
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { AICalenders } from '@app/core/services/aicalenders';
import { Component, computed, inject, signal } from '@angular/core';
import { MarketingCalendarActivity } from '@app/core/interfaces/ai-calender.interface';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';

type Filter =
  | 'all'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'google_ads'
  | 'meta_ads';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SectionHeaderComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage {
  newDate = '';
  newTopic = '';
  loading = signal(false);
  showAdd = signal(false);
  filter = signal<Filter>('all');
  newChannel = 'Instagram · Reel';
  showEventDetails = signal(false);
  private toast = inject(ToastService);
  private aiCalenders = inject(AICalenders);
  calendar = signal<MarketingCalendarActivity[]>([]);
  selectedEvent = signal<MarketingCalendarActivity | null>(null);

  /**
   * Load marketing calendar when page enters
   */
  ionViewWillEnter(): void {
    this.loadMarketingCalendar();
  }

  /**
   * Get user's marketing calendar
   */
  loadMarketingCalendar(): void {
    this.loading.set(true);

    this.aiCalenders.getMarketingCalendar().subscribe({
      next: (response) => {
        const calendar = response.data?.calendar ?? [];

        // Calendar already exists
        if (calendar.length > 0) {
          this.calendar.set(calendar);
          this.loading.set(false);
          return;
        }

        // Calendar does not exist → create 30-day calendar
        this.createMarketingCalendar();
      },

      error: (error) => {
        console.error(
          'Failed to load marketing calendar:',
          error
        );

        this.calendar.set([]);
        this.loading.set(false);

        this.toast.show(
          'Failed to load calendar',
          'Please try again later.'
        );
      },
    });
  }

  /**
   * Create user's 30-day marketing calendar
   */
  private createMarketingCalendar(): void {
    this.aiCalenders.createMarketingCalendar().subscribe({
      next: (response) => {
        const calendar = response.data?.calendar ?? [];

        this.calendar.set(calendar);
        this.loading.set(false);

        console.log(
          'Marketing calendar created:',
          response
        );
      },

      error: (error) => {
        console.error(
          'Failed to create marketing calendar:',
          error
        );

        this.calendar.set([]);
        this.loading.set(false);

        this.toast.show(
          'Calendar creation failed',
          'Please try again later.'
        );
      },
    });
  }

  /**
   * Convert API platform to UI filter
   */
  private matchesFilter(
    activity: MarketingCalendarActivity,
    filter: Filter
  ): boolean {
    if (filter === 'all') {
      return true;
    }

    const platform = activity.platform?.toUpperCase();

    switch (filter) {
      case 'instagram':
        return platform === 'INSTAGRAM';

      case 'facebook':
        return platform === 'FACEBOOK';

      case 'linkedin':
        return platform === 'LINKEDIN';

      case 'youtube':
        return platform === 'YOUTUBE';

      case 'google_ads':
        return platform === 'GOOGLE_ADS';

      case 'meta_ads':
        return platform === 'META_ADS';

      default:
        return false;
    }
  }

  /**
   * Get filtered calendar
   */
  filteredCalendar = computed(() => {
    const filter = this.filter();

    return this.calendar().filter((activity) =>
      this.matchesFilter(activity, filter)
    );
  });

  /**
   * Get all active days
   */
  activeDays = computed(() => {
    const days = this.filteredCalendar().map(
      (activity) => activity.day
    );

    return [...new Set(days)].sort(
      (a, b) => a - b
    );
  });

  /**
   * Get events for a particular day
   */
  eventsFor(
    day: number
  ): MarketingCalendarActivity[] {
    return this.filteredCalendar().filter(
      (activity) => activity.day === day
    );
  }

  /**
   * Filter change
   */
  onFilterChange(ev: Event): void {
    const value = (ev as CustomEvent)
      .detail.value as Filter;

    this.filter.set(value);
  }

  /**
   * Open calendar activity
   *
   * Past activities are disabled and cannot be opened.
   */
  openEvent(event: MarketingCalendarActivity): void {
    if (this.isPastDate(event.date)) {
      return;
    }

    this.selectedEvent.set(event);
    this.showEventDetails.set(true);
  }
  closeEventDetails(): void {
    this.showEventDetails.set(false);
    this.selectedEvent.set(null);
  }

  getEventStatus(event: MarketingCalendarActivity): string {
    if (this.isPastDate(event.date)) {
      return 'Completed';
    }

    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    if (event.date === todayString) {
      return 'Today';
    }

    return 'Upcoming';
  }

  /**
   * Format API date for display.
   *
   * API sends:
   * YYYY-MM-DD
   *
   * We manually construct the local Date object
   * to prevent timezone shifting.
   */
  formatDate(date: string): string {
    if (!date) {
      return '';
    }

    const [year, month, day] = date.split('-');

    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return parsedDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  }

  /**
   * Get month name from calendar.
   *
   * Uses local date construction to avoid
   * September 2 → September 1 timezone issue.
   */
  getCalendarMonth(): string {
    const firstDate = this.calendar()[0]?.date;

    if (!firstDate) {
      return '';
    }

    const [year, month, day] = firstDate.split('-');

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'long',
      }
    );
  }

  /**
   * Check whether a calendar date is in the past.
   *
   * Today = enabled
   * Future = enabled
   * Yesterday / older = disabled
   *
   * Uses YYYY-MM-DD string comparison to avoid
   * timezone conversion problems.
   */
  isPastDate(date: string): boolean {
    if (!date) {
      return false;
    }

    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    return date < todayString;
  }

  /**
   * Get platform CSS class
   */
  getPlatformClass(platform: string): string {
    switch (platform?.toUpperCase()) {
      case 'INSTAGRAM':
        return 'ig';

      case 'FACEBOOK':
        return 'fb';

      case 'YOUTUBE':
        return 'yt';

      default:
        return 'other';
    }
  }

  /**
   * Create new draft
   *
   * Currently local UI behaviour because
   * there is no create-draft API connected yet.
   */
  createDraft(): void {
    this.showAdd.set(false);

    this.toast.show(
      'Draft queued',
      "It'll appear in Approvals shortly",
      'ok'
    );

    this.newTopic = '';
    this.newDate = '';
  }

  getDateDay(date: string | undefined): string {
    if (!date) {
      return '';
    }

    const [, , day] = date.split('-');

    return day;
  }

  getMonthName(date: string | undefined): string {
    if (!date) {
      return '';
    }

    const [, month] = date.split('-');

    const monthNames = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];

    const monthIndex = Number(month) - 1;

    return monthNames[monthIndex] ?? '';
  }


  getPlatformIcon(platform: string): string {
    switch (platform?.toUpperCase()) {
      // Social platforms
      case 'INSTAGRAM':
        return 'logo-instagram';

      case 'FACEBOOK':
        return 'logo-facebook';

      case 'LINKEDIN':
        return 'logo-linkedin';

      case 'YOUTUBE':
        return 'logo-youtube';

      // Advertising platforms
      case 'GOOGLE_ADS':
        return 'logo-google';

      case 'META_ADS':
        return 'logo-facebook';

      // Activity / content types
      case 'SOCIAL_POST':
        return 'document-text-outline';

      case 'REEL':
        return 'videocam-outline';

      case 'STORY':
        return 'albums-outline';

      case 'CAROUSEL':
        return 'images-outline';

      case 'VIDEO':
        return 'videocam-outline';

      case 'BLOG':
        return 'document-text-outline';

      case 'OFFER':
        return 'pricetag-outline';

      case 'PRODUCT_PROMOTION':
        return 'bag-handle-outline';

      case 'TESTIMONIAL':
        return 'chatbubble-ellipses-outline';

      case 'EDUCATIONAL':
        return 'school-outline';

      case 'FESTIVAL':
        return 'sparkles-outline';

      case 'CUSTOMER_ENGAGEMENT':
        return 'people-outline';

      case 'LEAD_GENERATION':
        return 'person-add-outline';

      case 'BRAND_AWARENESS':
        return 'megaphone-outline';

      case 'ADVERTISEMENT':
        return 'megaphone-outline';

      // Default
      default:
        return 'globe-outline';
    }
  }


  getActivityIcon(activity: string): string {
    switch (activity?.toUpperCase()) {

      case 'SOCIAL_POST':
        return 'document-text-outline';

      case 'REEL':
        return 'videocam-outline';

      case 'STORY':
        return 'albums-outline';

      case 'CAROUSEL':
        return 'images-outline';

      case 'VIDEO':
        return 'videocam-outline';

      case 'BLOG':
        return 'document-text-outline';

      case 'OFFER':
        return 'pricetag-outline';

      case 'PRODUCT_PROMOTION':
        return 'bag-handle-outline';

      case 'TESTIMONIAL':
        return 'chatbubble-ellipses-outline';

      case 'EDUCATIONAL':
        return 'school-outline';

      case 'FESTIVAL':
        return 'sparkles-outline';

      case 'CUSTOMER_ENGAGEMENT':
        return 'people-outline';

      case 'LEAD_GENERATION':
        return 'person-add-outline';

      case 'BRAND_AWARENESS':
        return 'megaphone-outline';

      case 'ADVERTISEMENT':
        return 'megaphone-outline';

      case 'OTHER':
        return 'ellipsis-horizontal-circle-outline';

      default:
        return 'sparkles-outline';
    }
  }
}