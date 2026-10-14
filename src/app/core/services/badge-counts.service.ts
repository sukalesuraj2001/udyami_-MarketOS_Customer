import { Injectable, inject, signal } from '@angular/core';

import { ApprovalService } from '@core/services/approval';
import { LeadsService, isRecentLead } from '@core/services/leadsService/leads';

/**
 * Small shared counters for the tab bar badges (Content / Leads). Both the
 * tab shell and the dashboard read from this instead of each fetching their
 * own copy, so the two never show different numbers.
 */
@Injectable({ providedIn: 'root' })
export class BadgeCountsService {
  private readonly approvalService = inject(ApprovalService);
  private readonly leadsService = inject(LeadsService);

  /** Generated content still waiting on a decision. */
  readonly pendingContent = signal(0);
  /** Enquiries received in the last 24 hours. */
  readonly newLeads = signal(0);

  refreshAll(): void {
    this.refreshContent();
    this.refreshLeads();
  }

  refreshContent(): void {
    this.approvalService.getGeneratedContent().subscribe({
      next: (response) => {
        const contents = response?.data ?? [];
        const pending = contents.filter(
          (content) => String(content.status || '').toUpperCase() === 'GENERATED'
        ).length;
        this.pendingContent.set(pending);
      },
      error: (error) => console.error('Failed to load content count:', error),
    });
  }

  refreshLeads(): void {
    this.leadsService.getLeads().subscribe({
      next: (response) => {
        const leads = response?.data ?? [];
        this.newLeads.set(leads.filter((lead) => isRecentLead(lead)).length);
      },
      error: (error) => console.error('Failed to load lead count:', error),
    });
  }
}
