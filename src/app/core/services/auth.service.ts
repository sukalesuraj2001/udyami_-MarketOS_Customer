import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '@env/environment';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@core/models/auth.models';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { LoaderService } from '@core/services/loader.service';

const AUTH_STORAGE_KEY = 'marketos.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly loader = inject(LoaderService);
  private readonly loginUrl = `${environment.apiUrl}/auth/loginUser`;
  private readonly registerUrl = `${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`;

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.registerUrl, payload);
  }

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

  /**
   * Full sign-out: shows the global loader, wipes every client-side store
   * (storage, Cache Storage, IndexedDB, cookies, service workers) and reloads
   * on the login page so no in-memory state survives.
   */
  async signOut(): Promise<void> {
    this.loader.show('Signing out');
    const minimumDisplay = new Promise((resolve) => setTimeout(resolve, 700));

    await Promise.allSettled([
      clearWebStorage(),
      clearCacheStorage(),
      clearIndexedDb(),
      clearCookies(),
      unregisterServiceWorkers(),
      minimumDisplay,
    ]);

    // A hard navigation (not router) drops every singleton service's state.
    window.location.replace('/login');
  }
}

async function clearWebStorage(): Promise<void> {
  localStorage.clear();
  sessionStorage.clear();
}

async function clearCacheStorage(): Promise<void> {
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

async function clearIndexedDb(): Promise<void> {
  if (!('indexedDB' in window) || typeof indexedDB.databases !== 'function') return;
  const databases = await indexedDB.databases();
  await Promise.all(
    databases
      .filter((db) => db.name)
      .map((db) => new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase(db.name!);
        request.onsuccess = request.onerror = request.onblocked = () => resolve();
      })),
  );
}

/** Expires every cookie readable from JS (HttpOnly cookies need a server logout). */
async function clearCookies(): Promise<void> {
  const paths = ['/', window.location.pathname];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!name) continue;
    for (const path of paths) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    }
  }
}

async function unregisterServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}