import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RtnResponse, VentasBrutasResponse } from '../interfaces/rtn.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RtnService {
  private apiUrl = `${environment.apiUrl}/rtn`;

  constructor(private http: HttpClient) {}

  consultarRtn(rtn: string): Observable<RtnResponse> {
    return this.http.post<RtnResponse>(`${this.apiUrl}/consulta`, { rtn }, {
      withCredentials: true
    });
  }

  consultarVentasBrutas(rtn: string, periodoDesde: string, periodoHasta: string): Observable<VentasBrutasResponse> {
    return this.http.post<VentasBrutasResponse>(`${this.apiUrl}/ventas-brutas`, {
      rtn,
      periodoDesde,
      periodoHasta
    }, {
      withCredentials: true
    });
  }
}
