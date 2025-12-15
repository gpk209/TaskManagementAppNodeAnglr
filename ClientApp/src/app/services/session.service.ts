import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionEvent {
  type: 'expired' | 'logout' | 'refresh_failed';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionEventSubject = new BehaviorSubject<SessionEvent | null>(null);
  sessionEvent$ = this.sessionEventSubject.asObservable();

  private sessionExpiredShown = false;

  /**
   * Notify that session has expired
   */
  notifySessionExpired(reason: 'expired' | 'logout' | 'refresh_failed' = 'expired'): void {
    // Prevent multiple notifications
    if (this.sessionExpiredShown && reason !== 'logout') {
      return;
    }

    this.sessionExpiredShown = reason !== 'logout';

    const messages: Record<string, string> = {
      'expired': 'Your session has expired. Please login again.',
      'logout': 'You have been logged out successfully.',
      'refresh_failed': 'Your session could not be restored. Please login again.'
    };

    this.sessionEventSubject.next({
      type: reason,
      message: messages[reason]
    });
  }

  /**
   * Clear session notification
   */
  clearNotification(): void {
    this.sessionEventSubject.next(null);
    this.sessionExpiredShown = false;
  }

  /**
   * Reset the shown flag (call after successful login)
   */
  resetSessionState(): void {
    this.sessionExpiredShown = false;
    this.sessionEventSubject.next(null);
  }
}
