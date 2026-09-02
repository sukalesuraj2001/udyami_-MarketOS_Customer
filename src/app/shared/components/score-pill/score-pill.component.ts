import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadTier } from '@core/models/models';

@Component({
  selector: 'mk-score-pill',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="score mono" [ngClass]="tier">{{ score }}</span>`,
  styles: [
    `
      .score {
        font-weight: 700;
        font-size: 13px;
        padding: 3px 10px;
        border-radius: 8px;
        display: inline-block;
        min-width: 40px;
        text-align: center;
      }
      .hot {
        background: rgba(31, 143, 95, 0.16);
        color: var(--mk-green);
      }
      .warm {
        background: rgba(184, 122, 30, 0.16);
        color: var(--mk-amber);
      }
      .cold {
        background: var(--mk-surf-3);
        color: var(--mk-dim);
      }
    `,
  ],
})
export class ScorePillComponent {
  @Input({ required: true }) score = 0;
  @Input({ required: true }) tier: LeadTier = 'cold';
}
