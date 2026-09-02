import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, IonicModule, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage {
  data = inject(MockDataService);
  private toast = inject(ToastService);

  barColor(pct: number): string {
    if (pct === 0) return 'var(--mk-red)';
    if (pct > 30) return 'var(--mk-green)';
    return 'var(--mk-gold)';
  }

  generate(): void {
    this.toast.show('Report generating', 'Your August PDF will appear here in a moment', 'ok');
  }
}
