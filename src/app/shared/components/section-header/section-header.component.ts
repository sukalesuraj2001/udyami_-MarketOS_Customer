import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mk-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="phead mk-anim-in">
      <div class="txt">
        <h1>{{ title }}</h1>
        @if (subtitle) {
          <p>{{ subtitle }}</p>
        }
      </div>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .phead {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 18px;
        flex-wrap: wrap;
      }
      h1 {
        font-size: 21px;
        font-weight: 700;
      }
      p {
        color: var(--mk-muted);
        font-size: 13px;
        margin-top: 4px;
        max-width: 56ch;
        line-height: 1.5;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class SectionHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
}
