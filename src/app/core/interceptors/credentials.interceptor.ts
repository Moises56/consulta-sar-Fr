import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo modificamos las peticiones que van al API
  if (req.url.startsWith(environment.apiUrl)) {
    console.log('Interceptando petición a:', req.url);
    const clonedReq = req.clone({
      withCredentials: true
    });
    console.log('Cookies disponibles:', document.cookie);
    return next(clonedReq).pipe(
      tap({
        error: (error) => {
          console.error('Error en la petición:', error);
          if (error.status === 401) {
            console.log('Error 401 - Cookies actuales:', document.cookie);
          }
        }
      })
    );
  }
  return next(req);
};
