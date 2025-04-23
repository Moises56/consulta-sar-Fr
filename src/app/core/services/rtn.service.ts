import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, MonoTypeOperatorFunction } from 'rxjs';
import { retryWhen, mergeMap, finalize, catchError } from 'rxjs/operators';
import { RtnResponse, VentasBrutasResponse, VentasBrutasRequest } from '../interfaces/rtn.interface';
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
    }).pipe(
      this.retryWithBackoff<RtnResponse>(),
      catchError(error => {
        // Si es un error 400, capturamos el mensaje para mostrarlo al usuario
        if (error instanceof HttpErrorResponse && error.status === 400) {
          return throwError(() => ({
            status: error.status,
            message: error.error?.message || 'Error en la solicitud',
            isUserMessage: true // Flag para indicar que es un mensaje para mostrar al usuario
          }));
        }
        
        // Si después de todos los reintentos sigue fallando, propagamos el error
        console.error('Error después de múltiples reintentos en consultarRtn:', error);
        return throwError(() => error);
      })
    );
  }

  consultarVentasBrutas(rtn: string, periodoDesde: string, periodoHasta: string): Observable<VentasBrutasResponse> {
    const request: VentasBrutasRequest = {
      Rtn: rtn,
      PeriodoDesde: periodoDesde,
      PeriodoHasta: periodoHasta
    };
    
    return this.http.post<VentasBrutasResponse>(`${this.apiUrl}/ventas-brutas`, request, {
      withCredentials: true
    }).pipe(
      this.retryWithBackoff<VentasBrutasResponse>(),
      catchError(error => {
        // Si es un error 400, capturamos el mensaje para mostrarlo al usuario
        if (error instanceof HttpErrorResponse && error.status === 400) {
          return throwError(() => ({
            status: error.status,
            message: error.error?.message || 'Error en la solicitud',
            isUserMessage: true // Flag para indicar que es un mensaje para mostrar al usuario
          }));
        }
        
        // Si después de todos los reintentos sigue fallando, propagamos el error
        console.error('Error después de múltiples reintentos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Operador personalizado para reintentos con retroceso exponencial
   * @param maxRetries Número máximo de reintentos (por defecto: 3)
   * @param initialDelay Retraso inicial en ms (por defecto: 1000ms)
   * @param maxDelay Retraso máximo en ms (por defecto: 5000ms)
   */
  private retryWithBackoff<T>(maxRetries = 3, initialDelay = 1000, maxDelay = 5000): MonoTypeOperatorFunction<T> {
    let retries = 0;
    
    return retryWhen(errors => 
      errors.pipe(
        mergeMap(error => {
          // Solo reintentar en caso de error 500
          // No reintentar errores 400 ya que son errores de validación
          if (error instanceof HttpErrorResponse && 
              error.status === 500 && 
              retries < maxRetries) {
            retries++;
            
            // Calcular tiempo de espera con retroceso exponencial
            const delay = Math.min(Math.pow(2, retries) * initialDelay, maxDelay);
            
            console.log(`Reintento ${retries}/${maxRetries} después de ${delay}ms`);
            
            // Esperar el tiempo calculado antes de reintentar
            return timer(delay);
          }
          
          // Si no es un error 500 o ya se alcanzó el máximo de reintentos, lanzar el error
          return throwError(() => error);
        }),
        finalize(() => {
          retries = 0; // Reiniciar contador cuando se complete la secuencia
        })
      )
    );
  }
}
