import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Log {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
  user: {
    username: string;
    email: string;
    name: string;
  };
}

export interface LogFilters {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/user-logs`;

  constructor(private http: HttpClient) {}

  getLogs(filters: LogFilters = {}): Observable<{ data: Log[], meta: any }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.append(key, value.toString());
      }
    });
    return this.http.get<{ data: Log[], meta: any }>(this.apiUrl, { params });
  }
}
