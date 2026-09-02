import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
  private profileService = inject(Profile);
  readonly profile = signal<UserProfile | null>(null);
  readonly profileName = computed(() => this.profile()?.name || this.data.ownerName());
  readonly profileWorkspace = computed(() => {
    const profile = this.profile();
    return profile?.profile?.businessDetails?.businessName
      || profile?.profile?.selectedBusinessVertical
      || this.data.workspace();
  });
  readonly profileImage = computed(() => this.profile()?.profile?.profileImage || null);
  readonly profileInitials = computed(() => this.profileName()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase());


  ngOnInit() {
    this.getUserProfileData();
  }
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
}
