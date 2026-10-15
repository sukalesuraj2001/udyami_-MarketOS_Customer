import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthService } from '@core/services/auth.service';

export type LeadStatus = 'new' | 'called' | 'quoted' | 'won' | 'lost';

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  called: 'Called',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

const STORAGE_PREFIX = 'marketos.leadStatus.';

/**
 * The backend has no concept of a lead's follow-up status — it only mirrors
 * what Meta sent. Whether someone has been called, quoted, won or lost is
 * tracked here, on-device, keyed by the signed-in user so it never crosses
 * accounts on a shared device. A lead with no entry is "new".
 */
@Injectable({ providedIn: 'root' })
export class LeadStatusService {
  private readonly auth = inject(AuthService);
  private readonly statuses = signal<Record<string, LeadStatus>>(this.readAll());

  readonly version = computed(() => this.statuses());

  getStatus(leadId: string): LeadStatus {
    return this.statuses()[leadId] ?? 'new';
  }

  setStatus(leadId: string, status: LeadStatus): void {
    const next = { ...this.statuses() };
    if (status === 'new') {
      delete next[leadId];
    } else {
      next[leadId] = status;
    }
    this.statuses.set(next);
    this.writeAll(next);
  }

  private get storageKey(): string {
    return STORAGE_PREFIX + (this.auth.userId || 'anon');
  }

  private readAll(): Record<string, LeadStatus> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private writeAll(value: Record<string, LeadStatus>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode, quota) — status just won't persist
    }
  }
}
