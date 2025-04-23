import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatosAmdcResponse } from '../interfaces/amdc.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmdcService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  consultarDatosAmdc(rtn: string, anio: string): Observable<DatosAmdcResponse> {
    return this.http.get<DatosAmdcResponse>(`${this.apiUrl}/datos-amdc`, {
      params: {
        RTN: rtn,
        ANIO: anio
      },
      withCredentials: true
    });
  }
}
