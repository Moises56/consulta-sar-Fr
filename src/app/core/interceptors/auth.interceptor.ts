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
    // No modificamos la petición aquí, ya que estamos usando cookies HTTP-only para autenticación
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if ([401, 403].includes(error.status)) {
          // Si la respuesta es un error 401 (no autorizado) o 403 (prohibido)
          // y no estamos en una ruta de autenticación
          if (!request.url.includes('/auth/login')) {
            console.log('Session expired or unauthorized access detected:', error.status);
            
            // Redirigir al login solo si no estamos ya en una página de login
            if (error.status === 401 && !this.router.url.includes('/auth/login')) {
              // Guardar URL actual para redirigir después del login
              const returnUrl = this.router.url;
              console.log('Redirecting to login with returnUrl:', returnUrl);
              
              this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl }
              });
            }
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}
