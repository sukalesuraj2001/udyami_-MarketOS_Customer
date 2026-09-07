import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { environment } from '@env/environment';

export type IncidentStatus = 'OPEN' | 'RESOLVED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  userId: string;
  generatedContentId?: string | null;
  calendarId?: string | null;
  activityId?: string | null;
  activityType: string;
  provider?: string | null;
  model?: string | null;
  incidentType: string;
  severity: IncidentSeverity;
  title: string;
  message: string;
  errorMessage?: string | null;
  status: IncidentStatus;
  resolved: boolean;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentPayload {
  userId: string;
  generatedContentId?: string;
  calendarId?: string;
  activityType: string;
  incidentType: string;
  severity: IncidentSeverity;
  title: string;
  message: string;
  errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class IncidentService {
  constructor(private http: HttpClient) {}

  getUserIncidents() {
    const userId = this.getUserId();
    return this.http.get<Incident[]>(
      `${environment.apiUrl}${API_ENDPOINTS.INCIDENTS.GET_BY_USER_ID(userId)}`
    );
  }

  createIncident(payload: Omit<CreateIncidentPayload, 'userId'>) {
    return this.http.post<Incident>(
      `${environment.apiUrl}${API_ENDPOINTS.INCIDENTS.CREATE}`,
      { ...payload, userId: this.getUserId() }
    );
  }

  private getUserId(): string {
    const stored = localStorage.getItem('marketos.auth');
    const userId = stored ? JSON.parse(stored)?.user?.userId : null;

    if (!userId) {
      throw new Error('User ID not found.');
    }

    return userId;
  }
}