import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

export type ToastTone = 'ok' | 'no' | 'default';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastCtrl = inject(ToastController);

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
}
