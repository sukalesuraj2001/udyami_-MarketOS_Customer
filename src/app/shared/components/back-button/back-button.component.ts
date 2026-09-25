import { Component, Input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';

/**
 * App-wide back button.
 *
 * Goes back through the Ionic page stack, else to `defaultHref`. Browser
 * history is deliberately not used — it could lead back to the login page or
 * off the app. With nowhere to go it gives a small shake.
 */
@Component({
  selector: 'mk-back-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="mk-back"
      [class.launch]="launching()"
      [class.shake]="shaking()"
      [attr.aria-label]="label"
      (click)="goBack()"
    >
      <span class="ring" aria-hidden="true"></span>
      <span class="core" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="arrow">
          <path class="ghost" d="M15 5 8 12l7 7" />
          <path class="main" d="M15 5 8 12l7 7" />
          <path class="tail" d="M9 12h9" />
        </svg>
      </span>
      <span class="label">{{ label }}</span>
      <span class="ripple" aria-hidden="true"></span>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        margin-inline-start: 6px;
      }

      .mk-back {
        --size: 38px;
        position: relative;
        display: inline-flex;
        align-items: center;
        height: var(--size);
        min-width: var(--size);
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: var(--mk-text);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        animation: backIn 480ms var(--mk-ease) both;
        transition: transform var(--mk-speed-fast) var(--mk-ease);
      }

      /* Rotating gold gradient border, drawn as a masked ring. */
      .ring {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1.5px;
        background: conic-gradient(
          from var(--angle, 0deg),
          var(--mk-gold),
          transparent 30%,
          var(--mk-gold-2) 55%,
          transparent 80%,
          var(--mk-gold)
        );
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: ringTurn 4s linear infinite;
        opacity: 0.85;
      }

      .core {
        position: relative;
        display: grid;
        place-items: center;
        flex: none;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        background: var(--mk-surf-2);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 12px rgba(27, 36, 48, 0.12);
        transition: background var(--mk-speed) var(--mk-ease), transform var(--mk-speed-fast) var(--mk-ease);
      }

      .arrow {
        width: 18px;
        height: 18px;
        overflow: visible;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;

        .main,
        .tail {
          transition: transform var(--mk-speed) var(--mk-ease), opacity var(--mk-speed) var(--mk-ease);
        }

        .tail {
          stroke-dasharray: 9;
          stroke-dashoffset: 9;
        }

        .ghost {
          stroke: var(--mk-gold);
          opacity: 0;
        }
      }

      /* Label slides out on hover (desktop) — hidden on touch-only screens. */
      .label {
        position: relative;
        max-width: 0;
        overflow: hidden;
        white-space: nowrap;
        opacity: 0;
        font: 700 13px var(--mk-font-body);
        transition: max-width var(--mk-speed-slow) var(--mk-ease), opacity var(--mk-speed) var(--mk-ease),
          padding var(--mk-speed-slow) var(--mk-ease);
      }

      .ripple {
        position: absolute;
        top: 50%;
        left: calc(var(--size) / 2);
        width: var(--size);
        height: var(--size);
        margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
        border-radius: 50%;
        border: 2px solid var(--mk-gold);
        opacity: 0;
        pointer-events: none;
      }

      @media (hover: hover) {
        .mk-back:hover {
          .core {
            background: var(--mk-gold-fade);
            color: var(--mk-gold);
          }
          .label {
            max-width: 60px;
            padding: 0 14px 0 8px;
            opacity: 1;
          }
          .main {
            animation: nudge 900ms var(--mk-ease) infinite;
          }
          .tail {
            stroke-dashoffset: 0;
            animation: nudge 900ms var(--mk-ease) infinite;
          }
          .ring {
            animation-duration: 1.6s;
            opacity: 1;
          }
        }
      }

      .mk-back:focus-visible {
        outline: 2px solid var(--mk-gold);
        outline-offset: 3px;
      }

      .mk-back:active .core {
        transform: scale(0.9);
      }

      /* Tap: the arrow dashes left leaving a ghost trail, ring ripples out. */
      .mk-back.launch {
        .main,
        .tail {
          animation: dash 420ms var(--mk-ease) both;
        }
        .tail {
          stroke-dashoffset: 0;
        }
        .ghost {
          animation: ghost 420ms var(--mk-ease) both;
        }
        .ripple {
          animation: ripple 520ms ease-out both;
        }
      }

      .mk-back.shake {
        animation: shake 420ms ease both;
      }

      @property --angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
      }

      @keyframes ringTurn {
        to { --angle: 360deg; }
      }
      @keyframes backIn {
        from { opacity: 0; transform: translateX(-10px) scale(0.85); }
        to { opacity: 1; transform: none; }
      }
      @keyframes nudge {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-3px); }
      }
      @keyframes dash {
        0% { transform: translateX(0); opacity: 1; }
        45% { transform: translateX(-9px); opacity: 0; }
        46% { transform: translateX(9px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes ghost {
        0% { transform: translateX(0); opacity: 0.8; }
        100% { transform: translateX(-14px); opacity: 0; }
      }
      @keyframes ripple {
        from { transform: scale(1); opacity: 0.7; }
        to { transform: scale(1.8); opacity: 0; }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        50% { transform: translateX(4px); }
        75% { transform: translateX(-2px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .mk-back, .ring, .main, .tail, .ghost, .ripple {
          animation: none !important;
        }
      }
    `,
  ],
})
export class BackButtonComponent {
  /** Where to go when there is no page to go back to. */
  @Input() defaultHref = '/tabs/dashboard';
  @Input() label = 'Back';

  private readonly nav = inject(NavController);
  private readonly router = inject(Router);
  private readonly outlet = inject(IonRouterOutlet, { optional: true });

  readonly launching = signal(false);
  readonly shaking = signal(false);

  goBack(): void {
    if (this.outlet?.canGoBack()) {
      this.play(() => this.nav.back());
      return;
    }

    const current = this.router.url.split('?')[0];
    if (this.defaultHref && current !== this.defaultHref) {
      this.play(() => void this.nav.navigateBack(this.defaultHref));
      return;
    }

    this.shaking.set(true);
    setTimeout(() => this.shaking.set(false), 440);
  }

  /** Runs the launch animation, navigating part-way through so the motion reads. */
  private play(navigate: () => void): void {
    this.launching.set(true);
    setTimeout(navigate, 160);
    setTimeout(() => this.launching.set(false), 460);
  }
}
