import { HttpErrorResponse, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, Observable, of } from 'rxjs';

// Create a simple state to track refresh attempts and prevent infinite loops
const refreshState = {
  isRefreshing: false,
  refreshAttempts: 0,
  maxRefreshAttempts: 2
};

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Only modify requests going to our API
  if (req.url.startsWith(environment.apiUrl)) {
    console.log('Intercepting request to:', req.url);
    
    // Skip refresh attempts if this is a refresh request or logout request
    if (req.url.includes('/auth/refresh') || req.url.includes('/auth/logout')) {
      refreshState.refreshAttempts = 0; // Reset counter on explicit auth operations
    }
    
    const clonedReq = req.clone({
      withCredentials: true
    });
    
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
        // Handle 401 (Unauthorized) or 403 (Forbidden) responses
        if ((error.status === 401 || error.status === 403) && 
            !req.url.includes('/auth/refresh') && 
            !req.url.includes('/auth/logout') && 
            refreshState.refreshAttempts < refreshState.maxRefreshAttempts) {
            
          // Avoid multiple simultaneous refresh attempts
          if (!refreshState.isRefreshing) {
            console.log(`Authentication error (${error.status}). Attempting to refresh session...`);
            refreshState.isRefreshing = true;
            refreshState.refreshAttempts++;
            
            // Attempt to refresh the token
            // We don't use AuthService directly to avoid circular dependency
            return new Observable(observer => {
              fetch(`${environment.apiUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Refresh failed');
                }
                return response.json();
              })
              .then(data => {
                refreshState.isRefreshing = false;
                
                // Retry the original request
                const retryReq = req.clone({ withCredentials: true });
                next(retryReq).subscribe({
                  next: value => observer.next(value),
                  error: err => observer.error(err),
                  complete: () => observer.complete()
                });
              })
              .catch(err => {
                console.error('Token refresh failed:', err);
                refreshState.isRefreshing = false;
                
                // If refresh fails, redirect to login
                localStorage.removeItem('currentUser');
                router.navigate(['/auth/login']);
                observer.error(error);
              });
            });
          }
        }
        
        // For other errors, log and pass through
        console.error('Error in request:', error);
        
        // If we've reached max refresh attempts, redirect to login
        if ((error.status === 401 || error.status === 403) && 
            refreshState.refreshAttempts >= refreshState.maxRefreshAttempts) {
          console.log('Max refresh attempts reached. Redirecting to login');
          localStorage.removeItem('currentUser');
          router.navigate(['/auth/login']);
        }
        
        return throwError(() => error);
      }),
      
      tap({
        next: response => {
          // On successful response, reset refresh attempts counter
          if (req.url.includes('/auth/login') || req.url.includes('/users/profile')) {
            refreshState.refreshAttempts = 0;
          }
        }
      })
    );
  }
  
  // For non-API requests, pass through unchanged
  return next(req);
};
