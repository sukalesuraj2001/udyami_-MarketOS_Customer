import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { catchError, of } from 'rxjs';

import { LeadFieldDatum, LeadItem, LeadsService } from '@core/services/leadsService/leads';
import { ToastService } from '@core/services/toast.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

type PlatformFilter = 'all' | 'fb' | 'ig';

const PLATFORM_TABS: { value: PlatformFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fb', label: 'Facebook' },
  { value: 'ig', label: 'Instagram' },
];

const FIELD_ALIASES: Record<string, string[]> = {
  name: ['full_name', 'first_name', 'name'],
  email: ['email'],
  phone: ['phone_number', 'phone'],
};

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    BackButtonComponent,
    CommonModule,
    FormsModule,
    IonicModule,
    SectionHeaderComponent,
    EmptyStateComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
})
export class LeadsPage {
  private readonly leadsService = inject(LeadsService);
  private readonly toast = inject(ToastService);

  readonly platformTabs = PLATFORM_TABS;

  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly isPulling = signal(false);
  readonly leads = signal<LeadItem[]>([]);
  readonly query = signal('');
  readonly platform = signal<PlatformFilter>('all');

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const p = this.platform();
    return this.leads().filter((lead) => {
      if (p !== 'all' && lead.platform !== p) return false;
      if (q) {
        const haystack = `${lead.name ?? ''} ${this.fieldValue(lead, 'email') ?? ''} ${this.fieldValue(lead, 'phone') ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  });

  readonly counts = computed(() => {
    const all = this.leads();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: all.length,
      facebook: all.filter((l) => l.platform === 'fb').length,
      instagram: all.filter((l) => l.platform === 'ig').length,
      thisWeek: all.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length,
    };
  });

  ionViewWillEnter(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.leadsService.getLeads()
      .pipe(catchError((error) => {
        console.error('Failed to load leads:', error);
        return of(null);
      }))
      .subscribe((response) => {
        if (response?.success) {
          this.leads.set(response.data);
        } else {
          this.hasError.set(true);
        }
        this.isLoading.set(false);
      });
  }

  pullLatest(): void {
    if (this.isPulling()) return;
    this.isPulling.set(true);

    this.leadsService.pullLeads()
      .pipe(catchError((error) => {
        console.error('Failed to pull leads:', error);
        this.toast.show('Could not pull leads', 'Please try again in a moment.', 'no');
        return of(null);
      }))
      .subscribe((response) => {
        this.isPulling.set(false);
        if (!response) return;

        if (response.errors.length) {
          this.toast.show('Some pages could not be checked', response.errors[0], 'no');
        } else if (response.saved > 0) {
          this.toast.show('Leads updated', `${response.saved} new lead${response.saved === 1 ? '' : 's'} found.`, 'ok');
        } else {
          this.toast.show('Up to date', 'No new leads since the last check.');
        }

        if (response.saved > 0) this.loadLeads();
      });
  }

  selectPlatform(platform: PlatformFilter): void {
    this.platform.set(platform);
  }

  onSearch(ev: Event): void {
    this.query.set((ev as CustomEvent).detail.value ?? '');
  }

  platformIcon(platform: string | null): string {
    if (platform === 'fb') return 'logo-facebook';
    if (platform === 'ig') return 'logo-instagram';
    return 'help-circle-outline';
  }

  platformLabel(platform: string | null): string {
    if (platform === 'fb') return 'Facebook';
    if (platform === 'ig') return 'Instagram';
    return 'Unknown';
  }

  /** Human-friendly "came from" line — page name plus whichever ad/form reference is available. */
  source(lead: LeadItem): string {
    const parts: string[] = [];
    if (lead.pageName) parts.push(lead.pageName);
    if (lead.adId) parts.push(`Ad ${lead.adId}`);
    else if (lead.formId) parts.push(`Form ${lead.formId}`);
    return parts.join(' · ') || 'Source unavailable';
  }

  fieldValue(lead: LeadItem, key: keyof typeof FIELD_ALIASES): string | null {
    return this.findField(lead.fieldData, FIELD_ALIASES[key]);
  }

  timeAgo(value: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
    }).format(new Date(value));
  }

  private findField(fieldData: LeadFieldDatum[] | null, aliases: string[]): string | null {
    const field = fieldData?.find((f) => aliases.includes(f.name?.toLowerCase()));
    return field?.values?.[0]?.trim() || null;
  }
}
