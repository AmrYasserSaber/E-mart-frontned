import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'emart_access_token';
const REFRESH_TOKEN_KEY = 'emart_refresh_token';
const USER_KEY = 'emart_user';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readItem(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeItem(key: string, value: string | null): void {
    if (!this.isBrowser) return;
    try {
      if (value !== null) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Quota or security errors — fail silently
    }
  }

  getAccessToken(): string | null {
    return this.readItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string | null): void {
    this.writeItem(ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return this.readItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string | null): void {
    this.writeItem(REFRESH_TOKEN_KEY, token);
  }

  getUser(): User | null {
    const raw = this.readItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  setUser(user: User | null): void {
    this.writeItem(USER_KEY, user ? JSON.stringify(user) : null);
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
