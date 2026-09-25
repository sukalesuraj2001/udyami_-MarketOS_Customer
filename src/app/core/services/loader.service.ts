import { Injectable, computed, signal } from '@angular/core';

/** Delay before the overlay appears, so fast requests don't flash it. */
const SHOW_DELAY_MS = 180;

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly pending = signal(0);
  private readonly delayed = signal(false);
  private readonly message = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** True while the global loader overlay should be on screen. */
  readonly visible = computed(() => this.pending() > 0 && this.delayed());
  readonly label = this.message.asReadonly();

  show(message?: string): void {
    if (message) {
      this.message.set(message);
    }
    this.pending.update((count) => count + 1);

    if (this.pending() === 1 && !this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.delayed.set(true);
      }, SHOW_DELAY_MS);
    }
  }

  hide(): void {
    this.pending.update((count) => Math.max(0, count - 1));

    if (this.pending() === 0) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.delayed.set(false);
      this.message.set(null);
    }
  }

  /** Force-clears every pending show() call. */
  reset(): void {
    this.pending.set(0);
    this.hide();
  }
}
