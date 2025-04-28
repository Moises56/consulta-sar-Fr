import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RtnService } from '../../../core/services/rtn.service';
import { AmdcService } from '../../../core/services/amdc.service';
import { VentasBrutasData, VentasBrutasResponse } from '../../../core/interfaces/rtn.interface';
import { DatosAmdc } from '../../../core/interfaces/amdc.interface';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, catchError, of } from 'rxjs';
// Importaciones para exportación a PDF y Excel
import * as XLSX from 'xlsx';
// Importar AuthService para obtener el usuario actual
import { AuthService } from '../../../core/services/auth.service';
// Importar el nuevo servicio MisConsultasVbService
import { MisConsultasVbService } from '../../../core/services/mis-consultas-vb.service';
import { ConsultaVb, DeclaracionAmdc } from '../../../core/interfaces/mis-consultas-vb.interface';

// Importamos pdfMake de forma compatible con TypeScript
declare const pdfMake: any;
// Necesario para que pdfmake funcione
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

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

      <div class="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
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
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 1 0 0-2Z"/>
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
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 1 0 0-2Z"/>
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
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
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
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h3 class="text-lg font-medium text-gray-900">Historial de consultas</h3>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 sm:mt-0">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{consultasRealizadas.length}} {{consultasRealizadas.length === 1 ? 'consulta' : 'consultas'}}
                  </span>
                  <div class="flex items-center gap-2">
                    <button (click)="exportToPDF()" class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF
                    </button>
                    <button (click)="exportToExcel()" class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            
            <div class="border-t border-gray-200 divide-y divide-gray-200">
              <div *ngFor="let consulta of consultasRealizadas; let i = index" class="px-4 py-5 sm:p-6 w-full">
                <div class="border-b border-gray-200 pb-4 mb-4" *ngIf="consulta.amdc.length > 0">
                  <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div class="w-full">
                      <h4 class="text-lg font-bold text-gray-900 line-clamp-2">{{consulta.amdc[0].NOMBRE_COMERCIAL}}</h4>
                      <p class="mt-1 text-sm text-gray-500">RTN: <span class="font-semibold">{{consulta.amdc[0].RTN}}</span></p>
                    </div>
                    <div class="flex items-center mt-2 md:mt-0 gap-2">
                      <span class="text-sm text-gray-500">Año: {{consulta.sar.anio}}</span>
                      <button (click)="eliminarConsulta(i)" class="text-gray-400 hover:text-red-600 focus:outline-none" title="Eliminar consulta">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
      </div>
    </div>
  `
})
export class VentasBrutasComponent implements OnInit {
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
    private toastr: ToastrService,
    private authService: AuthService,
    private misConsultasVbService: MisConsultasVbService
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

  ngOnInit(): void {
    this.loadSavedConsultations();
  }

  // Método para cargar consultas guardadas desde el backend
  loadSavedConsultations(): void {
    this.misConsultasVbService.getConsultas().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.consultasRealizadas = response.data.map((consulta: ConsultaVb) => ({
            sar: {
              anio: consulta.anio,
              importeTotalVentas: consulta.importeTotalVentas
            },
            amdc: Array.isArray(consulta.declaracionesAmdc) ? consulta.declaracionesAmdc.map((declaracion: DeclaracionAmdc) => ({
              CANTIDAD_DECLARADA: declaracion.cantidadDeclarada,
              ESTATUS: declaracion.estatus === 'Vigente' ? 1 : 0,
              FECHA: new Date(declaracion.fecha).toISOString(),
              NOMBRE_COMERCIAL: consulta.nombreComercial,
              RTN: consulta.rtn,
              id: '',
              ICS: '',
              NOMBRE: consulta.nombreComercial,
              ANIO: parseInt(consulta.anio)
            })) : []
          }));
        }
      },
      error: (error: any) => {
        console.error('Error al cargar consultas guardadas:', error);
        this.toastr.error('Error al cargar consultas guardadas');
      }
    });
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
      
      // Limpiar los campos del formulario después de realizar la búsqueda
      this.searchForm.patchValue({
        rtn: '',
        periodoDesde: '',
        periodoHasta: '',
        periodoDesdeDisplay: '',
        periodoHastaDisplay: ''
      });
      
      // Asegurar que los validadores se reseteen correctamente
      this.searchForm.markAsPristine();
      this.searchForm.markAsUntouched();
      
      // Resetear las banderas del calendario
      this.showCalendarDesde = false;
      this.showCalendarHasta = false;
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

            // Agregar al historial local
            this.consultasRealizadas.push({
              sar: results.sar.data.ventasBrutas,
              amdc: results.amdc.data
            });

            // Calcular la diferencia entre ventas brutas y declarado AMDC
            const diferencia = this.totalVentas - this.datosAmdc
              .filter(dato => dato.ESTATUS === 1)
              .reduce((total, dato) => total + parseFloat(dato.CANTIDAD_DECLARADA), 0);
            
            // Determinar el análisis basado en la diferencia
            let analisis = '';
            if (diferencia > 0) {
              analisis = 'En contra de la AMDC (valor no declarado)';
            } else if (diferencia < 0) {
              analisis = 'A favor de la AMDC (valor sobredeclarado)';
            } else {
              analisis = 'Valores iguales (declaración correcta)';
            }

            // Preparar las declaraciones de AMDC con el formato requerido para guardar
            const declaracionesAmdc: DeclaracionAmdc[] = this.datosAmdc.map(dato => {
              return {
                cantidadDeclarada: dato.CANTIDAD_DECLARADA,
                estatus: dato.ESTATUS === 1 ? 'Vigente' : 'Rectificado',
                fecha: new Date(dato.FECHA).toLocaleDateString('es-ES')
              };
            });
            
            // Crear el objeto de consulta para guardar en el backend
            const consultaParaGuardar: ConsultaVb = {
              rtn: rtn,
              nombreComercial: this.datosAmdc.length > 0 ? this.datosAmdc[0].NOMBRE_COMERCIAL : 'N/A',
              anio: this.ventasBrutas.anio,
              importeTotalVentas: this.ventasBrutas.importeTotalVentas,
              declaracionesAmdc: declaracionesAmdc,
              diferencia: Math.abs(diferencia),
              analisis: analisis,
              fechaConsulta: new Date().toISOString()
            };
            
            // Guardar la consulta en el backend
            this.misConsultasVbService.guardarConsulta(consultaParaGuardar)
              .subscribe({
                next: (response) => {
                  console.log('Consulta guardada con éxito en el backend:', response);
                  this.toastr.success('Consulta guardada exitosamente', 'Guardado');
                },
                error: (error) => {
                  console.error('Error al guardar la consulta:', error);
                  this.toastr.warning('La consulta se realizó pero no pudo ser guardada en el servidor', 'Advertencia');
                }
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

// Método para exportar el historial de consultas a PDF
exportToPDF(): void {
  if (this.consultasRealizadas.length === 0) {
    this.toastr.warning('No hay consultas para exportar');
    return;
  }

  try {
    // Rutas correctas de los logos
    const logoPath = 'logos/logo.png';
    const logoBuenCorazonPath = 'logos/logoBuenCorazon.png';
    
    // Cargar las imágenes primero
    this.loadImageAsBase64(logoPath).then(logoData => {
      this.loadImageAsBase64(logoBuenCorazonPath).then(logoBuenCorazonData => {
        
        // Fecha y hora actual y usuario que generó
        const now = new Date();
        const currentUser = this.authService.currentUser;
        
        // Crear el documento con los estilos
        const docDefinition: any = {
          pageSize: 'LETTER',
          // Reducir márgenes
          pageMargins: [40, 80, 40, 40],

          // Encabezado del documento
          header: {
            margin: [40, 20, 40, 20],
            columns: [
              {
                image: logoData,
                width: 80,
                alignment: 'left',
                margin: [0, 0, 0, 0],
              },
              {
                stack: [
                  {
                    text: 'Unidad Municipal de Inteligencia Fiscal',
                    alignment: 'center',
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5],
                    color: 'black',
                  },
                  {
                    text: 'Reporte de Volumen de Ventas Brutas',
                    alignment: 'center',
                    fontSize: 12,
                    bold: true,
                    margin: [0, 0, 0, 0],
                    color: '#5ccedf',
                  },
                ],
                alignment: 'center',
              },
              {
                image: logoBuenCorazonData,
                width: 80,
                alignment: 'right',
                margin: [0, 0, 0, 0],
              },
            ],
          },

          // Pie de página
          footer: (currentPage: number, pageCount: number) => {
            return {
              columns: [
                {
                  text: '© 2025 Alcaldía Municipal del Distrito Central',
                  alignment: 'left',
                  fontSize: 8,
                  margin: [40, 5, 0, 0],
                  color: '#000',
                },
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  alignment: 'right',
                  fontSize: 8,
                  margin: [0, 5, 40, 0],
                  color: '#000',
                },
              ],
            };
          },

          // Contenido del documento
          content: [
            // Metadata como fecha y usuario
            {
              columns: [
                { width: '*', text: '' }, // Columna vacía para espaciado
                {
                  width: 'auto',
                  stack: [
                    {
                      text: `Generado: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
                      fontSize: 8,
                      color: 'black',
                    },
                    {
                      text: `Generado por: ${
                        currentUser ? currentUser.name : 'Usuario del sistema'
                      }`,
                      fontSize: 8,
                      color: 'black',
                    },
                  ],
                  alignment: 'right',
                },
              ],
              margin: [0, 0, 0, 10],
            },
          ],

          // Estilos para el documento
          styles: {
            header: {
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 5],
              color: 'black',
            },
            subheader: {
              fontSize: 12,
              bold: true,
              margin: [0, 10, 0, 5],
              color: 'black',
            },
            tableHeader: {
              bold: true,
              fontSize: 10,
              color: 'white',
              fillColor: '#5ccedf',
            },
            tableCell: {
              fontSize: 9,
              color: 'black',
            },
            vigente: {
              fontSize: 9,
              color: '#059669',
            },
            rectificado: {
              fontSize: 9,
              color: '#DC2626',
            },
            diferenciaPositiva: {
              fontSize: 9,
              color: '#DC2626',
            },
            diferenciaNegativa: {
              fontSize: 9,
              color: '#059669',
            },
            diferenciaCero: {
              fontSize: 9,
              color: '#4B5563',
            },
          },
        };

        // Generar el contenido para cada consulta
        this.consultasRealizadas.forEach((consulta, index) => {
          const nombreComercial = consulta.amdc.length > 0 ? consulta.amdc[0].NOMBRE_COMERCIAL : 'N/A';
          const rtnEmpresa = consulta.amdc.length > 0 ? consulta.amdc[0].RTN : 'N/A';
          
          // Agregar separador entre consultas excepto la primera
          if (index > 0) {
            docDefinition.content.push({
              canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#dddddd' }],
              margin: [0, 10, 0, 10]
            });
          }
          
          // Agregar título de la consulta
          docDefinition.content.push({
            text: `Consulta #${index + 1} - ${nombreComercial}`,
            style: 'header'
          });
          
          // Agregar RTN y año
          docDefinition.content.push({
            text: `RTN: ${rtnEmpresa} - Año: ${consulta.sar.anio}`,
            style: 'subheader'
          });
          
          // Agregar información de SAR
          docDefinition.content.push({
            text: 'Información SAR',
            style: 'subheader',
            margin: [0, 5, 0, 5]
          });
          
          docDefinition.content.push({
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                [{ text: 'Concepto', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }],
                [{ text: 'Año', style: 'tableCell' }, { text: consulta.sar.anio, style: 'tableCell' }],
                [{ text: 'Total Ventas SAR', style: 'tableCell' }, { text: `L. ${consulta.sar.importeTotalVentas.toFixed(2)}`, style: 'tableCell' }]
              ]
            },
            margin: [0, 5, 0, 10]
          });
          
          // Agregar información de AMDC
          docDefinition.content.push({
            text: 'Información AMDC',
            style: 'subheader',
            margin: [0, 5, 0, 5]
          });
          
          const amdcRows = [
            [
              { text: 'Cantidad Declarada', style: 'tableHeader' }, 
              { text: 'Estatus', style: 'tableHeader' }, 
              { text: 'Fecha', style: 'tableHeader' }
            ]
          ];

          consulta.amdc.forEach(dato => {
            amdcRows.push([
              { text: `L. ${parseFloat(dato.CANTIDAD_DECLARADA).toFixed(2)}`, style: 'tableCell' },
              { 
                text: dato.ESTATUS === 1 ? 'Vigente' : 'Rectificado', 
                style: dato.ESTATUS === 1 ? 'vigente' : 'rectificado'
              },
              { 
                text: new Date(dato.FECHA).toLocaleDateString(), 
                style: 'tableCell' 
              }
            ]);
          });
          
          docDefinition.content.push({
            table: {
              headerRows: 1,
              widths: ['*', '*', '*'],
              body: amdcRows
            },
            margin: [0, 5, 0, 10]
          });
          
          // Sección de análisis comparativo
          const totalDeclarado = consulta.amdc
            .filter(dato => dato.ESTATUS === 1)
            .reduce((total, dato) => total + parseFloat(dato.CANTIDAD_DECLARADA), 0);
          
          const diferencia = consulta.sar.importeTotalVentas - totalDeclarado;
          let textoComparacion = '';
          let estiloDiferencia = '';

          if (diferencia > 0) {
            textoComparacion = 'En contra de la AMDC (valor no declarado)';
            estiloDiferencia = 'diferenciaPositiva';
          } else if (diferencia < 0) {
            textoComparacion = 'A favor de la AMDC (valor sobredeclarado)';
            estiloDiferencia = 'diferenciaNegativa';
          } else {
            textoComparacion = 'Valores iguales (declaración correcta)';
            estiloDiferencia = 'diferenciaCero';
          }
          
          docDefinition.content.push({
            text: 'Análisis Comparativo',
            style: 'subheader',
            margin: [0, 5, 0, 5]
          });
          
          docDefinition.content.push({
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                [{ text: 'Diferencia', style: 'tableHeader' }, { text: 'Análisis', style: 'tableHeader' }],
                [
                  { text: `L. ${Math.abs(diferencia).toFixed(2)}`, style: estiloDiferencia },
                  { text: textoComparacion, style: estiloDiferencia }
                ]
              ]
            },
            margin: [0, 5, 0, 10]
          });
        });
        
        // Generar el PDF con el formato mejorado
        pdfMake.createPdf(docDefinition).download('reporte-ventas-brutas.pdf');
        this.toastr.success('PDF generado con éxito');
      }).catch(error => {
        console.error('Error al cargar logoBuenCorazon:', error);
        this.toastr.error('Error al generar el PDF: No se pudo cargar una de las imágenes');
      });
    }).catch(error => {
      console.error('Error al cargar logo:', error);
      this.toastr.error('Error al generar el PDF: No se pudo cargar una de las imágenes');
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    this.toastr.error('Error al generar el PDF');
  }
}

  // Método auxiliar para cargar imágenes como base64
  loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Necesario para permitir CORS
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            // Convertir a base64
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } else {
            reject(new Error('No se pudo obtener el contexto del canvas'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = url;
    });
  }

  // Método para exportar el historial de consultas a Excel
  exportToExcel(): void {
    if (this.consultasRealizadas.length === 0) {
      this.toastr.warning('No hay consultas para exportar');
      return;
    }

    try {
      const datosExcel: any[] = [];

      // Iterar sobre todas las consultas
      this.consultasRealizadas.forEach((consulta, index) => {
        // Determinar cuántas filas necesitamos para esta consulta
        const filasNecesarias = Math.max(1, consulta.amdc.length);
        
        // Para cada registro de AMDC
        for (let i = 0; i < filasNecesarias; i++) {
          const fila: any = {};
          
          // Si es la primera fila de esta consulta, agregamos datos de SAR
          if (i === 0) {
            fila['#'] = index + 1;
            fila['RTN'] = consulta.amdc.length > 0 ? consulta.amdc[0].RTN : 'N/A';
            fila['Nombre Comercial'] = consulta.amdc.length > 0 ? consulta.amdc[0].NOMBRE_COMERCIAL : 'N/A';
            fila['Año'] = consulta.sar.anio;
            fila['Total Ventas SAR'] = consulta.sar.importeTotalVentas;
          } else {
            fila['#'] = '';
            fila['RTN'] = '';
            fila['Nombre Comercial'] = '';
            fila['Año'] = '';
            fila['Total Ventas SAR'] = '';
          }
          
          // Datos de AMDC si hay registro para esta fila
          if (i < consulta.amdc.length) {
            const dato = consulta.amdc[i];
            fila['Cantidad Declarada'] = parseFloat(dato.CANTIDAD_DECLARADA);
            fila['Estatus'] = dato.ESTATUS === 1 ? 'Vigente' : 'Rectificado';
            fila['Fecha Declaración'] = new Date(dato.FECHA).toLocaleDateString();
          } else {
            fila['Cantidad Declarada'] = '';
            fila['Estatus'] = '';
            fila['Fecha Declaración'] = '';
          }
          
          // Agregar la diferencia y el análisis (solo para la primera fila de cada consulta)
          if (i === 0) {
            const totalDeclarado = consulta.amdc
              .filter(dato => dato.ESTATUS === 1)
              .reduce((total, dato) => total + parseFloat(dato.CANTIDAD_DECLARADA), 0);
            
            const diferencia = consulta.sar.importeTotalVentas - totalDeclarado;
            let textoComparacion = '';
            
            if (diferencia > 0) {
              textoComparacion = 'En contra de AMDC (no declarado)';
            } else if (diferencia < 0) {
              textoComparacion = 'A favor de AMDC (sobredeclarado)';
            } else {
              textoComparacion = 'Valores iguales';
            }
            
            fila['Diferencia'] = Math.abs(diferencia);
            fila['Análisis'] = textoComparacion;
          } else {
            fila['Diferencia'] = '';
            fila['Análisis'] = '';
          }

          // Columnas adicionales solicitadas
          if (i === 0) {
            // Calculamos el monto ImptoBruto (1.5% del total de ventas)
            fila['ImptoBruto'] = consulta.sar.importeTotalVentas * 0.015;
            
            // La tasa siempre es 1.5%
            fila['Tasa'] = '1.5%';
            
            // Usuario que realizó la consulta
            const currentUser = this.authService.currentUser;
            fila['Usuario'] = currentUser ? currentUser.name : 'Usuario del sistema';
            
            // Fecha de consulta - formato fecha
            fila['Fecha Consulta'] = new Date().toLocaleDateString();
          } else {
            fila['ImptoBruto'] = '';
            fila['Tasa'] = '';
            fila['Usuario'] = '';
            fila['Fecha Consulta'] = '';
          }
          
          datosExcel.push(fila);
        }
      });

      // Crear una hoja de trabajo y luego un libro
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultas VB');

      // Ajustar anchos de columna automáticamente
      const columnas = [
        { wch: 5 },  // #
        { wch: 20 }, // RTN
        { wch: 40 }, // Nombre Comercial
        { wch: 10 }, // Año
        { wch: 15 }, // Total Ventas SAR
        { wch: 15 }, // Cantidad Declarada
        { wch: 15 }, // Estatus
        { wch: 15 }, // Fecha Declaración
        { wch: 15 }, // Diferencia
        { wch: 30 }, // Análisis
        { wch: 15 }, // ImptoBruto
        { wch: 10 }, // Tasa
        { wch: 25 }, // Usuario
        { wch: 15 }  // Fecha Consulta
      ];
      
      worksheet['!cols'] = columnas;

      // Generar el archivo Excel
      XLSX.writeFile(workbook, 'reporte-ventas-brutas.xlsx');
      this.toastr.success('Excel generado con éxito');
    } catch (error) {
      console.error('Error al generar Excel:', error);
      this.toastr.error('Error al generar el Excel');
    }
  }

  // Método para eliminar una consulta del historial
  eliminarConsulta(index: number): void {
    this.consultasRealizadas.splice(index, 1);
    this.toastr.success('Consulta eliminada del historial');
  }
}
