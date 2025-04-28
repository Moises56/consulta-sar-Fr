import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError, of } from 'rxjs';
import { User, LoginRequest, LoginResponse } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly USER_STORAGE_KEY = 'currentUser';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    // Try to load user from local storage first
    this.loadUserFromStorage();
    
    // Then verify with the server if we have a stored user
    if (this.currentUserSubject.value) {
      this.checkAuthStatus().subscribe({
        error: () => {
          console.log('Sesión expirada o inválida');
          this.clearStoredUser();
        }
      });
    } else {
      console.log('No hay sesión almacenada');
    }
  }

  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearStoredUser();
    }
  }

  private saveUserToStorage(user: User): void {
    if (user) {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  private clearStoredUser(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('Login successful:', response);
        this.currentUserSubject.next(response.user);
        this.saveUserToStorage(response.user);
        this.toastr.success('Bienvenido ' + response.user.name);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login failed:', error);
        this.currentUserSubject.next(null);
        this.clearStoredUser();
        
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
    // If we don't have a current user, just return an observable that completes
    if (!this.currentUser) {
      this.clearStoredUser();
      return of(null);
    }

    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        // Clear user state
        this.clearStoredUser();
        this.toastr.info('Sesión cerrada');
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Logout failed:', error);
        // Even if server logout fails, clear local state
        this.clearStoredUser();
        
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
        this.saveUserToStorage(user);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Profile check failed:', error);
        
        if (error.status === 401 || error.status === 403) {
          // If unauthorized or forbidden, clear the stored user
          this.clearStoredUser();
        }
        
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

  refreshSession(): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap(user => {
        console.log('Session refreshed successfully:', user);
        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Session refresh failed:', error);
        this.clearStoredUser();
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
