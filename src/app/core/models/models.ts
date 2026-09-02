export type ApprovalType = 'content' | 'spend';

export interface ContentApproval {
  id: string;
  type: 'content';
  channel: string;
  artClass: 'art1' | 'art2' | 'art3' | 'art4';
  label: string;
  when: string;
  title: string;
  caption: string;
  done?: boolean;
  ok?: boolean;
}

export interface SpendApproval {
  id: string;
  type: 'spend';
  channel: string;
  when: string;
  title: string;
  detail: string;
  amount: number;
  why: string;
  done?: boolean;
  ok?: boolean;
}

export type Approval = ContentApproval | SpendApproval;

export type LeadTier = 'hot' | 'warm' | 'cold';

export interface Lead {
  name: string;
  company: string;
  score: number;
  tier: LeadTier;
  reason: string;
  source: string;
  stage: 'Meeting booked' | 'Contacted' | 'Qualified' | 'Nurture' | 'Disqualified';
}

export type CampaignStatus = 'live' | 'paused';

export interface Campaign {
  name: string;
  channel: 'Meta' | 'Google';
  spend: string;
  qualified: number;
  costPerQualified: string;
  status: CampaignStatus;
}

export interface ConnectedAccount {
  name: string;
  detail: string;
  connected: boolean;
}

export interface CreativeBar {
  label: string;
  pct: number;
  spend: string;
}

export type FeedTone = 'ok' | 'gold' | 'neu';

export interface FeedItem {
  time: string;
  text: string;
  tone: FeedTone;
}

export interface CalendarEvent {
  day: number;
  channel: 'ig' | 'fb' | 'yt';
  label: string;
}

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accent?: string;
}
