import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'mk-theme-toggle',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <button class="toggle" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
      <span class="icon-wrap" [class.spin]="theme.isDark()">
        <ion-icon [name]="theme.isDark() ? 'moon' : 'sunny'"></ion-icon>
      </span>
    </button>
  `,
  styles: [
    `
      .toggle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid var(--mk-line-2);
        background: var(--mk-surf-2);
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: background var(--mk-speed) var(--mk-ease), border-color var(--mk-speed) var(--mk-ease),
          transform var(--mk-speed-fast) var(--mk-ease);
      }
      .toggle:active {
        transform: scale(0.88);
      }
      .icon-wrap {
        display: grid;
        place-items: center;
        font-size: 17px;
        color: var(--mk-gold);
        animation: mkPopIn 320ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      ion-icon {
        transition: transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    `,
  ],
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
}
