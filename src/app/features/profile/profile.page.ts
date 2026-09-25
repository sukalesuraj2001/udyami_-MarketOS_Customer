import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { MockDataService } from '@core/services/mock-data.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { Profile, UserProfile } from '@app/core/services/profileService/profile';
import { AuthService } from '@core/services/auth.service';
import { getProfileCompletion } from '@app/core/services/profileService/profile-completion';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

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
  imports: [BackButtonComponent, CommonModule, IonicModule, ThemeToggleComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  data = inject(MockDataService);
  private router = inject(Router);
  private profileService = inject(Profile);
  private auth = inject(AuthService);
  readonly profile = signal<UserProfile | null>(null);
  readonly profileLoaded = signal(false);
  readonly profileComplete = computed(() => getProfileCompletion(this.profile()).hasProfile);
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


        this.walletBalance.set(response.balanceCoins);
      },
      error: (error) => {
        console.error('Wallet API Error:', error);
        this.walletBalance.set(0);
      }
    });
  }
  options: ProfileOption[] = [
    { label: 'Membership', detail: 'Your plan, status and activation', icon: 'ribbon-outline', path: '/tabs/membership' },
    { label: 'Settings', detail: 'Appearance, accounts and approval rules', icon: 'settings-outline', path: '/tabs/settings' },
    {
      label: 'Storage',
      detail: 'Manage images, reels and media files',
      icon: 'images-outline',
      path: '/tabs/storage'
    },
    { label: 'Approvals', detail: `${this.data.openApprovalsCount()} items waiting for you`, icon: 'checkmark-circle-outline', path: '/tabs/approvals' },
    // { label: 'Brand brief', detail: 'Your positioning and content guardrails', icon: 'diamond-outline', path: '/tabs/brand-brief' },
    { label: 'Reports', detail: 'Performance and campaign insights', icon: 'bar-chart-outline', path: '/tabs/reports' },
    // { label: 'Help & support', detail: 'Guides, answers and the Jyovix Marketing team', icon: 'chatbubble-ellipses-outline', path: '/tabs/help-support' },
    {
      label: 'Log Out',
      detail: 'Sign out of your Jyovix Marketing account',
      icon: 'log-out-outline',
      action: () => this.logout()
    }
  ];

  contactSupport(): void {
    this.router.navigateByUrl('/tabs/help-support');
  }

  openOption(option: ProfileOption): void {
    if (option.path) {
      this.router.navigateByUrl(option.path);
      return;
    }
    option.action?.();
  }

  openDetails(): void {
    this.router.navigateByUrl('/tabs/profile-details');
  }

  openEdit(): void {
    this.router.navigateByUrl('/tabs/profile-edit');
  }

  openWorkspace(): void {
    this.router.navigateByUrl('/tabs/dashboard');
  }
  getUserProfileData(): void {
    this.profileService.getUserProfileData().subscribe({
      next: (profileData) => {
        this.profile.set(profileData.data);
        this.profileLoaded.set(true);
      },
      error: (error) => {
        console.error('Error fetching user profile data:', error);
      },
    });
  }


  logout(): void {
    void this.auth.signOut();
  }
}
