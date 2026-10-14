import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { AppMenuService } from '@core/services/app-menu.service';

/** The hamburger button every top-level page header ends with. */
@Component({
  selector: 'mk-menu-button',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-button fill="clear" (click)="appMenu.open()" aria-label="Menu">
      <ion-icon name="menu-outline" slot="icon-only"></ion-icon>
    </ion-button>
  `,
})
export class MenuButtonComponent {
  readonly appMenu = inject(AppMenuService);
}
