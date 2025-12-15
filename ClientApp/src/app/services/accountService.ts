import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, of, throwError, firstValueFrom } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { SessionService } from './session.service';

interface LoginResponse {
  token: string;
  username: string;
}

interface RefreshResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  
  // Flag to prevent multiple simultaneous refresh requests
  private isRefreshing = false;
  private initialized = false;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private sessionService: SessionService
  ) {}

  /**
   * Initialize authentication state on app startup
   * Attempts to refresh token if refresh cookie exists
   * Returns a Promise so APP_INITIALIZER can wait for it
   */
  async initializeAuth(): Promise<void> {
    if (this.initialized) {
      console.log('Auth already initialized, skipping');
      return;
    }
    this.initialized = true;

    const storedUsername = this.tokenService.getUsername();
    console.log('Initializing auth, stored username:', storedUsername);

    // Only try to refresh if we have a stored username (meaning user was logged in)
    if (!storedUsername) {
      console.log('No stored session to restore');
      return;
    }

    console.log('Attempting to refresh token...');
    try {
      const success = await firstValueFrom(this.refreshToken());
      if (success) {
        console.log('Session restored successfully!');
        // Clear any previous session notifications
        this.sessionService.clearNotification();
      } else {
        console.log('Failed to restore session - refresh returned false');
        // Session expired - show notification
        this.sessionService.notifySessionExpired('expired');
      }
    } catch (error) {
      console.log('Failed to restore session - error:', error);
      // Session expired - show notification
      this.sessionService.notifySessionExpired('expired');
    }
  }

  /**
   * Login - stores access token in memory, refresh token handled by server cookie
   */
  login(model: any): Observable<void> {
    return this.http.post<LoginResponse>(this.baseUrl + 'auth/login', model, {
      withCredentials: true  // Send/receive cookies
    }).pipe(
      map((response: LoginResponse) => {
        if (response && response.token) {
          // Store access token in memory (not localStorage)
          this.tokenService.setToken(response.token, response.username);
          
          // Update user state
          const user: User = { username: response.username, token: response.token };
          this.currentUserSource.next(user);
          
          // Clear any session expired notifications
          this.sessionService.resetSessionState();
        }
      })
    );
  }

  /**
   * Register new user
   */
  register(model: any): Observable<void> {
    return this.http.post<any>(this.baseUrl + 'auth/register', model, {
      withCredentials: true
    }).pipe(
      map(() => {
        // Registration successful, user needs to login
        console.log('Registration successful');
      })
    );
  }

  /**
   * Refresh access token using refresh token cookie
   * Called automatically when access token expires (401)
   */
  refreshToken(): Observable<boolean> {
    if (this.isRefreshing) {
      console.log('Already refreshing, skipping');
      return of(false);
    }

    this.isRefreshing = true;
    console.log('Calling refresh endpoint...');

    return this.http.post<RefreshResponse>(this.baseUrl + 'auth/refresh', {}, {
      withCredentials: true  // Send refresh token cookie
    }).pipe(
      tap((response: RefreshResponse) => {
        console.log('Refresh response received:', response);
        if (response && response.token) {
          // Store new access token in memory
          this.tokenService.setToken(response.token);
          
          // Update user state
          const username = this.tokenService.getUsername();
          console.log('Setting user state for:', username);
          if (username) {
            const user: User = { username, token: response.token };
            this.currentUserSource.next(user);
          }
        }
        this.isRefreshing = false;
      }),
      map(() => true),
      catchError((error) => {
        console.log('Refresh failed:', error.status, error.message);
        this.isRefreshing = false;
        // Refresh failed, clear auth state
        this.tokenService.clearToken();
        this.currentUserSource.next(null);
        return of(false);
      })
    );
  }

  /**
   * Set current user (used for restoring session)
   */
  setCurrentUser(user: User): void {
    this.tokenService.setToken(user.token, user.username);
    this.currentUserSource.next(user);
  }

  /**
   * Logout - clears memory token and server cookie
   */
  logout(): Observable<void> {
    console.log('AccountService.logout() called');
    
    return this.http.post<void>(this.baseUrl + 'auth/logout', {}, {
      withCredentials: true  // Send cookie to be cleared
    }).pipe(
      tap(() => {
        // Clear memory token
        this.tokenService.clearToken();
        this.currentUserSource.next(null);
        // Show logout notification
        this.sessionService.notifySessionExpired('logout');
        console.log('User logged out, tokens cleared');
      }),
      catchError((error) => {
        // Even if server call fails, clear local state
        this.tokenService.clearToken();
        this.currentUserSource.next(null);
        // Show logout notification
        this.sessionService.notifySessionExpired('logout');
        return of(void 0);
      })
    );
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated;
  }

  /**
   * Get access token for HTTP requests
   */
  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  /**
   * Handle session expired - called when 401 and refresh fails
   * Clears auth state and shows notification
   */
  handleSessionExpired(): void {
    console.log('Session expired, clearing auth state');
    this.tokenService.clearToken();
    this.currentUserSource.next(null);
    this.sessionService.notifySessionExpired('expired');
  }
}
