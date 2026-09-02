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

  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 17) {
      return 'Good afternoon';
    }

    if (hour < 21) {
      return 'Good evening';
    }

    return 'Good night';
  }
  get ownerName(): string {
    try {
      const stored = localStorage.getItem('marketos.auth');

      if (!stored) {
        return '';
      }

      const auth = JSON.parse(stored);

      return auth?.user?.name ?? '';
    } catch {
      return '';
    }
  }
}
