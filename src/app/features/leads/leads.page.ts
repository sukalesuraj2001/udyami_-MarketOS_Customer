import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ScorePillComponent } from '@shared/components/score-pill/score-pill.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

type LeadFilter = 'all' | 'hot' | 'dq';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    BackButtonComponent,
    CommonModule,
    FormsModule,
    IonicModule,
    SectionHeaderComponent,
    ScorePillComponent,
    EmptyStateComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
})
export class LeadsPage {
  data = inject(MockDataService);
  private toast = inject(ToastService);

  query = signal('');
  filter = signal<LeadFilter>('all');

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const f = this.filter();
    return this.data.leads().filter((l) => {
      if (f === 'hot' && l.tier !== 'hot') return false;
      if (f === 'dq' && l.stage !== 'Disqualified') return false;
      if (q && !`${l.name} ${l.company}`.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  onSearch(ev: Event): void {
    this.query.set((ev as CustomEvent).detail.value ?? '');
  }

  onFilterChange(ev: Event): void {
    this.filter.set((ev as CustomEvent).detail.value as LeadFilter);
  }

  stageTag(stage: string): 'no' | 'neu' | 'ok' {
    if (stage === 'Disqualified') return 'no';
    if (stage === 'Nurture') return 'neu';
    return 'ok';
  }

  open(name: string): void {
    this.toast.show(`Opening ${name}`, 'Full timeline, consent record and call history');
  }
}
