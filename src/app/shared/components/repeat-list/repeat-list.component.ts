import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RepeatColumn, RepeatRow } from './repeat-list.types';

/**
 * Editable list of rows (zones, packages, contacts…). Mutates `rows` in place,
 * so the parent's array always holds the current values.
 */
@Component({
  selector: 'mk-repeat-list',
  standalone: true,
  imports: [FormsModule, IonicModule],
  template: `
    @if (hint) {
      <p class="hint">{{ hint }}</p>
    }

    @for (row of rows; track row; let i = $index; let last = $last) {
      <div class="row-card">
        <div class="row-head">
          <span class="row-title">{{ itemLabel }} {{ i + 1 }}</span>
          <div class="row-actions">
            <button type="button" [disabled]="i === 0" (click)="move(i, -1)" aria-label="Move up">
              <ion-icon name="chevron-up-outline"></ion-icon>
            </button>
            <button type="button" [disabled]="last" (click)="move(i, 1)" aria-label="Move down">
              <ion-icon name="chevron-down-outline"></ion-icon>
            </button>
            <button type="button" class="danger" (click)="remove(i)" [attr.aria-label]="'Remove ' + itemLabel">
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </div>
        </div>

        <div class="grid">
          @for (column of columns; track column.key) {
            <ion-item lines="none" class="field" [class.full]="column.full || column.type === 'textarea' || column.type === 'lines'">
              @switch (column.type) {
                @case ('textarea') {
                  <ion-textarea [label]="column.label" labelPlacement="floating" [autoGrow]="true" [rows]="2"
                    [placeholder]="column.placeholder ?? ''" [(ngModel)]="row[column.key]"
                    [ngModelOptions]="{ standalone: true }"></ion-textarea>
                }
                @case ('lines') {
                  <ion-textarea [label]="column.label" labelPlacement="floating" [autoGrow]="true" [rows]="3"
                    [placeholder]="column.placeholder ?? 'One item per line'" helperText="One item per line"
                    [(ngModel)]="row[column.key]" [ngModelOptions]="{ standalone: true }"></ion-textarea>
                }
                @case ('number') {
                  <ion-input type="number" inputmode="decimal" [label]="column.label" labelPlacement="floating"
                    [placeholder]="column.placeholder ?? ''" [(ngModel)]="row[column.key]"
                    [ngModelOptions]="{ standalone: true }"></ion-input>
                }
                @case ('date') {
                  <ion-input type="date" [label]="column.label" labelPlacement="stacked"
                    [(ngModel)]="row[column.key]" [ngModelOptions]="{ standalone: true }"></ion-input>
                }
                @default {
                  <ion-input [label]="column.label" labelPlacement="floating" [placeholder]="column.placeholder ?? ''"
                    [(ngModel)]="row[column.key]" [ngModelOptions]="{ standalone: true }"></ion-input>
                }
              }
            </ion-item>
          }
        </div>
      </div>
    } @empty {
      <p class="empty">No {{ itemLabel.toLowerCase() }}s added yet.</p>
    }

    <button type="button" class="add" (click)="add()">
      <ion-icon name="add-outline"></ion-icon>
      Add {{ itemLabel.toLowerCase() }}
    </button>
  `,
  styles: [
    `
      :host { display: block; }

      .hint, .empty {
        margin: 0 0 10px;
        color: var(--mk-dim);
        font-size: 12px;
      }

      .row-card {
        margin-bottom: 10px;
        padding: 10px 10px 2px;
        border-radius: var(--mk-radius-sm);
        background: var(--mk-bg);
        border: 1px solid var(--mk-line);
        animation: mkFadeUp var(--mk-speed) var(--mk-ease) both;
      }

      .row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .row-title {
        color: var(--mk-gold);
        font: 700 10.5px var(--mk-font-mono);
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .row-actions {
        display: flex;
        gap: 4px;

        button {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid var(--mk-line);
          background: var(--mk-surf);
          color: var(--mk-muted);
          font-size: 14px;
          cursor: pointer;

          &:disabled { opacity: 0.35; cursor: default; }
          &.danger { color: var(--mk-red); }
        }
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 8px;
      }

      .field {
        --background: var(--mk-surf);
        --padding-start: 10px;
        --inner-padding-end: 10px;
        margin-bottom: 8px;
        border: 1px solid var(--mk-line);
        border-radius: var(--mk-radius-sm);

        &.full { grid-column: 1 / -1; }
        &.ion-focused { border-color: var(--mk-gold); }

        ion-input, ion-textarea {
          --color: var(--mk-text);
          --placeholder-color: var(--mk-dim);
        }
      }

      .add {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        height: 40px;
        border-radius: var(--mk-radius-sm);
        border: 1px dashed var(--mk-line-2);
        background: transparent;
        color: var(--mk-gold);
        font: 700 13px var(--mk-font-body);
        cursor: pointer;

        &:hover { border-color: var(--mk-gold); background: var(--mk-gold-fade); }
      }

      @media (max-width: 380px) {
        .grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class RepeatListComponent {
  @Input({ required: true }) rows: RepeatRow[] = [];
  @Input({ required: true }) columns: RepeatColumn[] = [];
  @Input() itemLabel = 'Item';
  @Input() hint?: string;

  add(): void {
    const row: RepeatRow = {};
    for (const column of this.columns) {
      row[column.key] = column.type === 'number' ? null : '';
    }
    this.rows.push(row);
  }

  remove(index: number): void {
    this.rows.splice(index, 1);
  }

  move(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.rows.length) return;
    [this.rows[index], this.rows[target]] = [this.rows[target], this.rows[index]];
  }
}
