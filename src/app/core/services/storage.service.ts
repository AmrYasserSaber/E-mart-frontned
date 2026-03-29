import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { User } from '../models/user.model';

const USER = 'emart_user';

/**
 * Access and refresh tokens must not be stored in localStorage (or sessionStorage):
 * any XSS can exfiltrate them. This service keeps tokens only in memory for the lifetime
 * of the page. For sessions that survive refresh or across tabs, the backend should issue
 * short-lived access tokens and rotate refresh tokens via Secure, HttpOnly, SameSite cookies
 * (BFF or cookie-based OAuth patterns)—not via client-readable storage.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.removeItem('emart_access_token');
      localStorage.removeItem('emart_refresh_token');
    } catch {
      // Quota / security / disabled storage
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  getUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = localStorage.getItem(USER);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  setUser(user: User | null): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      if (user) localStorage.setItem(USER, JSON.stringify(user));
      else localStorage.removeItem(USER);
    } catch {
      // ignore
    }
  }

  setAuthSession(access: string, refresh: string, user: User | null): void {
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    this.setUser(user);
  }

  clearAuth(): void {
    this.setAccessToken(null);
    this.setRefreshToken(null);
    this.setUser(null);
  }
}
