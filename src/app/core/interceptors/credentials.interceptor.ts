import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo modificamos las peticiones que van al API
  if (req.url.startsWith(environment.apiUrl)) {
    return next(req.clone({
      withCredentials: true
    }));
  }
  return next(req);
};
