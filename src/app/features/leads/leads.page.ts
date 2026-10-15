import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular/standalone';
import { catchError, of } from 'rxjs';

import {
  LeadItem,
  LeadsService,
  leadField,
  leadSource,
  leadWants,
  leadArea,
  leadDisplayName,
  formatLeadTime,
} from '@core/services/leadsService/leads';
import { LeadStatus, LeadStatusService, LEAD_STATUS_LABEL } from '@core/services/lead-status.service';
import { ToastService } from '@core/services/toast.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { MenuButtonComponent } from '@shared/components/menu-button/menu-button.component';

type StatusFilter = 'all' | LeadStatus;

const STATUS_FILTERS: StatusFilter[] = ['all', 'new', 'called', 'quoted', 'won', 'lost'];

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmptyStateComponent,
    ThemeToggleComponent,
    MenuButtonComponent,
  ],
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
})
export class LeadsPage {
  private readonly leadsService = inject(LeadsService);
  private readonly toast = inject(ToastService);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  readonly leadStatus = inject(LeadStatusService);

  readonly statusFilters = STATUS_FILTERS;
  readonly statusLabel = LEAD_STATUS_LABEL;

  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly isPulling = signal(false);
  readonly leads = signal<LeadItem[]>([]);
  readonly query = signal('');
  readonly statusFilter = signal<StatusFilter>('all');

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const status = this.statusFilter();
    // Reading .version() ties this computed to the status store, so changing
    // a lead's status re-filters the list immediately.
    this.leadStatus.version();

    return [...this.leads()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((lead) => {
        if (status !== 'all' && this.leadStatus.getStatus(lead.id) !== status) return false;
        if (q) {
          const haystack = `${lead.name ?? ''} ${leadField(lead, 'email') ?? ''} ${leadField(lead, 'phone') ?? ''}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });
  });

  readonly counts = computed(() => {
    this.leadStatus.version();
    const counts: Record<StatusFilter, number> = { all: 0, new: 0, called: 0, quoted: 0, won: 0, lost: 0 };
    for (const lead of this.leads()) {
      counts.all++;
      counts[this.leadStatus.getStatus(lead.id)]++;
    }
    return counts;
  });

  readonly uncalledCount = computed(() => this.counts().new);

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

  selectStatus(status: StatusFilter): void {
    this.statusFilter.set(status);
  }

  onSearch(ev: Event): void {
    this.query.set((ev as CustomEvent).detail.value ?? '');
  }


  name(lead: LeadItem): string {
    return leadDisplayName(lead);
  }

  phone(lead: LeadItem): string | null {
    return leadField(lead, 'phone');
  }

  wants(lead: LeadItem): string {
    return leadWants(lead) || 'Not specified';
  }

  area(lead: LeadItem): string {
    return leadArea(lead) || '—';
  }

  source(lead: LeadItem): string {
    return leadSource(lead);
  }

  timeAgo(value: string): string {
    return formatLeadTime(value);
  }

  initialsFor(lead: LeadItem): string {
    return this.name(lead).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
  }

  statusOf(lead: LeadItem): LeadStatus {
    return this.leadStatus.getStatus(lead.id);
  }

  async changeStatus(lead: LeadItem): Promise<void> {
    const current = this.statusOf(lead);
    const sheet = await this.actionSheetCtrl.create({
      header: 'Mark this enquiry as…',
      cssClass: 'mk-alert',
      buttons: [
        ...(['new', 'called', 'quoted', 'won', 'lost'] as LeadStatus[]).map((status) => ({
          text: LEAD_STATUS_LABEL[status] + (status === current ? ' ✓' : ''),
          handler: () => this.leadStatus.setStatus(lead.id, status),
        })),
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }
}
