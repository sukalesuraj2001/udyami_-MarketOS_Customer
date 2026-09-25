import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ToastService } from '@core/services/toast.service';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

interface Step {
  key: string;
  label: string;
  state: 'ok' | 'on' | 'todo';
}

@Component({
  selector: 'app-brand-brief',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, FormsModule, IonicModule, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './brand-brief.page.html',
  styleUrls: ['./brand-brief.page.scss'],
})
export class BrandBriefPage {
  private toast = inject(ToastService);

  steps: Step[] = [
    { key: '01', label: 'You gave us 3 things', state: 'ok' },
    { key: '02', label: 'We found the rest', state: 'ok' },
    { key: '03', label: "We asked what we couldn't find", state: 'ok' },
    { key: '04', label: 'You approve it', state: 'on' },
  ];

  buyer =
    'Factory owners and purchase heads at auto-component units in Peenya, Bommasandra and Hosur. Turnover ₹5Cr+. They buy on tolerance and delivery date, not on price.';
  timeWasters = 'Students asking for projects. Traders wanting to resell. Anyone asking "what is your best price" in the first message.';
  neverSay = '"Cheapest in Bengaluru". Never name Rajesh Precision. No ISO claims beyond 9001.';

  interviewAnswer = '';
  showInterview = false;

  competitors = [
    { name: 'Rajesh Precision', detail: '4 ads live · all price-led offers', days: '14 days' },
    { name: 'Karnataka CNC Works', detail: '2 ads · plant walkthrough video', days: '31 days' },
    { name: 'Bommasandra Tooling', detail: '1 ad · lead form, no creative variation', days: '6 days' },
  ];
  showAdLib = false;

  saveBrief(): void {
    this.toast.show('Brief saved', 'Version 4 created. Future content uses it.', 'ok');
  }

  startInterview(): void {
    this.showInterview = false;
    this.toast.show('Interview started', 'Answer in chat or in Telegram', 'ok');
  }

  useAngle(): void {
    this.showAdLib = false;
    this.toast.show('Added to strategy', 'Delivery-reliability angle queued for September', 'ok');
  }
}
