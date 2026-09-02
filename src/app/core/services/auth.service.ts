import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '@env/environment';
import { LoginRequest, LoginResponse } from '@core/models/auth.models';

const AUTH_STORAGE_KEY = 'marketos.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly loginUrl = `${environment.apiUrl}/auth/loginUser`;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials).pipe(
      tap((response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
        }
      }),
    );
  }

  get storedLogin(): LoginResponse | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as LoginResponse;
    } catch {
      this.logout();
      return null;
    }
  }

  get token(): string | null {
    return this.storedLogin?.accessToken ?? null;
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}