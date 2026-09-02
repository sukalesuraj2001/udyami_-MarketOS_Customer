import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'mk-empty-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="empty mk-anim-in">
      <ion-icon [name]="icon" class="ic"></ion-icon>
      <h3>{{ title }}</h3>
      @if (subtitle) {
        <p>{{ subtitle }}</p>
      }
    </div>
  `,
  styles: [
    `
      .empty {
        text-align: center;
        padding: 52px 20px;
        color: var(--mk-dim);
      }
      .ic {
        font-size: 34px;
        color: var(--mk-line-2);
        margin-bottom: 10px;
      }
      h3 {
        font-size: 16px;
        color: var(--mk-muted);
        margin-bottom: 6px;
      }
      p {
        font-size: 13px;
        color: var(--mk-dim);
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'sparkles-outline';
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
}
