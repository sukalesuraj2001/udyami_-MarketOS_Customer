import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'marketos.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** user's stored preference: light / dark / system */
  readonly mode = signal<ThemeMode>(this.readStored());
  /** the resolved boolean actually applied to the DOM */
  readonly isDark = signal<boolean>(false);

  private media = window.matchMedia?.('(prefers-color-scheme: dark)');

  constructor() {
    this.media?.addEventListener?.('change', () => {
      if (this.mode() === 'system') this.applyResolved();
    });

    effect(() => {
      const m = this.mode();
      localStorage.setItem(STORAGE_KEY, m);
      this.applyResolved();
    });
  }

  toggle(): void {
    const next = this.isDark() ? 'light' : 'dark';
    this.mode.set(next);
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private applyResolved(): void {
    const dark = this.mode() === 'dark' || (this.mode() === 'system' && !!this.media?.matches);
    this.isDark.set(dark);
    document.body.classList.toggle('theme-dark', dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0B0F14' : '#F7F5F0');
  }

  private readStored(): ThemeMode {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return saved ?? 'dark';
  }
}
