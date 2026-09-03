import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

type MediaType = 'image' | 'video';
type MediaFilter = 'all' | MediaType;

interface CampaignMedia {
  title: string;
  campaign: string;
  type: MediaType;
  date: string;
  size: string;
  preview: string;
  accent: string;
}

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, IonicModule, ThemeToggleComponent],
  templateUrl: './storage.page.html',
  styleUrls: ['./storage.page.scss'],
})
export class StoragePage {
  readonly filter = signal<MediaFilter>('all');
  readonly campaign = signal('All campaigns');

  readonly media: CampaignMedia[] = [
    {
      title: 'Monsoon offer hero', campaign: 'Monsoon Momentum', type: 'image',
      date: '28 Aug 2025', size: '2.4 MB',
      preview: 'https://images.unsplash.com/photo-1534081333815-ae5019106622?auto=format&fit=crop&w=900&q=80', accent: '#2f6f87'
    },
    {
      title: 'Customer story reel', campaign: 'Trust That Travels', type: 'video',
      date: '24 Aug 2025', size: '18.6 MB',
      preview: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80', accent: '#b8862a'
    },
    {
      title: 'Founder quote card', campaign: 'Trust That Travels', type: 'image',
      date: '22 Aug 2025', size: '1.8 MB',
      preview: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80', accent: '#6d5b82'
    },
    {
      title: 'Behind the scenes', campaign: 'Monsoon Momentum', type: 'video',
      date: '18 Aug 2025', size: '24.1 MB',
      preview: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', accent: '#287a62'
    },
    {
      title: 'Product detail set', campaign: 'Everyday Essentials', type: 'image',
      date: '12 Aug 2025', size: '3.1 MB',
      preview: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80', accent: '#a65b3d'
    },
    {
      title: 'Launch recap', campaign: 'Everyday Essentials', type: 'video',
      date: '08 Aug 2025', size: '31.8 MB',
      preview: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80', accent: '#3768a1'
    },
  ];

  readonly campaigns = ['All campaigns', ...new Set(this.media.map((item) => item.campaign))];
  readonly filteredMedia = computed(() => this.media.filter((item) =>
    (this.filter() === 'all' || item.type === this.filter())
    && (this.campaign() === 'All campaigns' || item.campaign === this.campaign())
  ));

  setFilter(value: MediaFilter): void {
    this.filter.set(value);
  }
}