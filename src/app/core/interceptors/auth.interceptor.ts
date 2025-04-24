import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // No modificamos la petición aquí, ya que estamos usando cookies para autenticación
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if ([401, 403].includes(error.status)) {
          // Si la respuesta es un error 401 (no autorizado) o 403 (prohibido)
          // y no estamos en una ruta de autenticación
          if (!request.url.includes('/auth/login')) {
            console.log('Session expired or unauthorized access detected');
            
            // Limpiar estado de usuario en caso de error de autenticación
            if (error.status === 401) {
              // Si es específicamente un error de autenticación
              this.authService['currentUserSubject'].next(null);
              localStorage.removeItem('user_session');
              sessionStorage.removeItem('user_session');
              
              // Redirigir al login solo si no estamos ya en una página de login
              if (!this.router.url.includes('/auth/login')) {
                this.router.navigate(['/auth/login'], {
                  queryParams: { returnUrl: this.router.url }
                });
              }
            }
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}
