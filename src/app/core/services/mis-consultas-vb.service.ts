import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultaVb, ConsultaVbResponse, ConsultasVbResponse, ConsultaVbDeleteResponse } from '../interfaces/mis-consultas-vb.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MisConsultasVbService {
  private apiUrl = `${environment.apiUrl}/mis-consultas-vb`;

  constructor(private http: HttpClient) { }

  /**
   * Guarda una nueva consulta de ventas brutas
   * @param consulta Los datos de la consulta a guardar
   * @returns Observable con los datos de la consulta guardada
   */
  guardarConsulta(consulta: ConsultaVb): Observable<ConsultaVbResponse> {
    return this.http.post<ConsultaVbResponse>(this.apiUrl, consulta);
  }

  /**
   * Obtiene las consultas guardadas con paginación y filtrado opcional
   * @param page Número de página (default: 1)
   * @param limit Cantidad de registros por página (default: 10)
   * @param rtn RTN opcional para filtrar las consultas
   * @returns Observable con los datos paginados de consultas
   */
  getConsultas(page: number = 1, limit: number = 10, rtn?: string): Observable<ConsultasVbResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (rtn) {
      params = params.set('rtn', rtn);
    }

    return this.http.get<ConsultasVbResponse>(this.apiUrl, { params });
  }

  /**
   * Obtiene el detalle de una consulta específica
   * @param id ID de la consulta
   * @returns Observable con los datos detallados de la consulta
   */
  getConsultaDetalle(id: string): Observable<ConsultaVbResponse> {
    return this.http.get<ConsultaVbResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina una consulta específica (solo admins)
   * @param id ID de la consulta a eliminar
   * @returns Observable con mensaje de confirmación
   */
  eliminarConsulta(id: string): Observable<ConsultaVbDeleteResponse> {
    return this.http.delete<ConsultaVbDeleteResponse>(`${this.apiUrl}/${id}`);
  }
}