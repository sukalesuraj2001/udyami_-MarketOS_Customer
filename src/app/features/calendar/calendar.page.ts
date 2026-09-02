import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { CalendarEvent } from '@core/models/models';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

type Filter = 'all' | 'ig' | 'fb' | 'yt';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage {
  data = inject(MockDataService);
  private toast = inject(ToastService);

  filter = signal<Filter>('all');
  days = Array.from({ length: 30 }, (_, i) => i + 1);

  activeDays = computed(() => this.days.filter((d) => this.eventsFor(d).length > 0));

  showAdd = signal(false);
  newTopic = '';
  newChannel = 'Instagram · Reel';
  newDate = '';

  eventsByDay = computed(() => {
    const map = new Map<number, CalendarEvent[]>();
    const f = this.filter();
    for (const ev of this.data.calendarEvents()) {
      if (f !== 'all' && ev.channel !== f) continue;
      const list = map.get(ev.day) ?? [];
      list.push(ev);
      map.set(ev.day, list);
    }
    return map;
  });

  eventsFor(day: number): CalendarEvent[] {
    return this.eventsByDay().get(day) ?? [];
  }

  onFilterChange(ev: Event): void {
    const v = (ev as CustomEvent).detail.value as Filter;
    this.filter.set(v);
  }

  openEvent(ev: CalendarEvent, day: number): void {
    this.toast.show(ev.label, `Sept ${day} · opens the preview`);
  }

  createDraft(): void {
    this.showAdd.set(false);
    this.toast.show('Draft queued', "It'll appear in Approvals shortly", 'ok');
    this.newTopic = '';
    this.newDate = '';
  }
}
