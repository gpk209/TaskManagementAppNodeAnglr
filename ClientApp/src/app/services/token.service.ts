import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Token Service - Manages access tokens in memory
 * 
 * Security Features:
 * - Access token stored only in memory (not localStorage/sessionStorage)
 * - Token cleared on page refresh (refresh token handles persistence)
 * - Prevents XSS attacks from accessing tokens
 * - Username stored in localStorage for session restoration (safe, not sensitive)
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private accessToken: string | null = null;
  private username: string | null = null;
  private tokenSubject = new BehaviorSubject<string | null>(null);

  private readonly USERNAME_KEY = 'app_username';

  constructor() {
    // Restore username from localStorage on service init
    this.username = localStorage.getItem(this.USERNAME_KEY);
  }

  /**
   * Observable for token changes - components can subscribe to auth state
   */
  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  /**
   * Check if user is currently authenticated (has access token)
   */
  get isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Get current access token (synchronous)
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current username
   */
  getUsername(): string | null {
    return this.username;
  }

  /**
   * Set access token and username after login or token refresh
   */
  setToken(token: string, username?: string): void {
    this.accessToken = token;
    if (username) {
      this.username = username;
      // Store username in localStorage for session restoration
      localStorage.setItem(this.USERNAME_KEY, username);
    }
    this.tokenSubject.next(token);
  }

  /**
   * Clear tokens on logout
   */
  clearToken(): void {
    this.accessToken = null;
    this.username = null;
    localStorage.removeItem(this.USERNAME_KEY);
    this.tokenSubject.next(null);
  }
}
