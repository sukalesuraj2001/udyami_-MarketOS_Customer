import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { Profile, UserProfile } from '@app/core/services/profileService/profile';

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
  private navCtrl = inject(NavController);
  private profileService = inject(Profile);
  readonly profile = signal<UserProfile | null>(null);
  readonly profileName = computed(() => this.profile()?.name || this.data.ownerName());
  readonly profileWorkspace = computed(() => {
    const profile = this.profile();
    return profile?.profile?.businessDetails?.businessName
      || profile?.profile?.selectedBusinessVertical
      || this.data.workspace();
  });
  walletBalance = signal<number>(0);
  readonly profileImage = computed(() => this.profile()?.profile?.profileImage || null);
  readonly profileInitials = computed(() => this.profileName()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase());


  ionViewWillEnter() {
    this.getUserProfileData();
    this.getUserWalletData();
  }

  getUserWalletData() {
    this.profileService.getUserWalletData().subscribe({
      next: (response) => {
        console.log('Wallet API Response:', response);

        console.log('Balance Coins:', response.balanceCoins);

        this.walletBalance.set(response.balanceCoins);
      },
      error: (error) => {
        console.error('Wallet API Error:', error);
        this.walletBalance.set(0);
      }
    });
  }
  options: ProfileOption[] = [
    { label: 'Settings', detail: 'Appearance, accounts and approval rules', icon: 'settings-outline', path: '/tabs/settings' },
    {
      label: 'Storage',
      detail: 'Manage images, reels and media files',
      icon: 'images-outline',
      path: '/tabs/storage'
    },
    { label: 'Approvals', detail: `${this.data.openApprovalsCount()} items waiting for you`, icon: 'checkmark-circle-outline', path: '/tabs/approvals' },
    { label: 'Brand brief', detail: 'Your positioning and content guardrails', icon: 'diamond-outline', path: '/tabs/brand-brief' },
    { label: 'Reports', detail: 'Performance and campaign insights', icon: 'bar-chart-outline', path: '/tabs/reports' },
    { label: 'Help & support', detail: 'Talk to the MarketOS team', icon: 'chatbubble-ellipses-outline', action: () => this.contactSupport() },
    {
      label: 'Log Out',
      detail: 'Sign out of your MarketOS account',
      icon: 'log-out-outline',
      action: () => this.logout()
    }
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
  getUserProfileData(): void {
    this.profileService.getUserProfileData().subscribe({
      next: (profileData) => {
        this.profile.set(profileData.data);
      },
      error: (error) => {
        console.error('Error fetching user profile data:', error);
      },
    });
  }


  logout() {
    // Clear all local storage
    localStorage.clear();

    // Clear session storage as well
    sessionStorage.clear();

    // Navigate to login and remove previous navigation history
    this.navCtrl.navigateRoot('/login');
  }
}
