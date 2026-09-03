import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { Observable } from 'rxjs';
import { GeneratedContentResponse } from '../interfaces/socialMediaAcounts.interface';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {

  constructor(
    private http: HttpClient
  ) { }

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
      console.error(
        'Failed to read user information:',
        error
      );

      throw new Error(
        'Invalid authentication data.'
      );
    }
  }

  getGeneratedContent(): Observable<GeneratedContentResponse> {

    const userId = this.getUserId();

    return this.http.get<GeneratedContentResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.GET_BY_USER_ID(userId)}`
    );
  }


  regenerateContent(contentId: string, requirement: string) {
    return this.http.post(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.REGENERATE(contentId)}`,
      {
        requirement,
      }
    );
  }

  rejectContent(contentId: string) {
    return this.http.patch(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.REJECT(contentId)}`,
      {}
    );
  }
}