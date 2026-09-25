import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/**
 * Reminder shown when a profile exists but `businessDetails` is empty.
 * The bar and percentage animate up to `percent` whenever it changes.
 */
@Component({
  selector: 'mk-business-reminder',
  standalone: true,
  imports: [IonicModule],
  template: `
    <section class="reminder" aria-labelledby="business-reminder-title">
      <div class="glow" aria-hidden="true"></div>

      <div class="top">
        <span class="icon" aria-hidden="true">
          <ion-icon name="storefront-outline"></ion-icon>
          <span class="ping"></span>
        </span>
        <div class="copy">
          <span class="label">Action needed</span>
          <h3 id="business-reminder-title">Add your business details</h3>
          <p>Tell us about your business so every post, caption and campaign is created for your brand.</p>
        </div>
      </div>

      <div class="progress-head">
        <span>Profile completed</span>
        <b>{{ shown }}%</b>
      </div>
      <div class="track" role="progressbar" aria-label="Profile completion"
        aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="percent">
        <div class="fill" [style.width.%]="shown">
          <span class="sheen"></span>
        </div>
      </div>

      <ul class="perks">
        <li><ion-icon name="sparkles-outline"></ion-icon> Content for your sector</li>
        <li><ion-icon name="location-outline"></ion-icon> Local audience reach</li>
        <li><ion-icon name="color-palette-outline"></ion-icon> On-brand every time</li>
      </ul>

      <button type="button" class="cta" (click)="action.emit()">
        <span class="cta-sheen" aria-hidden="true"></span>
        Add business details
        <ion-icon name="arrow-forward"></ion-icon>
      </button>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .reminder {
        position: relative;
        overflow: hidden;
        padding: 16px;
        border-radius: var(--mk-radius);
        color: var(--mk-text);
        background:
          radial-gradient(120% 90% at 100% 0%, var(--mk-gold-fade), transparent 60%),
          var(--mk-surf);
        border: 1px solid rgba(212, 164, 56, 0.35);
        box-shadow: var(--mk-shadow);
        animation: rise 520ms var(--mk-ease) both;
      }

      .glow {
        position: absolute;
        top: -50px;
        right: -40px;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: rgba(212, 164, 56, 0.2);
        filter: blur(36px);
        animation: float 6s ease-in-out infinite;
        pointer-events: none;
      }

      .top {
        position: relative;
        display: flex;
        gap: 12px;
        margin-bottom: 14px;
      }

      .icon {
        position: relative;
        flex: none;
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border-radius: 13px;
        color: #171008;
        font-size: 20px;
        background: linear-gradient(140deg, var(--mk-gold-2), var(--mk-gold));
        box-shadow: 0 8px 18px rgba(212, 164, 56, 0.3);
        animation: bob 3.2s ease-in-out infinite;
      }

      .ping {
        position: absolute;
        top: -3px;
        right: -3px;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: var(--mk-red);
        border: 2px solid var(--mk-surf);
      }
      .ping::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: var(--mk-red);
        animation: ping 1.6s ease-out infinite;
      }

      .copy {
        min-width: 0;
      }

      .label {
        color: var(--mk-gold);
        font: 700 9.5px var(--mk-font-mono);
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h3 {
        margin: 3px 0 4px;
        font: 700 15.5px/1.25 var(--mk-font-display);
      }

      p {
        margin: 0;
        color: var(--mk-muted);
        font-size: 12.5px;
        line-height: 1.5;
      }

      .progress-head {
        position: relative;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 7px;
        color: var(--mk-muted);
        font-size: 12px;
        font-weight: 600;

        b {
          color: var(--mk-text);
          font: 800 18px var(--mk-font-display);
          font-variant-numeric: tabular-nums;
        }
      }

      .track {
        position: relative;
        height: 10px;
        overflow: hidden;
        border-radius: 20px;
        background: var(--mk-surf-3);
      }

      .fill {
        position: relative;
        height: 100%;
        overflow: hidden;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--mk-gold), var(--mk-gold-2));
        box-shadow: 0 0 12px rgba(212, 164, 56, 0.5);
      }

      .sheen {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
        transform: translateX(-100%);
        animation: sweep 2.2s ease-in-out 1.2s infinite;
      }

      .perks {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 14px 0;
        padding: 0;
        list-style: none;

        li {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 20px;
          color: var(--mk-text);
          font-size: 11.5px;
          font-weight: 600;
          background: var(--mk-surf-2);
          border: 1px solid var(--mk-line);
          animation: rise 480ms var(--mk-ease) both;
        }
        li:nth-child(1) { animation-delay: 250ms; }
        li:nth-child(2) { animation-delay: 330ms; }
        li:nth-child(3) { animation-delay: 410ms; }

        ion-icon {
          color: var(--mk-gold);
          font-size: 13px;
        }
      }

      .cta {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 46px;
        border: 0;
        border-radius: var(--mk-radius-sm);
        cursor: pointer;
        color: #171008;
        font: 700 14px var(--mk-font-body);
        background: linear-gradient(135deg, var(--mk-gold-2), var(--mk-gold));
        transition: transform var(--mk-speed-fast) var(--mk-ease);

        ion-icon {
          font-size: 16px;
          transition: transform var(--mk-speed) var(--mk-ease);
        }
        &:hover ion-icon {
          transform: translateX(4px);
        }
        &:active {
          transform: scale(0.98);
        }
      }

      .cta-sheen {
        position: absolute;
        top: 0;
        left: -70%;
        width: 45%;
        height: 100%;
        background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.5), transparent);
        transform: skewX(-20deg);
        animation: ctaSweep 3.4s ease-in-out infinite;
      }

      @keyframes rise {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: none; }
      }
      @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-14px, 12px); }
      }
      @keyframes bob {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-3px) rotate(-4deg); }
      }
      @keyframes ping {
        0% { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      @keyframes sweep {
        to { transform: translateX(100%); }
      }
      @keyframes ctaSweep {
        0% { left: -70%; }
        50%, 100% { left: 130%; }
      }

      @media (prefers-reduced-motion: reduce) {
        .reminder, .glow, .icon, .ping::after, .sheen, .cta-sheen, .perks li {
          animation: none;
        }
      }
    `,
  ],
})
export class BusinessReminderComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) percent = 0;
  @Output() action = new EventEmitter<void>();

  /** Animated value driving both the bar width and the label. */
  shown = 0;
  private frame: number | null = null;

  ngOnChanges(): void {
    this.animateTo(Math.max(0, Math.min(100, this.percent)));
  }

  ngOnDestroy(): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
    }
  }

  private animateTo(target: number): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
    }

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.shown = target;
      return;
    }

    const from = this.shown;
    const start = performance.now();
    const duration = 1100;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.shown = Math.round(from + (target - from) * eased);
      this.frame = t < 1 ? requestAnimationFrame(step) : null;
    };
    // Small delay so the bar fills after the card has slid in.
    setTimeout(() => (this.frame = requestAnimationFrame(step)), 250);
  }
}
