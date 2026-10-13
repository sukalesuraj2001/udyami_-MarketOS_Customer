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
