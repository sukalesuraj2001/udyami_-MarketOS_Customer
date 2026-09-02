import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@env/environment';

import {
  CreateMarketingCalendarPayload,
  MarketingCalendarResponse,
} from '../interfaces/ai-calender.interface';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';

@Injectable({
  providedIn: 'root',
})
export class AICalenders {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Get logged-in user's ID from localStorage
   */
  private getUserId(): string {
    const stored = localStorage.getItem('marketos.auth');

    if (!stored) {
      throw new Error('User is not logged in.');
    }

    try {
      const authData = JSON.parse(stored);

      const userId = authData?.user?.userId;

      if (!userId) {
        throw new Error('User ID not found.');
      }

      return userId;
    } catch (error) {
      console.error('Failed to read user information:', error);
      throw new Error('Invalid authentication data.');
    }
  }

  /**
   * Create 30-day marketing calendar
   */
  createMarketingCalendar() {
    const userId = this.getUserId();

    const payload: CreateMarketingCalendarPayload = {
      userId,
    };

    return this.http.post<MarketingCalendarResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AI_CALENDAR.CREATE}`,
      payload
    );
  }

  /**
   * Get logged-in user's marketing calendar
   */
  getMarketingCalendar() {
    const userId = this.getUserId();

    return this.http.get<MarketingCalendarResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AI_CALENDAR.GET_BY_USER_ID(userId)}`
    );
  }
}