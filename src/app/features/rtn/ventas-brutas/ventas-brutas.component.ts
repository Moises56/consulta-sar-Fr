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
    <div class="min-h-screen bg-gray-50 w-full">
      <header class="bg-white shadow-sm w-full">
        <div class="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <h2 class="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            Consulta de Ventas Brutas
          </h2>
        </div>
      </header>

      <main class="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <!-- Search Form -->
        <div class="bg-white px-4 py-5 sm:px-6 rounded-lg shadow-sm w-full">
          <form [formGroup]="searchForm" (ngSubmit)="onSubmit()" class="w-full">
            <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 w-full">
              <div class="sm:col-span-2 w-full">
                <label for="rtn" class="block text-sm font-medium text-gray-700">RTN</label>
                <div class="relative mt-1 w-full">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input type="text" id="rtn" formControlName="rtn"
                    class="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ingrese el RTN a consultar (14 dígitos)">
                </div>
                <div *ngIf="searchForm.get('rtn')?.errors?.['required'] && searchForm.get('rtn')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El RTN es requerido
                </div>
                <div *ngIf="searchForm.get('rtn')?.errors?.['pattern'] && searchForm.get('rtn')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El RTN debe tener 14 dígitos
                </div>
              </div>

              <!-- DatePicker Periodo Desde -->
              <div class="w-full">
                <label for="periodoDesde" class="block text-sm font-medium text-gray-700">Periodo Desde</label>
                <div class="relative mt-1 w-full">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    id="periodoDesde" 
                    formControlName="periodoDesdeDisplay"
                    [value]="formatDisplayDate(searchForm.get('periodoDesde')?.value)"
                    readonly
                    (click)="toggleCalendarDesde()"
                    class="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 cursor-pointer"
                    placeholder="Seleccione periodo inicial">
                  <div *ngIf="showCalendarDesde" class="absolute z-10 mt-1 w-64">
                    <div class="bg-white text-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200">
                      <!-- Header con año y navegación -->
                      <div class="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
                        <button type="button" (click)="prevYear()" class="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>
                        <div class="font-semibold">{{ currentYear }}</div>
                        <button type="button" (click)="nextYear()" class="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                      <!-- Grid de meses -->
                      <div class="grid grid-cols-3 sm:grid-cols-4 gap-1 p-2">
                        <button 
                          *ngFor="let month of monthsDisplay; let i = index" 
                          type="button"
                          (click)="selectMonthDesde(i + 1)"
                          class="text-center py-2 px-1 hover:bg-indigo-100 rounded transition-colors duration-200">
                          {{ month }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="searchForm.get('periodoDesde')?.errors?.['required'] && searchForm.get('periodoDesde')?.touched"
                    class="text-red-500 text-sm mt-1">
                    El periodo inicial es requerido
                  </div>
                </div>
              </div>

              <!-- DatePicker Periodo Hasta -->
              <div class="w-full">
                <label for="periodoHasta" class="block text-sm font-medium text-gray-700">Periodo Hasta</label>
                <div class="relative mt-1 w-full">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    id="periodoHasta" 
                    formControlName="periodoHastaDisplay"
                    [value]="formatDisplayDate(searchForm.get('periodoHasta')?.value)"
                    readonly
                    (click)="toggleCalendarHasta()"
                    class="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 cursor-pointer"
                    placeholder="Seleccione periodo final">
                  <div *ngIf="showCalendarHasta" class="absolute z-10 mt-1 w-64">
                    <div class="bg-white text-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200">
                      <!-- Header con año y navegación -->
                      <div class="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
                        <button type="button" (click)="prevYear()" class="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>
                        <div class="font-semibold">{{ currentYear }}</div>
                        <button type="button" (click)="nextYear()" class="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                      <!-- Grid de meses -->
                      <div class="grid grid-cols-3 sm:grid-cols-4 gap-1 p-2">
                        <button 
                          *ngFor="let month of monthsDisplay; let i = index" 
                          type="button"
                          [disabled]="isMonthDisabled(i + 1)"
                          [class]="isMonthDisabled(i + 1) ? 'text-center py-2 px-1 text-gray-400 cursor-not-allowed' : 'text-center py-2 px-1 hover:bg-indigo-100 rounded transition-colors duration-200'"
                          (click)="!isMonthDisabled(i + 1) && selectMonthHasta(i + 1)">
                          {{ month }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="searchForm.get('periodoHasta')?.errors?.['required'] && searchForm.get('periodoHasta')?.touched"
                    class="text-red-500 text-sm mt-1">
                    El periodo final es requerido
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <a routerLink=".."
                class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </a>
              <button type="submit"
                [disabled]="!searchForm.valid || loading"
                class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200">
                <span *ngIf="isRetrying" class="mr-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <svg *ngIf="!loading && !isRetrying" class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {{ loading ? (isRetrying ? 'Reintentando consulta...' : 'Consultando...') : 'Consultar' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Retry Information -->
        <div *ngIf="isRetrying" class="mt-4 sm:mt-6 w-full">
          <div class="rounded-lg bg-blue-50 p-4">
            <div class="flex flex-col sm:flex-row sm:items-center">
              <div class="flex-shrink-0 self-center sm:self-auto">
                <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="mt-3 sm:mt-0 sm:ml-3">
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
        <div *ngIf="error" class="mt-4 sm:mt-6 w-full">
          <div class="rounded-lg bg-red-50 p-4">
            <div class="flex flex-col sm:flex-row sm:items-center">
              <div class="flex-shrink-0 self-center sm:self-auto">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="mt-3 sm:mt-0 sm:ml-3">
                <h3 class="text-sm font-medium text-red-800">Error en la consulta</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{error}} <button *ngIf="canRetryManually" (click)="retryManually()" class="ml-2 text-indigo-600 underline hover:text-indigo-800 transition-colors duration-200">Reintentar</button></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div class="mt-4 sm:mt-6 space-y-6 w-full">
          <!-- Current Results -->
          <div *ngIf="ventasBrutas && datosAmdc.length > 0" class="bg-white shadow overflow-hidden rounded-lg w-full">
            <div class="px-4 py-5 sm:p-6">
              <div class="border-b border-gray-200 pb-4 mb-4">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 line-clamp-2">{{datosAmdc[0].NOMBRE_COMERCIAL}}</h3>
                    <p class="mt-1 text-sm text-gray-500">RTN: <span class="font-semibold">{{datosAmdc[0].RTN}}</span></p>
                  </div>
                  <div class="mt-2 md:mt-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Consulta Actual
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div class="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200 w-full">
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 class="text-base font-medium text-gray-900">Información SAR</h4>
                  </div>
                  <div class="p-4">
                    <dl class="space-y-2">
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Año</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-semibold">{{ventasBrutas.anio}}</dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Total Ventas SAR</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-semibold">L. {{totalVentas | number:'1.2-2'}}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200 w-full">
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 class="text-base font-medium text-gray-900">Información AMDC</h4>
                  </div>
                  <div class="p-4">
                    <dt class="text-sm font-medium text-gray-500 mb-2">Total Declarado AMDC</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <div class="space-y-1.5">
                        <div *ngFor="let dato of datosAmdc" class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 px-2 rounded-md hover:bg-gray-50">
                          <span class="font-semibold">L. {{dato.CANTIDAD_DECLARADA | number:'1.2-2'}}</span>
                          <div class="flex items-center justify-between sm:justify-end mt-1 sm:mt-0 gap-3">
                            <span [class]="dato.ESTATUS === 1 ? 'text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full' : 'text-red-600 text-xs font-medium bg-red-100 px-2 py-0.5 rounded-full'">
                              {{dato.ESTATUS === 1 ? 'Vigente' : 'Rectificado'}}
                            </span>
                            <span class="text-gray-500 text-xs">{{dato.FECHA | date:'shortDate'}}</span>
                          </div>
                        </div>
                      </div>
                    </dd>
                  </div>
                </div>
                
                <!-- Diferencia -->
                <div class="md:col-span-2 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200 w-full">
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 class="text-base font-medium text-gray-900">Análisis Comparativo</h4>
                  </div>
                  <div class="p-4 w-full">
                    <dt class="text-sm font-medium text-gray-500">Diferencia</dt>
                    <dd class="mt-3 w-full" 
                        [ngClass]="getDiferencia() > 0 ? 'text-red-600' : getDiferencia() < 0 ? 'text-green-600' : 'text-gray-600'">
                      <div class="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg w-full" 
                          [ngClass]="getDiferencia() > 0 ? 'bg-red-50' : getDiferencia() < 0 ? 'bg-green-50' : 'bg-gray-50'">
                        <span class="text-lg font-bold" *ngIf="getDiferencia() !== 0">L. {{Math.abs(getDiferencia()) | number:'1.2-2'}}</span>
                        <span class="text-lg font-bold" *ngIf="getDiferencia() === 0">L. 0.00</span>
                        <span class="text-sm" *ngIf="getDiferencia() > 0">
                          <span class="inline-flex items-center">
                            <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            </svg>
                            En contra de la AMDC (valor no declarado)
                          </span>
                        </span>
                        <span class="text-sm" *ngIf="getDiferencia() < 0">
                          <span class="inline-flex items-center">
                            <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            A favor de la AMDC (valor sobredeclarado)
                          </span>
                        </span>
                        <span class="text-sm" *ngIf="getDiferencia() === 0">
                          <span class="inline-flex items-center">
                            <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            Valores iguales (declaración correcta)
                          </span>
                        </span>
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Historical Results -->
          <div *ngIf="consultasRealizadas.length > 0" class="bg-white shadow overflow-hidden rounded-lg w-full">
            <div class="px-4 py-5 sm:px-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">Historial de consultas</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{consultasRealizadas.length}} {{consultasRealizadas.length === 1 ? 'consulta' : 'consultas'}}
                </span>
              </div>
            </div>
            
            <div class="border-t border-gray-200 divide-y divide-gray-200">
              <div *ngFor="let consulta of consultasRealizadas" class="px-4 py-5 sm:p-6 w-full">
                <div class="border-b border-gray-200 pb-4 mb-4" *ngIf="consulta.amdc.length > 0">
                  <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div class="w-full">
                      <h4 class="text-lg font-bold text-gray-900 line-clamp-2">{{consulta.amdc[0].NOMBRE_COMERCIAL}}</h4>
                      <p class="mt-1 text-sm text-gray-500">RTN: <span class="font-semibold">{{consulta.amdc[0].RTN}}</span></p>
                    </div>
                    <div class="mt-2 md:mt-0">
                      <span class="text-sm text-gray-500">Año: {{consulta.sar.anio}}</span>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div class="w-full">
                    <span class="text-sm font-medium text-gray-500 block">Total Ventas SAR</span>
                    <span class="mt-1 text-sm text-gray-900 font-semibold block">L. {{consulta.sar.importeTotalVentas | number:'1.2-2'}}</span>
                  </div>
                  
                  <div class="w-full">
                    <span class="text-sm font-medium text-gray-500 block">Total Declarado AMDC</span>
                    <div class="mt-1 space-y-1 w-full">
                      <div *ngFor="let dato of consulta.amdc">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm w-full">
                          <span class="font-semibold">L. {{dato.CANTIDAD_DECLARADA | number:'1.2-2'}}</span>
                          <div class="flex items-center justify-between sm:justify-end mt-1 sm:mt-0 gap-3">
                            <span [class]="dato.ESTATUS === 1 ? 'text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full' : 'text-red-600 text-xs font-medium bg-red-100 px-2 py-0.5 rounded-full'">
                              {{dato.ESTATUS === 1 ? 'Vigente' : 'Rectificado'}}
                            </span>
                            <span class="text-gray-500 text-xs">{{dato.FECHA | date:'shortDate'}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Diferencia en el historial -->
                  <div class="md:col-span-2 w-full">
                    <span class="text-sm font-medium text-gray-500 block">Diferencia</span>
                    <div class="mt-2 w-full" 
                        [ngClass]="calcularDiferencia(consulta) > 0 ? 'text-red-600' : calcularDiferencia(consulta) < 0 ? 'text-green-600' : 'text-gray-600'">
                      <div class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-md w-full" 
                          [ngClass]="calcularDiferencia(consulta) > 0 ? 'bg-red-50' : calcularDiferencia(consulta) < 0 ? 'bg-green-50' : 'bg-gray-50'">
                        <span class="font-bold" *ngIf="calcularDiferencia(consulta) !== 0">L. {{Math.abs(calcularDiferencia(consulta)) | number:'1.2-2'}}</span>
                        <span class="font-bold" *ngIf="calcularDiferencia(consulta) === 0">L. 0.00</span>
                        <span class="text-sm" *ngIf="calcularDiferencia(consulta) > 0">
                          <svg class="inline-block w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                          </svg>
                          En contra de AMDC
                        </span>
                        <span class="text-sm" *ngIf="calcularDiferencia(consulta) < 0">
                          <svg class="inline-block w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          A favor de AMDC
                        </span>
                        <span class="text-sm" *ngIf="calcularDiferencia(consulta) === 0">
                          <svg class="inline-block w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          Valores iguales
                        </span>
                      </div>
                    </div>
                  </div>
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

  // Variables para el calendario
  showCalendarDesde = false;
  showCalendarHasta = false;
  currentYear = new Date().getFullYear();
  monthsDisplay = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  periodosAgrupados: { [key: string]: string[] } = {};
  
  // Periodos disponibles filtrados basados en el periodo desde seleccionado
  periodosDisponibles: string[] = [];
  
  // Mapa de números de mes a nombres
  private nombresMeses: { [key: string]: string } = {
    '01': 'Enero',
    '02': 'Febrero',
    '03': 'Marzo',
    '04': 'Abril',
    '05': 'Mayo',
    '06': 'Junio',
    '07': 'Julio',
    '08': 'Agosto',
    '09': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre'
  };

  constructor(
    private fb: FormBuilder,
    private rtnService: RtnService,
    private amdcService: AmdcService,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      rtn: ['', [Validators.required, Validators.pattern('^[0-9]{14}$')]],
      periodoDesde: ['', [Validators.required]],
      periodoHasta: ['', [Validators.required]],
      // Campos adicionales para mostrar los periodos con formato
      periodoDesdeDisplay: [''],
      periodoHastaDisplay: ['']
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

    // Iniciar con el año actual
    this.currentYear = new Date().getFullYear();
    if (this.currentYear < startYear || this.currentYear > endYear) {
      this.currentYear = startYear;
    }
  }

  // Navegación del calendario
  prevYear(): void {
    if (this.currentYear > 2020) {
      this.currentYear--;
    }
  }

  nextYear(): void {
    if (this.currentYear < 2025) {
      this.currentYear++;
    }
  }

  // Método para abrir/cerrar el calendario desde
  toggleCalendarDesde(): void {
    this.showCalendarDesde = !this.showCalendarDesde;
    if (this.showCalendarDesde) {
      this.showCalendarHasta = false;
    }
  }

  // Método para abrir/cerrar el calendario hasta
  toggleCalendarHasta(): void {
    this.showCalendarHasta = !this.showCalendarHasta;
    if (this.showCalendarHasta) {
      this.showCalendarDesde = false;
    }
  }

  // Seleccionar un mes para el período desde
  selectMonthDesde(month: number): void {
    const monthFormatted = month.toString().padStart(2, '0');
    const periodo = `${this.currentYear}${monthFormatted}`;
    this.searchForm.get('periodoDesde')?.setValue(periodo);
    this.showCalendarDesde = false;
    
    // Resetear el periodo hasta cuando cambia el periodo desde
    this.searchForm.get('periodoHasta')?.setValue('');
    this.searchForm.get('periodoHastaDisplay')?.setValue('');
  }

  // Seleccionar un mes para el período hasta
  selectMonthHasta(month: number): void {
    const monthFormatted = month.toString().padStart(2, '0');
    const periodo = `${this.currentYear}${monthFormatted}`;
    this.searchForm.get('periodoHasta')?.setValue(periodo);
    this.showCalendarHasta = false;
  }

  // Verificar si un mes debe estar deshabilitado en el selector "hasta"
  isMonthDisabled(month: number): boolean {
    const periodoDesde = this.searchForm.get('periodoDesde')?.value;
    if (!periodoDesde) return true;
    
    const monthFormatted = month.toString().padStart(2, '0');
    const periodoActual = `${this.currentYear}${monthFormatted}`;
    
    return periodoActual < periodoDesde;
  }

  // Formatear fecha para mostrar
  formatDisplayDate(periodo: string): string {
    if (!periodo) return '';
    const year = periodo.substring(0, 4);
    const month = periodo.substring(4, 6);
    return `${this.nombresMeses[month]} ${year}`;
  }

  // Método para convertir número de mes a nombre
  getNombreMes(numeroMes: string): string {
    return this.nombresMeses[numeroMes] || numeroMes;
  }

  // Método para filtrar periodos disponibles basados en el periodo desde
  getPeriodosDisponibles(): string[] {
    const periodoDesde = this.searchForm.get('periodoDesde')?.value;
    if (!periodoDesde) {
      return [];
    }

    let todosLosPeriodos: string[] = [];
    // Aplanar todos los periodos en un solo array
    Object.keys(this.periodosAgrupados).forEach(year => {
      todosLosPeriodos = [...todosLosPeriodos, ...this.periodosAgrupados[year]];
    });

    // Filtrar solo periodos mayores o iguales al periodo desde
    return todosLosPeriodos.filter(periodo => periodo >= periodoDesde);
  }

  // Método que se llama cuando cambia el periodo desde
  onPeriodoDesdeChange(): void {
    // Resetear el periodo hasta cuando cambia el periodo desde
    this.searchForm.get('periodoHasta')?.setValue('');
    
    // Si el periodo desde es válido, actualizar la lista de periodos disponibles
    if (this.searchForm.get('periodoDesde')?.valid) {
      this.periodosDisponibles = this.getPeriodosDisponibles();
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
      
      // Los periodos ya están en formato YYYYMM
      const periodoDesdeFormatted = periodoDesde;
      const periodoHastaFormatted = periodoHasta;
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
