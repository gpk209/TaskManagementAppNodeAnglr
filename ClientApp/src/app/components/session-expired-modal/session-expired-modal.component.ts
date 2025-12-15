import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SessionService, SessionEvent } from '../../services/session.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="sessionEvent" (click)="onBackdropClick($event)">
      <div class="modal-content" [ngClass]="sessionEvent.type">
        <div class="modal-icon">
          <span *ngIf="sessionEvent.type === 'expired' || sessionEvent.type === 'refresh_failed'">⏰</span>
          <span *ngIf="sessionEvent.type === 'logout'">👋</span>
        </div>
        <h3 class="modal-title">
          {{ sessionEvent.type === 'logout' ? 'Logged Out' : 'Session Expired' }}
        </h3>
        <p class="modal-message">{{ sessionEvent.message }}</p>
        <button class="modal-button" (click)="onDismiss()">
          {{ sessionEvent.type === 'logout' ? 'OK' : 'Login Again' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
      width: 90%;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-content.expired,
    .modal-content.refresh_failed {
      border-top: 4px solid #f59e0b;
    }

    .modal-content.logout {
      border-top: 4px solid #10b981;
    }

    .modal-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .modal-title {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.5rem;
    }

    .modal-message {
      color: #6b7280;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .modal-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .modal-button:hover {
      background: #2563eb;
    }

    .modal-content.logout .modal-button {
      background: #10b981;
    }

    .modal-content.logout .modal-button:hover {
      background: #059669;
    }
  `]
})
export class SessionExpiredModalComponent implements OnInit, OnDestroy {
  private sessionService = inject(SessionService);
  private subscription?: Subscription;

  sessionEvent: SessionEvent | null = null;

  ngOnInit(): void {
    this.subscription = this.sessionService.sessionEvent$.subscribe(event => {
      this.sessionEvent = event;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onDismiss(): void {
    this.sessionService.clearNotification();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onDismiss();
    }
  }
}
