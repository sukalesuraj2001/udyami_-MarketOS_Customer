import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, MenuController } from '@ionic/angular';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { MembershipService } from '@core/services/membership.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: () => number;
  badgeTone?: 'gold' | 'muted';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  data = inject(MockDataService);
  private alertCtrl = inject(AlertController);
  private menuCtrl = inject(MenuController);
  private membership = inject(MembershipService);
  toast = inject(ToastService);

  constructor() {
    this.membership.load();
  }

  groups: NavGroup[] = [
    {
      label: 'Workspace',
      items: [
        { path: '/dashboard', icon: 'grid-outline', label: 'Dashboard' },
        { path: '/brand-brief', icon: 'diamond-outline', label: 'Brand brief' },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { path: '/calendar', icon: 'calendar-outline', label: 'Calendar' },
        {
          path: '/approvals',
          icon: 'checkmark-circle-outline',
          label: 'Approvals',
          badge: () => this.data.openApprovalsCount(),
          badgeTone: 'gold',
        },
        { path: '/campaigns', icon: 'radio-outline', label: 'Campaigns' },
      ],
    },
    {
      label: 'Operations',
      items: [
        {
          path: '/incidents',
          icon: 'warning-outline',
          label: 'Incidents',
          badge: () => 0,
          badgeTone: 'muted',
        },
        { path: '/reports', icon: 'bar-chart-outline', label: 'Reports' },
      ],
    },
    {
      label: 'Account',
      items: [{ path: '/settings', icon: 'settings-outline', label: 'Settings' }],
    },
  ];

  async closeMenu(): Promise<void> {
    await this.menuCtrl.close();
  }

  async confirmPauseAll(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Pause everything?',
      message:
        'This stops every scheduled post and pauses every live campaign within 60 seconds. Nothing is deleted.',
      cssClass: 'mk-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Yes, pause everything',
          role: 'destructive',
          handler: () => {
            const r = this.data.pauseEverything();
            this.toast.show('Everything paused', `${r.campaigns} campaigns stopped · ${r.posts} posts held`, 'no');
          },
        },
      ],
    });
    await alert.present();
  }
}
