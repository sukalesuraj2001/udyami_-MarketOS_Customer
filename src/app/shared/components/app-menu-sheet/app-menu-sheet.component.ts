import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { Profile } from '@core/services/profileService/profile';
import { BadgeCountsService } from '@core/services/badge-counts.service';

interface MenuRow {
  label: string;
  icon: string;
  route: string;
}

const MENU_ROWS: MenuRow[] = [
  { label: 'Dashboard', icon: 'home-outline', route: '/tabs/dashboard' },
  { label: 'Content approvals', icon: 'checkmark-done-outline', route: '/tabs/approvals' },
  { label: 'Calendar', icon: 'calendar-outline', route: '/tabs/calendar' },
  { label: 'Ad Budget', icon: 'wallet-outline', route: '/tabs/ad-budget' },
  { label: 'Advertising', icon: 'megaphone-outline', route: '/tabs/campaigns' },
  { label: 'Enquiries', icon: 'file-tray-outline', route: '/tabs/leads' },
  { label: 'Monthly report', icon: 'bar-chart-outline', route: '/tabs/reports' },
  { label: 'AI assistant', icon: 'sparkles-outline', route: '/tabs/ai' },
  { label: 'Your plan', icon: 'ribbon-outline', route: '/tabs/membership' },
  { label: 'Business profile', icon: 'person-circle-outline', route: '/tabs/profile' },
  { label: 'Incidents', icon: 'warning-outline', route: '/tabs/incidents' },
  { label: 'Storage', icon: 'cube-outline', route: '/tabs/storage' },
  { label: 'Settings', icon: 'settings-outline', route: '/tabs/settings' },
  { label: 'Help & support', icon: 'headset-outline', route: '/tabs/help-support' },
];

@Component({
  selector: 'mk-app-menu-sheet',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './app-menu-sheet.component.html',
  styleUrls: ['./app-menu-sheet.component.scss'],
})
export class AppMenuSheetComponent {
  private readonly modalCtrl = inject(ModalController);
  private readonly auth = inject(AuthService);
  private readonly profile = inject(Profile);
  private readonly router = inject(Router);
  readonly badges = inject(BadgeCountsService);

  readonly rows = MENU_ROWS;

  get name(): string {
    return this.auth.storedLogin?.user?.name || 'Your account';
  }

  /** "Client" alone until the business name is cached by whichever page loaded it. */
  get subtitle(): string {
    const business = this.profile.cachedProfile()?.profile?.businessDetails?.businessName;
    return business ? `Client · ${business}` : 'Client';
  }

  badgeFor(route: string): number {
    if (route === '/tabs/approvals') return this.badges.pendingContent();
    if (route === '/tabs/leads') return this.badges.newLeads();
    return 0;
  }

  async go(route: string): Promise<void> {
    await this.modalCtrl.dismiss();
    void this.router.navigateByUrl(route);
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }

  async signOut(): Promise<void> {
    await this.modalCtrl.dismiss();
    void this.auth.signOut();
  }
}
