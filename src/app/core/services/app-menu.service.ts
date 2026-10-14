import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

import { AppMenuSheetComponent } from '@shared/components/app-menu-sheet/app-menu-sheet.component';

/** The hamburger menu shown from the header of every page — a bottom sheet with the full nav. */
@Injectable({ providedIn: 'root' })
export class AppMenuService {
  private readonly modalCtrl = inject(ModalController);

  async open(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AppMenuSheetComponent,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
      cssClass: 'app-menu-sheet-modal',
    });
    await modal.present();
  }
}
