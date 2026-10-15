import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

import { BadgeCountsService } from '@core/services/badge-counts.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonicModule, RouterLink],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {
  readonly badges = inject(BadgeCountsService);

  ionViewWillEnter(): void {
    this.badges.refreshAll();
  }
}
