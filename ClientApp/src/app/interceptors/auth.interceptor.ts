import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AccountService } from '../services/accountService';

/**
 * Subjects to handle concurrent requests during token refresh
 */
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Auth Interceptor - Handles token attachment and automatic refresh
 * 
 * Features:
 * - Attaches access token to outgoing requests
 * - Automatically refreshes token on 401 errors
 * - Queues concurrent requests during refresh
 * - Prevents multiple simultaneous refresh calls
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const accountService = inject(AccountService);

  // Skip auth header for auth endpoints (login, register, refresh)
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Add access token to request if available
  const token = tokenService.getAccessToken();
  if (token) {
    req = addTokenHeader(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only attempt refresh on 401 Unauthorized
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        return handle401Error(req, next, tokenService, accountService);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Check if URL is an auth endpoint (don't add token, don't refresh on 401)
 */
function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || 
         url.includes('/auth/register') || 
         url.includes('/auth/refresh') ||
         url.includes('/auth/logout');
}

/**
 * Add Authorization header with Bearer token
 */
function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Handle 401 errors by attempting token refresh
 * Queues concurrent requests while refreshing
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService,
  accountService: AccountService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return accountService.refreshToken().pipe(
      switchMap((success: boolean) => {
        isRefreshing = false;
        
        if (success) {
          const newToken = tokenService.getAccessToken();
          refreshTokenSubject.next(newToken);
          
          if (newToken) {
            // Retry original request with new token
            return next(addTokenHeader(request, newToken));
          }
        }
        
        // Refresh failed - session expired
        accountService.handleSessionExpired();
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }),
      catchError((err) => {
        isRefreshing = false;
        // Refresh failed - session expired
        accountService.handleSessionExpired();
        return throwError(() => err);
      })
    );
  } else {
    // Another request is already refreshing, wait for it
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next(addTokenHeader(request, token)))
    );
  }
}
