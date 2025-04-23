import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RtnService } from '../../../core/services/rtn.service';
import { AmdcService } from '../../../core/services/amdc.service';
import { VentasBrutasData, VentasBrutasResponse } from '../../../core/interfaces/rtn.interface';
import { DatosAmdc } from '../../../core/interfaces/amdc.interface';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, catchError, of } from 'rxjs';

// Define el tipo para los resultados de la API con posibles errores
type ApiSarResponse = VentasBrutasResponse | { isSuccess: boolean; message: string };
// Tipo para manejar los errores customizados
type CustomError = { status: number; message: string; isUserMessage: boolean };

@Component({
  selector: 'app-ventas-brutas',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Consulta de Ventas Brutas
          </h2>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Search Form -->
        <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
          <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div class="sm:col-span-2">
                <label for="rtn" class="block text-sm font-medium text-gray-700">RTN</label>
                <input type="text" id="rtn" formControlName="rtn"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ingrese el RTN a consultar">
                <div *ngIf="searchForm.get('rtn')?.errors?.['required'] && searchForm.get('rtn')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El RTN es requerido
                </div>
                <div *ngIf="searchForm.get('rtn')?.errors?.['pattern'] && searchForm.get('rtn')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El RTN debe tener 14 dígitos
                </div>
              </div>

              <div>
                <label for="periodoDesde" class="block text-sm font-medium text-gray-700">Periodo Desde</label>
                <select id="periodoDesde" formControlName="periodoDesde"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  <option value="">Seleccione un periodo</option>
                  <optgroup *ngFor="let year of getYears()" [label]="year">
                    <option *ngFor="let periodo of periodosAgrupados[year]" [value]="periodo">
                      {{year}}-{{periodo.slice(4)}}
                    </option>
                  </optgroup>
                </select>
                <div *ngIf="searchForm.get('periodoDesde')?.errors?.['required'] && searchForm.get('periodoDesde')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El periodo inicial es requerido
                </div>
              </div>

              <div>
                <label for="periodoHasta" class="block text-sm font-medium text-gray-700">Periodo Hasta</label>
                <select id="periodoHasta" formControlName="periodoHasta"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  <option value="">Seleccione un periodo</option>
                  <optgroup *ngFor="let year of getYears()" [label]="year">
                    <option *ngFor="let periodo of periodosAgrupados[year]" [value]="periodo">
                      {{year}}-{{periodo.slice(4)}}
                    </option>
                  </optgroup>
                </select>
                <div *ngIf="searchForm.get('periodoHasta')?.errors?.['required'] && searchForm.get('periodoHasta')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El periodo final es requerido
                </div>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-4">
              <a routerLink=".."
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Volver
              </a>
              <button type="submit"
                [disabled]="!searchForm.valid || loading"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                <span *ngIf="isRetrying" class="mr-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ loading ? (isRetrying ? 'Reintentando consulta...' : 'Consultando...') : 'Consultar' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Retry Information -->
        <div *ngIf="isRetrying" class="mt-6">
          <div class="rounded-md bg-blue-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">Reintentos en progreso</h3>
                <div class="mt-2 text-sm text-blue-700">
                  <p>Estamos experimentando alguna dificultad al conectar con el servidor. Reintentando automáticamente...</p>
                  <p class="mt-1">Reintento {{retryCount}} de 3</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="mt-6">
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error en la consulta</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{error}} <button *ngIf="canRetryManually" (click)="retryManually()" class="ml-2 text-indigo-600 underline">Reintentar</button></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div class="mt-6 space-y-6">
          <!-- Current Results -->
          <div *ngIf="ventasBrutas && datosAmdc.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="border-b border-gray-200 pb-4 mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{datosAmdc[0].NOMBRE_COMERCIAL}}</h3>
                <p class="mt-1 text-sm text-gray-500">RTN: {{datosAmdc[0].RTN}}</p>
              </div>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Año</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ventasBrutas.anio}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Total Ventas SAR</dt>
                  <dd class="mt-1 text-sm text-gray-900">L. {{totalVentas | number:'1.2-2'}}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">Total Declarado AMDC</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <div *ngFor="let dato of datosAmdc">
                      <div class="flex justify-between items-center py-1">
                        <span>L. {{dato.CANTIDAD_DECLARADA | number:'1.2-2'}}</span>
                        <span [class]="dato.ESTATUS === 1 ? 'text-green-600' : 'text-red-600'">
                          {{dato.ESTATUS === 1 ? 'Vigente' : 'Rectificado'}}
                        </span>
                        <span class="text-gray-500">{{dato.FECHA | date:'shortDate'}}</span>
                      </div>
                    </div>
                  </dd>
                </div>
                <!-- Nuevo campo para la diferencia con lógica corregida -->
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">Diferencia</dt>
                  <dd class="mt-1 text-sm" [ngClass]="getDiferencia() > 0 ? 'text-red-600' : getDiferencia() < 0 ? 'text-green-600' : 'text-gray-600'">
                    <div class="flex items-center">
                      <span class="font-medium" *ngIf="getDiferencia() !== 0">L. {{Math.abs(getDiferencia()) | number:'1.2-2'}}</span>
                      <span class="font-medium" *ngIf="getDiferencia() === 0">L. 0.00</span>
                      <span class="ml-2" *ngIf="getDiferencia() > 0">
                        en contra de la AMDC
                      </span>
                      <span class="ml-2" *ngIf="getDiferencia() < 0">
                        a favor de la AMDC
                      </span>
                      <span class="ml-2" *ngIf="getDiferencia() === 0">
                        Valores iguales
                      </span>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Historical Results -->
          <div *ngIf="consultasRealizadas.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Historial de consultas</h3>
              <div class="space-y-4">
                <div *ngFor="let consulta of consultasRealizadas" class="border-t pt-4 first:border-t-0 first:pt-0">
                  <div class="border-b border-gray-200 pb-4 mb-4" *ngIf="consulta.amdc.length > 0">
                    <h4 class="text-lg font-medium text-gray-900">{{consulta.amdc[0].NOMBRE_COMERCIAL}}</h4>
                    <p class="mt-1 text-sm text-gray-500">RTN: {{consulta.amdc[0].RTN}}</p>
                  </div>
                  <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div class="sm:col-span-1">
                      <dt class="text-sm font-medium text-gray-500">Año</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{consulta.sar.anio}}</dd>
                    </div>
                    <div class="sm:col-span-1">
                      <dt class="text-sm font-medium text-gray-500">Total Ventas SAR</dt>
                      <dd class="mt-1 text-sm text-gray-900">L. {{consulta.sar.importeTotalVentas | number:'1.2-2'}}</dd>
                    </div>
                    <div class="sm:col-span-2">
                      <dt class="text-sm font-medium text-gray-500">Total Declarado AMDC</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        <div *ngFor="let dato of consulta.amdc">
                          <div class="flex justify-between items-center py-1">
                            <span>L. {{dato.CANTIDAD_DECLARADA | number:'1.2-2'}}</span>
                            <span [class]="dato.ESTATUS === 1 ? 'text-green-600' : 'text-red-600'">
                              {{dato.ESTATUS === 1 ? 'Vigente' : 'Rectificado'}}
                            </span>
                            <span class="text-gray-500">{{dato.FECHA | date:'shortDate'}}</span>
                          </div>
                        </div>
                      </dd>
                    </div>
                    <!-- Nuevo campo para la diferencia en el historial con lógica corregida -->
                    <div class="sm:col-span-2">
                      <dt class="text-sm font-medium text-gray-500">Diferencia</dt>
                      <dd class="mt-1 text-sm" [ngClass]="calcularDiferencia(consulta) > 0 ? 'text-red-600' : calcularDiferencia(consulta) < 0 ? 'text-green-600' : 'text-gray-600'">
                        <div class="flex items-center">
                          <span class="font-medium" *ngIf="calcularDiferencia(consulta) !== 0">L. {{Math.abs(calcularDiferencia(consulta)) | number:'1.2-2'}}</span>
                          <span class="font-medium" *ngIf="calcularDiferencia(consulta) === 0">L. 0.00</span>
                          <span class="ml-2" *ngIf="calcularDiferencia(consulta) > 0">
                            en contra de la AMDC
                          </span>
                          <span class="ml-2" *ngIf="calcularDiferencia(consulta) < 0">
                            a favor de la AMDC
                          </span>
                          <span class="ml-2" *ngIf="calcularDiferencia(consulta) === 0">
                            Valores iguales
                          </span>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class VentasBrutasComponent {
  searchForm: FormGroup;
  loading = false;
  error: string | null = null;
  ventasBrutas: VentasBrutasData | null = null;
  datosAmdc: DatosAmdc[] = [];
  consultasRealizadas: Array<{ sar: VentasBrutasData, amdc: DatosAmdc[] }> = [];
  // Haciendo disponible Math para usar en el template
  Math = Math;
  
  // Variables para el manejo de reintentos
  isRetrying = false;
  retryCount = 0;
  canRetryManually = false;
  lastSearchParams: { rtn: string, periodoDesde: string, periodoHasta: string, anio: string } | null = null;

  periodosAgrupados: { [key: string]: string[] } = {};

  constructor(
    private fb: FormBuilder,
    private rtnService: RtnService,
    private amdcService: AmdcService,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      rtn: ['', [Validators.required, Validators.pattern('^[0-9]{14}$')]],
      periodoDesde: ['', [Validators.required]],
      periodoHasta: ['', [Validators.required]]
    });

    // Generar períodos desde 2020 hasta 2025
    const startYear = 2020;
    const endYear = 2025;
    for (let year = startYear; year <= endYear; year++) {
      this.periodosAgrupados[year] = [];
      for (let month = 1; month <= 12; month++) {
        const periodo = `${year}${month.toString().padStart(2, '0')}`;
        this.periodosAgrupados[year].push(periodo);
      }
    }
  }

  get totalVentas(): number {
    return this.ventasBrutas?.importeTotalVentas || 0;
  }

  // Método para obtener el total declarado a AMDC (solo declaraciones vigentes)
  get totalDeclaradoAmdc(): number {
    return this.datosAmdc
      .filter(dato => dato.ESTATUS === 1) // Solo las declaraciones vigentes
      .reduce((total, dato) => total + parseFloat(dato.CANTIDAD_DECLARADA), 0);
  }

  // Método para calcular la diferencia entre ventas SAR y declarado AMDC
  getDiferencia(): number {
    // Diferencia = Ventas SAR - Declarado AMDC
    // Si es positiva (ventas SAR > declarado AMDC), es EN CONTRA de AMDC
    // Si es negativa (ventas SAR < declarado AMDC), es A FAVOR de AMDC
    // Si es cero, son iguales
    return this.totalVentas - this.totalDeclaradoAmdc;
  }

  // Método para calcular la diferencia en el historial de consultas
  calcularDiferencia(consulta: { sar: VentasBrutasData, amdc: DatosAmdc[] }): number {
    const totalDeclarado = consulta.amdc
      .filter(dato => dato.ESTATUS === 1)
      .reduce((total, dato) => total + parseFloat(dato.CANTIDAD_DECLARADA), 0);
    
    return consulta.sar.importeTotalVentas - totalDeclarado;
  }

  getYears(): string[] {
    return Object.keys(this.periodosAgrupados).sort();
  }

  resetForm(): void {
    this.searchForm.reset();
    this.ventasBrutas = null;
    this.error = null;
  }

  // Nuevo método para reintentar manualmente una consulta fallida
  retryManually(): void {
    if (this.lastSearchParams) {
      this.executeSearch(
        this.lastSearchParams.rtn, 
        this.lastSearchParams.periodoDesde, 
        this.lastSearchParams.periodoHasta,
        this.lastSearchParams.anio
      );
    }
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.loading = true;
      this.error = null;
      this.ventasBrutas = null;
      this.datosAmdc = [];
      this.canRetryManually = false;

      const { rtn, periodoDesde, periodoHasta } = this.searchForm.value;
      
      // Convertir los períodos al formato requerido (YYYYMM)
      const periodoDesdeFormatted = periodoDesde.replace('-', '');
      const periodoHastaFormatted = periodoHasta.replace('-', '');
      const anio = periodoDesdeFormatted.substring(0, 4);

      // Guardar parámetros para posibles reintentos manuales
      this.lastSearchParams = {
        rtn,
        periodoDesde: periodoDesdeFormatted,
        periodoHasta: periodoHastaFormatted,
        anio
      };

      this.executeSearch(rtn, periodoDesdeFormatted, periodoHastaFormatted, anio);
    }
  }

  // Método para ejecutar la búsqueda separado para poder reutilizarlo en reintentos manuales
  executeSearch(rtn: string, periodoDesde: string, periodoHasta: string, anio: string): void {
    this.loading = true;
    this.error = null;
    this.isRetrying = false;
    this.retryCount = 0;
    
    // Capturar eventos de reintento desde el servicio
    const sarConsultaObservable = this.rtnService.consultarVentasBrutas(rtn, periodoDesde, periodoHasta);
    
    // Escuchar el console.log para detectar reintentos
    const originalConsoleLog = console.log;
    console.log = (message, ...args) => {
      originalConsoleLog(message, ...args);
      // Detectar mensaje de reintento y actualizar UI
      if (typeof message === 'string' && message.includes('Reintento')) {
        this.isRetrying = true;
        this.retryCount = parseInt(message.split('/')[0].split(' ')[1]);
      }
    };

    // Realizar ambas consultas en paralelo
    forkJoin({
      sar: sarConsultaObservable.pipe(
        catchError(error => {
          this.canRetryManually = true;
          
          // Verificar si es un error personalizado con mensaje para el usuario
          if ('isUserMessage' in error && error.isUserMessage) {
            // Errores 400 que deben mostrarse al usuario directamente
            return of({ isSuccess: false, message: error.message });
          }
          
          // Para otros errores, mensaje genérico
          return of({ isSuccess: false, message: 'Error al consultar ventas brutas. Puede intentarlo nuevamente.' });
        })
      ),
      amdc: this.amdcService.consultarDatosAmdc(rtn, anio).pipe(
        catchError(error => {
          return of({ data: [] });
        })
      )
    }).subscribe({
      next: (results) => {
        // Restaurar console.log original
        console.log = originalConsoleLog;
        this.isRetrying = false;
        
        if (results.sar.isSuccess) {
          // Verificamos que sea una respuesta exitosa de tipo VentasBrutasResponse
          // usando type guard para distinguir entre los dos tipos posibles
          if ('data' in results.sar) {
            this.ventasBrutas = results.sar.data.ventasBrutas;
            this.datosAmdc = results.amdc.data;

            // Agregar al historial
            this.consultasRealizadas.push({
              sar: results.sar.data.ventasBrutas,
              amdc: results.amdc.data
            });

            this.toastr.success('Consulta realizada con éxito');
            this.canRetryManually = false;
          } else {
            // No debería ocurrir esta situación, pero por si acaso
            this.error = 'Formato de respuesta inesperado';
            this.toastr.warning(this.error);
            this.canRetryManually = true;
          }
        } else {
          this.error = results.sar.message || 'No se encontraron datos para los criterios especificados';
          // Mostrar mensaje como información, no como advertencia, cuando es un mensaje del backend
          this.toastr.info(this.error || '');
          this.canRetryManually = false; // No permitir reintentos para errores de validación
        }
        this.loading = false;
      },
      error: (error) => {
        // Restaurar console.log original
        console.log = originalConsoleLog;
        this.isRetrying = false;
        
        console.error('Error en la consulta:', error);
        
        // Manejar errores personalizados
        if (error && 'isUserMessage' in error && error.isUserMessage) {
          this.error = error.message;
          this.toastr.info(this.error || '');
          this.canRetryManually = false; // No permitir reintentos para errores de validación
        } else {
          this.error = error.error?.message || 'Ocurrió un error al realizar la consulta. Inténtelo nuevamente.';
          this.toastr.error(this.error || 'Error desconocido');
          this.canRetryManually = true;
        }
        
        this.loading = false;
      }
    });
  }
}
