import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Kpi } from '@core/models/models';

@Component({
  selector: 'mk-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
})
export class KpiCardComponent implements OnInit {
  @Input({ required: true }) kpi!: Kpi;
  @ViewChild('valueEl', { static: true }) valueEl!: ElementRef<HTMLSpanElement>;

  ngOnInit(): void {
    // slight stagger so cards don't all tween in lock-step
    setTimeout(() => this.countUp(), 60);
  }

  private countUp(): void {
    const raw = this.kpi.value;
    const match = raw.match(/-?[\d,]+(\.\d+)?/);
    if (!match || !this.valueEl) return;

    const numStr = match[0];
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (Number.isNaN(target)) return;

    const prefix = raw.slice(0, match.index);
    const suffix = raw.slice((match.index ?? 0) + numStr.length);
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    const duration = 900;
    const start = performance.now();
    const el = this.valueEl.nativeElement;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = target * eased;
      const formatted = current.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      el.textContent = `${prefix}${formatted}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
