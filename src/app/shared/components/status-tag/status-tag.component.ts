import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagKind = 'pend' | 'ok' | 'no' | 'live' | 'neu' | 'gold';

@Component({
  selector: 'mk-tag',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="mk-tag" [ngClass]="kind">{{ text }}</span>`,
})
export class StatusTagComponent {
  @Input({ required: true }) kind: TagKind = 'neu';
  @Input({ required: true }) text = '';
}
