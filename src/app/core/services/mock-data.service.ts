import { Injectable, computed, signal } from '@angular/core';
import {
  Approval,
  Campaign,
  CalendarEvent,
  ConnectedAccount,
  ContentApproval,
  CreativeBar,
  FeedItem,
  Kpi,
  Lead,
  SpendApproval,
} from '@core/models/models';

/**
 * All UI state lives here as signals. This is a pure front-end mock —
 * there is no HTTP layer. Swap the seed data / add real calls later
 * without touching any component.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly loading = signal(true);

  readonly workspace = signal('Sri Lakshmi Industries');
  readonly stage = signal('Stage 3 · Supervised');
  readonly credits = signal('₹12,400 credits');
  readonly ownerName = signal('Suresh');

  readonly kpis = signal<Kpi[]>([
    { label: 'Cost / qualified lead', value: '₹412', sub: 'vs your baseline ₹624', trend: 'up', trendLabel: '▼ 34%' },
    { label: 'Qualified rate', value: '23.4%', sub: 'since May', trend: 'up', trendLabel: '▲ 8.1pt' },
    { label: 'Spend this month', value: '₹68,200', sub: 'of ₹90,000 cap · 76%' },
    { label: 'Waiting on you', value: '5', sub: '2 posts · 2 spend · 1 brief', accent: 'gold' },
  ]);

  readonly feed = signal<FeedItem[]>([
    { time: '09:12', text: 'Reel published to Instagram', tone: 'ok' },
    { time: '08:47', text: 'Lead scored 91 — Ramesh Gowda', tone: 'gold' },
    { time: '08:31', text: 'Qualified-lead event sent to Meta', tone: 'neu' },
    { time: '06:00', text: 'Nightly brief generated', tone: 'neu' },
    { time: 'Yesterday', text: 'You approved 3 posts', tone: 'ok' },
    { time: 'Yesterday', text: 'Circuit breaker checked — all normal', tone: 'neu' },
  ]);

  readonly approvals = signal<Approval[]>([
    {
      id: 'A-1', type: 'content', channel: 'Instagram · Reel', artClass: 'art1',
      label: 'Reel · 9:16 · 22s', when: 'Tomorrow 09:30',
      title: 'Shop-floor tolerance check',
      caption: 'ಒಂದು ಮೈಕ್ರಾನ್ ವ್ಯತ್ಯಾಸವೂ ಮುಖ್ಯ.\n\nEvery part leaves our floor measured, not assumed. 40 years, zero compromise.\n\n#PrecisionEngineering #MadeInKarnataka',
    },
    {
      id: 'A-2', type: 'content', channel: 'Instagram · Carousel', artClass: 'art2',
      label: 'Carousel · 4:5 · 5 slides', when: 'Thu 11:00',
      title: 'Five questions to ask any machining vendor',
      caption: 'Most buyers ask for price first. The ones who get quality ask these five instead.\n\nSwipe →',
    },
    {
      id: 'A-3', type: 'spend', channel: 'Meta Ads', when: 'Immediate',
      title: 'Increase daily budget on "Peenya — Qualified Lead"',
      detail: '₹1,200 → ₹1,800 per day', amount: 18000,
      why: 'Cost per qualified lead has held at ₹380 for nine days, well under your ₹600 target. Raising budget 50% should hold efficiency for roughly two weeks before audience fatigue.',
    },
    {
      id: 'A-4', type: 'spend', channel: 'Google Ads', when: 'Immediate',
      title: 'Add 14 negative keywords',
      detail: 'No budget change', amount: 0,
      why: 'Search terms show spend going to "cnc operator salary", "cnc course fees" and similar. These 14 negatives should cut roughly ₹4,100 of wasted spend per month.',
    },
    {
      id: 'A-5', type: 'content', channel: 'Facebook · Image', artClass: 'art3',
      label: 'Image · 1:1', when: 'Fri 16:00',
      title: 'Client story — Hosur brake components',
      caption: '"They quoted a date and hit it. Twice in a row." — Purchase Head, Hosur\n\nWe deliver on the date we commit.',
    },
  ]);

  readonly openApprovalsCount = computed(() => this.approvals().filter((a) => !a.done).length);

  readonly leads = signal<Lead[]>([
    { name: 'Ramesh Gowda', company: 'Vaishnavi Auto Components', score: 91, tier: 'hot', reason: '₹8Cr unit in Peenya. Came from search "cnc machining tolerance bengaluru". Gave a real work email and a June deadline.', source: 'Google Search', stage: 'Meeting booked' },
    { name: 'Priya Nandan', company: 'Sterling Fasteners', score: 84, tier: 'hot', reason: 'Purchase head. Corporate domain, live company site, matches your ICP sector. Asked about batch size limits.', source: 'Meta · Creative 04', stage: 'Contacted' },
    { name: 'Ashok Rao', company: 'Hosur Brake Systems', score: 78, tier: 'hot', reason: 'Returning visitor, 4 pages, watched 78% of the reel before filling the form. Budget band above your floor.', source: 'Meta · Creative 04', stage: 'Qualified' },
    { name: 'Manjunath S', company: '—', score: 44, tier: 'warm', reason: 'Gmail address, no company named. Selected "just researching". Worth a nurture sequence, not a call.', source: 'Meta · Creative 02', stage: 'Nurture' },
    { name: 'Kiran Kumar', company: '—', score: 12, tier: 'cold', reason: 'Selected "student / job seeker". Hard disqualification rule — removed from the pipeline, no sales time spent.', source: 'Meta · Creative 07', stage: 'Disqualified' },
    { name: 'Deepa Shetty', company: 'Rajesh Precision', score: 8, tier: 'cold', reason: 'Competitor on your never-name list. Auto-disqualified.', source: 'Google Search', stage: 'Disqualified' },
  ]);

  readonly hotLeadsCount = computed(() => this.leads().filter((l) => l.tier === 'hot').length);

  readonly campaigns = signal<Campaign[]>([
    { name: 'Peenya — Qualified Lead', channel: 'Meta', spend: '₹28,400', qualified: 19, costPerQualified: '₹1,494', status: 'live' },
    { name: 'Search — Machining Intent', channel: 'Google', spend: '₹21,900', qualified: 11, costPerQualified: '₹1,990', status: 'live' },
    { name: 'Retarget — Site visitors 30d', channel: 'Meta', spend: '₹8,500', qualified: 3, costPerQualified: '₹2,833', status: 'live' },
    { name: 'Boost — Creative 04', channel: 'Meta', spend: '₹9,400', qualified: 0, costPerQualified: '—', status: 'paused' },
  ]);

  readonly connections = signal<ConnectedAccount[]>([
    { name: 'Facebook Page', detail: 'Sri Lakshmi Industries', connected: true },
    { name: 'Instagram Business', detail: '@srilakshmi.precision', connected: true },
    { name: 'Meta Ads account', detail: 'act_8841029', connected: true },
    { name: 'Google Ads', detail: '481-229-3306', connected: true },
    { name: 'Google Analytics 4', detail: 'Not connected', connected: false },
    { name: 'Your ERP', detail: 'Webhook active · lead stages flowing', connected: true },
  ]);

  readonly bars = signal<CreativeBar[]>([
    { label: 'Creative 04', pct: 38, spend: '₹19,800' },
    { label: 'Creative 02', pct: 24, spend: '₹14,200' },
    { label: 'Creative 06', pct: 15, spend: '₹11,900' },
    { label: 'Creative 01', pct: 9, spend: '₹12,400' },
    { label: 'Creative 07', pct: 0, spend: '₹9,400' },
  ]);

  readonly calendarEvents = signal<CalendarEvent[]>([
    { day: 3, channel: 'ig', label: 'Reel · tolerance' },
    { day: 5, channel: 'fb', label: 'Client story' },
    { day: 8, channel: 'ig', label: 'Carousel · 5 Qs' },
    { day: 8, channel: 'yt', label: 'Short cut-down' },
    { day: 11, channel: 'ig', label: 'Founder clip' },
    { day: 12, channel: 'fb', label: 'Offer post' },
    { day: 16, channel: 'ig', label: 'Reel · shop floor' },
    { day: 18, channel: 'ig', label: 'Carousel' },
    { day: 19, channel: 'yt', label: 'Process film' },
    { day: 23, channel: 'ig', label: 'Client story' },
    { day: 23, channel: 'fb', label: 'Boost' },
    { day: 25, channel: 'ig', label: 'Reel' },
    { day: 26, channel: 'fb', label: 'Testimonial' },
    { day: 30, channel: 'ig', label: 'Month recap' },
  ]);

  constructor() {
    // simulate an initial fetch so the skeleton / entrance animations have something to do
    setTimeout(() => this.loading.set(false), 650);
  }

  decide(id: string, ok: boolean): Approval | undefined {
    const list = this.approvals();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    const updated = { ...list[idx], done: true, ok } as Approval;
    const next = [...list];
    next[idx] = updated;
    this.approvals.set(next);
    return updated;
  }

  approveAllContent(): number {
    const list = this.approvals();
    let count = 0;
    const next = list.map((a) => {
      if (a.type === 'content' && !a.done) {
        count++;
        return { ...a, done: true, ok: true } as ContentApproval;
      }
      return a;
    });
    this.approvals.set(next);
    return count;
  }

  editCaption(id: string, caption: string): void {
    const list = this.approvals();
    const next = list.map((a) => (a.id === id && a.type === 'content' ? { ...a, caption } : a)) as Approval[];
    this.approvals.set(next);
  }

  addRetireCreativeApproval(): void {
    const spend: SpendApproval = {
      id: 'A-' + (this.approvals().length + 1),
      type: 'spend',
      channel: 'Meta Ads',
      when: 'Immediate',
      title: 'Retire Creative 07',
      detail: 'Pause ad · frees ₹9,400/mo',
      amount: 9400,
      why: '340 clicks, 19 leads, zero qualified. Search terms and form answers both indicate job seekers.',
    };
    this.approvals.update((list) => [...list, spend]);
  }

  toggleCampaign(name: string): Campaign | undefined {
    const list = this.campaigns();
    const idx = list.findIndex((c) => c.name === name);
    if (idx === -1) return undefined;
    const updated: Campaign = { ...list[idx], status: list[idx].status === 'live' ? 'paused' : 'live' };
    const next = [...list];
    next[idx] = updated;
    this.campaigns.set(next);
    return updated;
  }

  pauseEverything(): { campaigns: number; posts: number } {
    const camps = this.campaigns().length;
    this.campaigns.update((list) => list.map((c) => ({ ...c, status: 'paused' as const })));
    return { campaigns: camps, posts: 11 };
  }

  connectAccount(name: string): void {
    this.connections.update((list) =>
      list.map((c) => (c.name === name ? { ...c, connected: true, detail: 'Connected just now' } : c))
    );
  }
}
