import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, KpiCardComponent, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  data = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  skeletonRows = Array.from({ length: 4 });

  goApprovals(): void {
    this.router.navigateByUrl('/approvals');
  }

  actOnCreative(): void {
    this.data.addRetireCreativeApproval();
    this.toast.show('Queued for approval', 'Retire Creative 07 — added to your queue', 'ok');
  }

  refresh(ev: CustomEvent): void {
    setTimeout(() => (ev.target as HTMLIonRefresherElement).complete(), 700);
  }
}
