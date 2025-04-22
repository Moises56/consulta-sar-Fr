import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatosAMDC, DatosAMDCFilters } from '../interfaces/datos-amdc.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatosAMDCService {
  private apiUrl = `${environment.apiUrl}/datos-amdc`;

  constructor(private http: HttpClient) {}

  getDatosAMDC(filters: DatosAMDCFilters = {}, page = 1, limit = 10): Observable<{ data: DatosAMDC[], meta: { total: number, page: number, limit: number } }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Añadir solo los filtros específicos que necesitamos
    if (filters.RTN) {
      params = params.set('RTN', filters.RTN);
    }
    if (filters.ANIO) {
      params = params.set('ANIO', filters.ANIO.toString());
    }

    return this.http.get<{ data: DatosAMDC[], meta: { total: number, page: number, limit: number } }>(this.apiUrl, {
      params,
      withCredentials: true
    });
  }

  getDatoAMDC(id: string): Observable<DatosAMDC> {
    return this.http.get<DatosAMDC>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  createDatoAMDC(dato: Partial<DatosAMDC>): Observable<DatosAMDC> {
    return this.http.post<DatosAMDC>(this.apiUrl, dato, {
      withCredentials: true
    });
  }

  updateDatoAMDC(id: string, dato: Partial<DatosAMDC>): Observable<DatosAMDC> {
    return this.http.patch<DatosAMDC>(`${this.apiUrl}/${id}`, dato, {
      withCredentials: true
    });
  }

  deleteDatoAMDC(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
