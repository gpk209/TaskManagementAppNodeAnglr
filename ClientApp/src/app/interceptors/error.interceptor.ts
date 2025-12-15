import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Error Interceptor - Handles HTTP errors (except 401 which is handled by authInterceptor)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error) {
        switch (error.status) {
          // 401 is handled by authInterceptor (token refresh)
          case 404:
            console.error('Resource not found');
            break;
          case 409:
            // Conflict error (e.g., username already exists)
            // Let the component handle this error
            console.log('Conflict error:', error.error);
            break;
          case 500:
            console.error('Internal server error');
            break;
          default:
            console.error('An error occurred:', error.message);
            break;
        }
      }
      return throwError(() => error);
    })
  );
};
