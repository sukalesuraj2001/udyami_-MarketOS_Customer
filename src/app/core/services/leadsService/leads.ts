import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { environment } from '@env/environment';

export interface LeadFieldDatum {
  name: string;
  values: string[];
}

export interface LeadItem {
  id: string;
  // 'fb' | 'ig', as Graph reports it; null while fetchError is set.
  platform: string | null;
  pageId: string;
  pageName: string | null;
  formId: string | null;
  adId: string | null;
  name: string | null;
  fieldData: LeadFieldDatum[] | null;
  isOrganic: boolean | null;
  createdAt: string;
  fetchError: string | null;
}

export interface LeadsResponse {
  success: boolean;
  total: number;
  data: LeadItem[];
}

export interface PullLeadsResponse {
  success: boolean;
  fetched: number;
  saved: number;
  skipped: number;
  errors: string[];
}

const LEAD_FIELD_ALIASES: Record<string, string[]> = {
  name: ['full_name', 'first_name', 'name'],
  email: ['email'],
  phone: ['phone_number', 'phone'],
};

// Meta lead forms carry whatever custom questions the business configured —
// these are just the common spellings. Absent entirely when the form didn't ask.
const WANTS_ALIASES = ['service', 'service_interested_in', 'interested_in', 'looking_for', 'enquiry', 'enquiry_type', 'product', 'what_are_you_looking_for?', 'message'];
const AREA_ALIASES = ['area', 'city', 'location', 'locality', 'preferred_location', 'address'];

function findLeadField(lead: LeadItem, aliases: string[]): string | null {
  const field = lead.fieldData?.find((f) => aliases.includes(f.name?.toLowerCase()));
  return field?.values?.[0]?.trim() || null;
}

/** A lead's own display name, as every list of leads in the app shows it. */
export function leadDisplayName(lead: LeadItem): string {
  return lead.name || 'Unnamed lead';
}

export function leadField(lead: LeadItem, key: keyof typeof LEAD_FIELD_ALIASES): string | null {
  return findLeadField(lead, LEAD_FIELD_ALIASES[key]);
}

/** What they said they want, if the lead form asked — null when it didn't. */
export function leadWants(lead: LeadItem): string | null {
  return findLeadField(lead, WANTS_ALIASES);
}

/** Where they are, if the lead form asked — null when it didn't. */
export function leadArea(lead: LeadItem): string | null {
  return findLeadField(lead, AREA_ALIASES);
}

/** Human-friendly "came from" line — page name plus whichever ad/form reference is available. */
export function leadSource(lead: LeadItem): string {
  const parts: string[] = [];
  if (lead.pageName) parts.push(lead.pageName);
  if (lead.adId) parts.push(`Ad ${lead.adId}`);
  else if (lead.formId) parts.push(`Form ${lead.formId}`);
  return parts.join(' · ') || 'Source unavailable';
}

export function formatLeadTime(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(new Date(value));
}

/** True when the lead came in within the given window (24h by default) — used for a "new" badge. */
export function isRecentLead(lead: LeadItem, withinHours = 24): boolean {
  return Date.now() - new Date(lead.createdAt).getTime() <= withinHours * 60 * 60 * 1000;
}

@Injectable({ providedIn: 'root' })
export class LeadsService {
  constructor(private readonly http: HttpClient) {}

  getLeads() {
    return this.http.get<LeadsResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.LEADS.GET_ALL}`,
    );
  }

  /** Backfills from Meta — safe to re-run, already-stored leads are skipped. */
  pullLeads() {
    return this.http.post<PullLeadsResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.LEADS.PULL}`,
      {},
    );
  }
}
