import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { User, LoginRequest, LoginResponse } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    // Al iniciar el servicio, verificamos el estado de autenticación
    this.checkAuthStatus().subscribe({
      error: () => {
        console.log('No hay sesión activa');
      }
    });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('Login successful:', response);
        this.currentUserSubject.next(response.user);
        this.toastr.success('Bienvenido ' + response.user.name);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login failed:', error);
        this.currentUserSubject.next(null);
        
        if (error.error?.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Error al iniciar sesión');
        }
        
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        // Limpiar el estado de usuario
        this.currentUserSubject.next(null);
        this.toastr.info('Sesión cerrada');
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Logout failed:', error);
        // Incluso en caso de error, limpiamos el estado local
        this.currentUserSubject.next(null);
        
        if (error.error?.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Error al cerrar sesión');
        }
        return throwError(() => error);
      })
    );
  }

  checkAuthStatus(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/profile`, {
      withCredentials: true
    }).pipe(
      tap(user => {
        console.log('Profile check successful:', user);
        this.currentUserSubject.next(user);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Profile check failed:', error);
        this.currentUserSubject.next(null);
        
        if (error.status !== 401) {
          if (error.error?.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error('Error al verificar la sesión');
          }
        }
        
        return throwError(() => error);
      })
    );
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }
}
