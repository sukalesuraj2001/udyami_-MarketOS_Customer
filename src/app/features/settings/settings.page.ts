import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeService, ThemeMode } from '@core/services/theme.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

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

  threshold = '₹10,000';
  approvalChannel = 'Telegram + this app';
  escalation = '24 hours → escalate, then pause';

  connect(name: string): void {
    this.data.connectAccount(name);
    this.toast.show('Connected', `${name} is linked`, 'ok');
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
