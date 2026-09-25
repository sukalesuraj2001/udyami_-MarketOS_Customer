import { Component, inject } from '@angular/core';

import { environment } from '@env/environment';
import { LoaderService } from '@core/services/loader.service';

@Component({
  selector: 'mk-global-loader',
  standalone: true,
  template: `
    @if (loader.visible()) {
      <div class="loader-backdrop" role="status" aria-live="polite" [attr.aria-label]="loader.label() ?? 'Loading'">
        <div class="loader-card">
          <div class="logo-wrap">
            <span class="ring"></span>
            <span class="ring ring-2"></span>
            <span class="halo"></span>
            <img class="logo" src="assets/icon/icon-192.png" [alt]="appName" width="64" height="64" />
          </div>
          <div class="brand">{{ appName }}</div>
          <div class="caption mono">
            {{ loader.label() ?? 'Loading' }}<span class="dots"><i>.</i><i>.</i><i>.</i></span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .loader-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        background: color-mix(in srgb, var(--mk-bg) 72%, transparent);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        animation: loaderFade 200ms var(--mk-ease) both;
      }

      .loader-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        padding: 30px 38px 24px;
        border-radius: 22px;
        background: var(--mk-surf);
        border: 1px solid var(--mk-line);
        box-shadow: var(--mk-shadow-lg);
        animation: loaderPop 320ms var(--mk-ease) both;
      }

      .logo-wrap {
        position: relative;
        width: 104px;
        height: 104px;
        display: grid;
        place-items: center;
      }

      .logo {
        position: relative;
        width: 64px;
        height: 64px;
        border-radius: 16px;
        animation: logoBeat 1.4s ease-in-out infinite;
      }

      .ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: var(--mk-gold);
        border-right-color: var(--mk-gold-2);
        animation: ringSpin 1.1s linear infinite;
      }

      .ring-2 {
        inset: 9px;
        border-width: 2px;
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: var(--mk-gold-2);
        border-left-color: var(--mk-gold);
        opacity: 0.6;
        animation-duration: 1.6s;
        animation-direction: reverse;
      }

      .halo {
        position: absolute;
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: var(--mk-gold);
        animation: haloPulse 1.4s ease-out infinite;
      }

      .brand {
        font-family: var(--mk-font-display);
        font-weight: 700;
        font-size: 16px;
        letter-spacing: -0.02em;
        color: var(--mk-text);
      }

      .caption {
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--mk-dim);
      }

      .dots i {
        font-style: normal;
        animation: dotBlink 1.2s infinite both;
      }
      .dots i:nth-child(2) {
        animation-delay: 0.2s;
      }
      .dots i:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes loaderFade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes loaderPop {
        from { opacity: 0; transform: scale(0.92) translateY(6px); }
        to { opacity: 1; transform: none; }
      }
      @keyframes ringSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes logoBeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.9); }
      }
      @keyframes haloPulse {
        0% { transform: scale(1); opacity: 0.35; }
        100% { transform: scale(1.7); opacity: 0; }
      }
      @keyframes dotBlink {
        0%, 80%, 100% { opacity: 0.2; }
        40% { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .logo, .halo, .dots i { animation: none; }
        .halo { opacity: 0; }
        .ring { animation-duration: 2.4s; }
      }
    `,
  ],
})
export class GlobalLoaderComponent {
  readonly loader = inject(LoaderService);
  readonly appName = environment.appName;
}
