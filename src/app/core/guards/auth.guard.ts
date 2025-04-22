import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces/user.interface';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Si ya tenemos un usuario en el servicio, no necesitamos hacer la petición
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
    // Si no tenemos usuario, verificar el estado de autenticación
    const user = await firstValueFrom(authService.checkAuthStatus());
    
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
    if (error instanceof HttpErrorResponse) {
      console.error('Auth Guard Error:', error);
      
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
    }
    return false;
  }
};
