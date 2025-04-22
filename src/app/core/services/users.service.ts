import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserDTO, UpdateUserDTO, User } from '../interfaces/user.interface';
import { PaginatedResponse } from '../interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers(page = 1, limit = 10): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(
      `${environment.apiUrl}/users`,
      {
        params: { page, limit },
        withCredentials: true
      }
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`, {
      withCredentials: true
    });
  }

  createUser(user: CreateUserDTO): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, user, {
      withCredentials: true
    });
  }

  updateUser(id: string, user: UpdateUserDTO): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${id}`, user, {
      withCredentials: true
    });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`, {
      withCredentials: true
    });
  }

  changePassword(id: string, password: string): Observable<void> {
    return this.http.patch<void>(
      `${environment.apiUrl}/users/${id}/password`,
      { password },
      { withCredentials: true }
    );
  }

  getUserLogs(userId?: string, action?: string, page = 1, limit = 10): Observable<any> {
    const params: any = { page, limit };
    if (userId) params.userId = userId;
    if (action) params.action = action;

    return this.http.get(`${environment.apiUrl}/logs`, {
      params,
      withCredentials: true
    });
  }
}
