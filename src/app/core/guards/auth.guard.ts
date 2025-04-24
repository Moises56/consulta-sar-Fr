import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces/user.interface';
import { catchError, firstValueFrom, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Si ya tenemos un usuario en el servicio, verificamos los roles
  if (authService.currentUser) {
    const requiredRole = route.data['role'] as UserRole;
    if (requiredRole && authService.currentUser.role !== requiredRole) {
      if (authService.currentUser.role !== 'ADMIN') {
        router.navigate(['/dashboard']);
        return false;
      }
    }
    return true;
  }

  try {
    // Si no tenemos usuario, verificar el estado de autenticación con manejo explícito de errores
    const user = await firstValueFrom(
      authService.checkAuthStatus().pipe(
        catchError((error) => {
          console.error('Auth verification failed:', error);
          // Redirigir al login en caso de error
          router.navigate(['/auth/login'], {
            queryParams: {
              returnUrl: state.url
            }
          });
          return of(null); // Devolver observable que emite null
        })
      )
    );
    
    // Si no hay usuario después de verificar, no permitir acceso
    if (!user) {
      return false;
    }

    // Verificar roles si es necesario
    const requiredRole = route.data['role'] as UserRole;
    if (requiredRole && user.role !== requiredRole) {
      if (user.role !== 'ADMIN') {
        router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Auth Guard Error:', error);
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        // Error de permisos
        router.navigate(['/dashboard'], {
          queryParams: {
            error: 'No tienes permisos para acceder a esta sección'
          }
        });
      } else {
        // Error de autenticación u otro
        router.navigate(['/auth/login'], {
          queryParams: {
            returnUrl: state.url
          }
        });
      }
    } else {
      // Cualquier otro error
      router.navigate(['/auth/login']);
    }
    return false;
  }
};
