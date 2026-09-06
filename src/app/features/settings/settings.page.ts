import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeService, ThemeMode } from '@core/services/theme.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { Profile } from '@app/core/services/profileService/profile';
import { SocialMediaAccount } from '@app/core/interfaces/socialMediaAcounts.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  data = inject(MockDataService);
  theme = inject(ThemeService);
  private toast = inject(ToastService);
  private alertCtrl = inject(AlertController);
  private profileService = inject(Profile);

  threshold = '₹10,000';
  approvalChannel = 'Telegram + this app';
  escalation = '24 hours → escalate, then pause';


  ionViewWillEnter() {
    this.loadSocialMediaAccounts();
  }


  loadSocialMediaAccounts(): void {
    this.profileService.getUserSocialMediaAccount().subscribe({
      next: (response: SocialMediaAccount[]) => {
        console.log('Social media accounts:', response);

        this.updateConnections(response);
      },

      error: (error) => {
        console.error(
          'Failed to load social media accounts:',
          error
        );
      },
    });
  }


  updateConnections(accounts: SocialMediaAccount[]): void {
    const updatedConnections = this.data.connections().map((connection) => {

      const platform = this.getPlatformFromConnectionName(
        connection.name
      );

      const account = accounts.find(
        (item) =>
          item.platform.toUpperCase() === platform &&
          item.connected === true &&
          item.isActive === true
      );

      return {
        ...connection,
        connected: !!account,
      };
    });

    this.data.connections.set(updatedConnections);
  }


  getPlatformFromConnectionName(name: string): string {
    switch (name) {
      case 'Facebook Page':
        return 'FACEBOOK';

      case 'Instagram Business':
        return 'INSTAGRAM';

      case 'Meta Ads account':
        return 'META_ADS';

      case 'Google Ads':
        return 'GOOGLE_ADS';

      case 'Google Analytics 4':
        return 'GOOGLE_ANALYTICS';

      case 'Your ERP':
        return 'ERP';

      default:
        return '';
    }
  }
  async connect(name: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: `Connect ${name}`,
      message: `Enter your ${name} account credentials.`,

      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Username or email',
          attributes: {
            autocomplete: 'username',
          },
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password',
          attributes: {
            autocomplete: 'current-password',
          },
        },
      ],

      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },

        {
          text: 'Continue',

          handler: (value: {
            username?: string;
            password?: string;
          }) => {

            // Validate username
            if (!value.username?.trim()) {
              this.toast.show(
                'Username required',
                'Enter your username or email',
                'no'
              );

              return false;
            }

            // Validate password
            if (!value.password?.trim()) {
              this.toast.show(
                'Password required',
                'Enter your password',
                'no'
              );

              return false;
            }

            // Get backend platform enum value
            const platform =
              this.getPlatformFromConnectionName(name);

            // Validate platform
            if (!platform) {
              this.toast.show(
                'Invalid platform',
                `Unable to identify ${name}`,
                'no'
              );

              return false;
            }

            // Save social media account
            this.profileService
              .connectSocialMediaAccount(
                platform,
                value.username.trim(),
                value.password
              )
              .subscribe({

                next: (response) => {
                  console.log(
                    'Social media account saved:',
                    response
                  );

                  // Update UI
                  this.data.connections.update((connections) =>
                    connections.map((connection) =>
                      connection.name === name
                        ? {
                          ...connection,
                          connected: true,
                        }
                        : connection
                    )
                  );

                  this.toast.success(
                    `${name} connected successfully. An Admin will review and activate your social media account within 1-2 working days.`
                  );
                },

                error: (error) => {
                  console.error(
                    'Failed to connect social media account:',
                    error
                  );

                  this.toast.show(
                    'Connection failed',
                    error?.error?.message ||
                    `Unable to connect ${name}`,
                    'no'
                  );
                },
              });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  onThresholdChange(): void {
    this.toast.show('Threshold updated', `${this.threshold} — only the owner can approve above this`, 'ok');
  }

  onChannelChange(): void {
    this.toast.show('Approval channel', this.approvalChannel);
  }

  onEscalationChange(): void {
    this.toast.show('Escalation set', this.escalation);
  }

  onThemeChange(mode: unknown): void {
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      this.theme.setMode(mode);
    }
  }

  async pauseEverything(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Pause everything?',
      message: 'This stops every scheduled post and pauses every live campaign within 60 seconds. Nothing is deleted.',
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
