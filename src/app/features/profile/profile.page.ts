import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

interface ProfileOption {
  label: string;
  detail: string;
  icon: string;
  path?: string;
  action?: () => void;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, ThemeToggleComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  data = inject(MockDataService);
  private router = inject(Router);
  private toast = inject(ToastService);

  options: ProfileOption[] = [
    { label: 'Settings', detail: 'Appearance, accounts and approval rules', icon: 'settings-outline', path: '/tabs/settings' },
    { label: 'Approvals', detail: `${this.data.openApprovalsCount()} items waiting for you`, icon: 'checkmark-circle-outline', path: '/tabs/approvals' },
    { label: 'Brand brief', detail: 'Your positioning and content guardrails', icon: 'diamond-outline', path: '/tabs/brand-brief' },
    { label: 'Reports', detail: 'Performance and campaign insights', icon: 'bar-chart-outline', path: '/tabs/reports' },
    { label: 'Help & support', detail: 'Talk to the MarketOS team', icon: 'chatbubble-ellipses-outline', action: () => this.contactSupport() },
  ];

  contactSupport(): void {
    this.toast.show('Support request started', 'We will get back to you shortly', 'ok');
  }

  openOption(option: ProfileOption): void {
    if (option.path) {
      this.router.navigateByUrl(option.path);
      return;
    }
    option.action?.();
  }

  openWorkspace(): void {
    this.router.navigateByUrl('/tabs/dashboard');
  }
}
