import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular/standalone';

export type ToastTone = 'ok' | 'no' | 'default';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController)

  async show(title: string, message?: string, tone: ToastTone = 'default'): Promise<void> {
    const color = tone === 'ok' ? 'success' : tone === 'no' ? 'danger' : 'primary';
    const toast = await this.toastCtrl.create({
      header: title,
      message,
      duration: 3000,
      position: 'bottom',
      color,
      cssClass: 'mk-toast',
      animated: true,
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await toast.present();
  }


async success(message: string): Promise<void> {
  const alert = await this.alertCtrl.create({
    header: 'Success',
    message,
    buttons: [
      {
        text: 'Done',
        role: 'confirm',
        cssClass: 'success-alert-button',
      },
    ],
    cssClass: 'production-success-alert',
    backdropDismiss: true,
  });

  await alert.present();
}
}
