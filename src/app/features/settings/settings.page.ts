import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeService, ThemeMode } from '@core/services/theme.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { Profile } from '@app/core/services/profileService/profile';
import {
  FacebookPage,
  MetaAdAccount,
  SocialMediaAccount,
} from '@app/core/interfaces/socialMediaAcounts.interface';
import { MetaConnectService } from '@app/core/services/meta-connect.service';

/** Platforms connected through Meta OAuth — never through the manual credentials form. */
const META_CONNECTION_NAMES = ['Facebook Page', 'Instagram Business', 'Meta Ads account'];

/** 'expired' = the Meta login behind the Page/ad-account lists expired (401). Not an app-session error. */
type MetaAuthState = 'ok' | 'expired' | 'notConnected';

interface OAuthReturn {
  pages: number;
  adAccounts: number;
}

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
  private meta = inject(MetaConnectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ---- Facebook & Instagram (Meta OAuth) ----
  readonly accounts = signal<SocialMediaAccount[]>([]);
  readonly statusLoaded = signal(false);
  readonly pages = signal<FacebookPage[]>([]);
  readonly adAccounts = signal<MetaAdAccount[]>([]);
  readonly adAccountsLoaded = signal(false);
  readonly metaAuth = signal<MetaAuthState>('ok');
  readonly connecting = signal(false);
  readonly connectError = signal<string | null>(null);

  readonly pagePickerOpen = signal(false);
  readonly adPickerOpen = signal(false);
  readonly savingSelection = signal(false);
  pickedPageId = '';
  pickedAdAccountId = '';
  private openAdPickerAfterPages = false;

  readonly facebookConnected = computed(() => this.isPlatformConnected('FACEBOOK'));
  readonly instagramConnected = computed(() => this.isPlatformConnected('INSTAGRAM'));
  readonly metaAdsConnected = computed(() => this.isPlatformConnected('META_ADS'));
  readonly selectedPage = computed(() => this.pages().find((p) => p.selected) ?? null);
  readonly selectedAdAccount = computed(() => this.adAccounts().find((a) => a.selected) ?? null);

  /** Non-Meta platforms still use the manual form. */
  readonly otherConnections = computed(() =>
    this.data.connections().filter((c) => !META_CONNECTION_NAMES.includes(c.name))
  );

  threshold = '₹10,000';
  approvalChannel = 'Telegram + this app';
  escalation = '24 hours → escalate, then pause';


  ionViewWillEnter() {
    const oauthResult = this.readOAuthReturn();
    this.loadSocialMediaAccounts(oauthResult);
  }


  loadSocialMediaAccounts(oauthResult: OAuthReturn | null = null): void {
    this.profileService.getUserSocialMediaAccount().subscribe({
      next: (response: SocialMediaAccount[]) => {
        this.accounts.set(response ?? []);
        this.statusLoaded.set(true);
        this.updateConnections(response ?? []);

        if (this.facebookConnected()) {
          this.loadMetaDetails(oauthResult);
        } else {
          this.pages.set([]);
          this.adAccounts.set([]);
          this.metaAuth.set('notConnected');
        }
      },

      error: (error) => {
        console.error(
          'Failed to load social media accounts:',
          error
        );
        this.statusLoaded.set(true);
      },
    });
  }

  private isPlatformConnected(platform: string): boolean {
    return this.accounts().some(
      (a) => a.platform?.toUpperCase() === platform && a.connected === true
    );
  }

  // ---------------------------------------------------------------------------
  // Connect flow (Meta OAuth)
  // ---------------------------------------------------------------------------

  connectFacebook(): void {
    if (this.connecting()) {
      return;
    }
    this.connecting.set(true);
    this.connectError.set(null);

    // Fresh single-use URL on every click; full-page navigation (no popup / XHR).
    this.meta.getConnectUrl().subscribe({
      next: ({ url }) => {
        window.location.href = url;
      },
      error: (error: HttpErrorResponse) => {
        this.connecting.set(false);
        const message = this.errorMessage(error, 'Unable to start Facebook login. Please try again.');
        this.connectError.set(message);
        this.toast.show('Connection failed', message, 'no');
      },
    });
  }

  /**
   * Reads ?platform=facebook&status=... set by the backend after Meta OAuth,
   * then strips the params so a refresh doesn't repeat the toast.
   */
  private readOAuthReturn(): OAuthReturn | null {
    const params = this.route.snapshot.queryParamMap;
    const status = params.get('status');
    if (params.get('platform') !== 'facebook' || !status) {
      return null;
    }

    let result: OAuthReturn | null = null;

    if (status === 'success') {
      this.connectError.set(null);
      this.metaAuth.set('ok');
      this.toast.show('Facebook & Instagram connected', undefined, 'ok');
      result = {
        pages: Number(params.get('pages')) || 0,
        adAccounts: Number(params.get('adAccounts')) || 0,
      };
    } else {
      const message = params.get('message') || 'Facebook connection failed. Please try again.';
      this.connectError.set(message);
      this.toast.show('Connection failed', message, 'no');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });

    return result;
  }

  // ---------------------------------------------------------------------------
  // Page and ad account pickers
  // ---------------------------------------------------------------------------

  private loadMetaDetails(oauthResult: OAuthReturn | null): void {
    this.openAdPickerAfterPages = !!oauthResult && oauthResult.adAccounts > 1;

    this.meta.getPages().subscribe({
      next: (pages) => {
        this.metaAuth.set('ok');
        this.pages.set(pages ?? []);

        if (oauthResult && oauthResult.pages > 1) {
          this.openPagePicker();
        } else if (this.openAdPickerAfterPages) {
          this.openAdPickerAfterPages = false;
          this.openAdPicker();
        }
      },
      error: (error: HttpErrorResponse) => this.handleMetaError(error),
    });

    this.meta.getAdAccounts().subscribe({
      next: (accounts) => {
        this.adAccounts.set(accounts ?? []);
        this.adAccountsLoaded.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.adAccountsLoaded.set(true);
        this.handleMetaError(error);
      },
    });
  }

  /** Expired / missing Meta login. Never logs the user out of the app. */
  private handleMetaError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.metaAuth.set('expired');
    } else if (error.status === 404) {
      this.metaAuth.set('notConnected');
    } else {
      this.toast.show('Facebook', this.errorMessage(error, 'Unable to load Facebook details.'), 'no');
    }
  }

  openPagePicker(): void {
    this.pickedPageId = this.selectedPage()?.id ?? this.pages()[0]?.id ?? '';
    this.pagePickerOpen.set(true);
  }

  onPagePickerDismiss(): void {
    this.pagePickerOpen.set(false);
    if (this.openAdPickerAfterPages) {
      this.openAdPickerAfterPages = false;
      this.openAdPicker();
    }
  }

  savePage(): void {
    if (!this.pickedPageId) {
      return;
    }
    if (this.pickedPageId === this.selectedPage()?.id) {
      this.pagePickerOpen.set(false);
      return;
    }

    this.savingSelection.set(true);
    this.meta.selectPage(this.pickedPageId).subscribe({
      next: (res) => {
        this.savingSelection.set(false);
        this.pagePickerOpen.set(false);
        this.toast.show('Page updated', res.pageName, 'ok');
        this.loadSocialMediaAccounts();
      },
      error: (error: HttpErrorResponse) => {
        this.savingSelection.set(false);
        this.handleMetaError(error);
        this.toast.show('Could not change Page', this.errorMessage(error, 'Please try again.'), 'no');
      },
    });
  }

  openAdPicker(): void {
    const firstActive = this.adAccounts().find((a) => a.active);
    this.pickedAdAccountId = this.selectedAdAccount()?.id ?? firstActive?.id ?? '';
    this.adPickerOpen.set(true);
  }

  saveAdAccount(): void {
    if (!this.pickedAdAccountId) {
      return;
    }
    if (this.pickedAdAccountId === this.selectedAdAccount()?.id) {
      this.adPickerOpen.set(false);
      return;
    }

    this.savingSelection.set(true);
    this.meta.selectAdAccount(this.pickedAdAccountId).subscribe({
      next: (res) => {
        this.savingSelection.set(false);
        this.adPickerOpen.set(false);
        this.toast.show('Ad account updated', res.name, 'ok');
        this.loadSocialMediaAccounts();
      },
      error: (error: HttpErrorResponse) => {
        this.savingSelection.set(false);
        this.handleMetaError(error);
        this.toast.show('Could not change ad account', this.errorMessage(error, 'Please try again.'), 'no');
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Disconnect
  // ---------------------------------------------------------------------------

  async disconnectFacebook(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Disconnect Facebook?',
      message:
        'This removes Facebook, Instagram and ad account access for Jyovix Studio. Scheduled posts to these accounts will stop.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Disconnect',
          role: 'destructive',
          handler: () => {
            this.meta.disconnect().subscribe({
              next: () => {
                this.pages.set([]);
                this.adAccounts.set([]);
                this.adAccountsLoaded.set(false);
                this.toast.show('Facebook & Instagram disconnected', undefined, 'ok');
                this.loadSocialMediaAccounts();
              },
              error: (error: HttpErrorResponse) => {
                this.toast.show('Disconnect failed', this.errorMessage(error, 'Please try again.'), 'no');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private errorMessage(error: HttpErrorResponse, fallback: string): string {
    const message = error?.error?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    return message || fallback;
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
    // Facebook, Instagram and Meta Ads only connect through Meta OAuth.
    if (META_CONNECTION_NAMES.includes(name)) {
      this.connectFacebook();
      return;
    }

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
