import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.scss'],
})
export class CampaignsPage {
  data = inject(MockDataService);
  private toast = inject(ToastService);

  showCaps = signal(false);
  dailyCap = '₹3,000';
  monthlyCeiling = '₹90,000';
  breaker = '2.5× trailing average';

  toggle(name: string): void {
    const c = this.data.toggleCampaign(name);
    if (!c) return;
    this.toast.show(c.status === 'live' ? 'Campaign resumed' : 'Campaign paused', c.name, c.status === 'live' ? 'ok' : 'no');
  }

  saveCaps(): void {
    this.showCaps.set(false);
    this.toast.show('Caps updated', 'Enforced on the ad account, not just here', 'ok');
  }
}
