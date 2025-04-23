import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RtnService } from '../../../core/services/rtn.service';
import { ObligadoTributario } from '../../../core/interfaces/rtn.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rtn-consulta',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Consulta RTN
          </h2>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Search Form -->
        <div class="bg-white px-4 py-5 border-b border-gray-200 rounded-lg shadow-sm">
          <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
            <div class="flex flex-col md:flex-row gap-4 items-end">
              <div class="flex-grow">
                <label for="rtn" class="block text-sm font-medium text-gray-700">RTN</label>
                <div class="relative mt-1">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input type="text" id="rtn" formControlName="rtn"
                    class="pl-10 mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
              <div class="flex gap-4">
                <button type="submit"
                  [disabled]="!searchForm.valid || loading"
                  class="inline-flex items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                  <span *ngIf="isRetrying" class="mr-2">
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {{ loading ? (isRetrying ? 'Reintentando...' : 'Consultando...') : 'Consultar' }}
                </button>
                <a routerLink="ventas-brutas"
                  class="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Consultar Ventas Brutas
                </a>
              </div>
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
        <div *ngIf="obligadoTributario" class="mt-6">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-6 py-5 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">
                    {{obligadoTributario.nombreComercial || obligadoTributario.nombre}}
                  </h3>
                  <p class="mt-2 text-sm text-gray-500">RTN: <span class="font-semibold">{{obligadoTributario.rtn}}</span></p>
                </div>
                <div class="hidden sm:block">
                  <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
            </div>
            
            <div class="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Información General -->
              <div class="bg-white rounded-lg border border-gray-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-lg font-medium text-gray-900">Información General</h4>
                </div>
                <div class="p-4 space-y-3">
                  <div>
                    <span class="text-sm font-medium text-gray-500 block">Nombre Completo</span>
                    <span class="text-sm text-gray-900 block mt-1">{{obligadoTributario.nombre}}</span>
                  </div>
                  
                  <div *ngIf="obligadoTributario.nombreComercial">
                    <span class="text-sm font-medium text-gray-500 block">Nombre Comercial</span>
                    <span class="text-sm text-gray-900 block mt-1">{{obligadoTributario.nombreComercial}}</span>
                  </div>
                  
                  <div *ngIf="obligadoTributario.fechaInicioActividad">
                    <span class="text-sm font-medium text-gray-500 block">Fecha de Inicio de Actividades</span>
                    <span class="text-sm text-gray-900 block mt-1">{{formatDate(obligadoTributario.fechaInicioActividad)}}</span>
                  </div>
                </div>
              </div>
              
              <!-- Ubicación -->
              <div class="bg-white rounded-lg border border-gray-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-lg font-medium text-gray-900">Ubicación</h4>
                </div>
                <div class="p-4 space-y-3">
                  <div *ngIf="obligadoTributario.departamento">
                    <span class="text-sm font-medium text-gray-500 block">Departamento</span>
                    <span class="text-sm text-gray-900 block mt-1">{{obligadoTributario.departamento.descripcion}}</span>
                  </div>
                  
                  <div *ngIf="getDireccionCompleta()">
                    <span class="text-sm font-medium text-gray-500 block">Dirección</span>
                    <span class="text-sm text-gray-900 block mt-1">{{getDireccionCompleta()}}</span>
                  </div>
                </div>
              </div>
              
              <!-- Actividades Económicas -->
              <div class="bg-white rounded-lg border border-gray-200 md:col-span-2">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-lg font-medium text-gray-900">Actividades Económicas</h4>
                </div>
                <div class="p-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div *ngIf="obligadoTributario.actividadPrimaria">
                      <div class="p-4 border border-gray-200 rounded-md">
                        <span class="text-sm font-medium text-gray-500 block">Actividad Principal</span>
                        <div class="flex items-center mt-2">
                          <div class="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div class="ml-4">
                            <span class="text-sm text-gray-900 font-semibold block">{{obligadoTributario.actividadPrimaria.descripcion}}</span>
                            <span class="text-sm text-gray-500 block">Código: {{obligadoTributario.actividadPrimaria.actividadId}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div *ngIf="obligadoTributario.actividadSecundaria">
                      <div class="p-4 border border-gray-200 rounded-md">
                        <span class="text-sm font-medium text-gray-500 block">Actividad Secundaria</span>
                        <div class="flex items-center mt-2">
                          <div class="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div class="ml-4">
                            <span class="text-sm text-gray-900 font-semibold block">{{obligadoTributario.actividadSecundaria.descripcion}}</span>
                            <span class="text-sm text-gray-500 block">Código: {{obligadoTributario.actividadSecundaria.actividadId}}</span>
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
      </main>
    </div>
  `
})
export class RtnConsultaComponent {
  searchForm: FormGroup;
  loading = false;
  error: string | null = null;
  obligadoTributario: ObligadoTributario | null = null;
  
  // Variables para el manejo de reintentos
  isRetrying = false;
  retryCount = 0;
  canRetryManually = false;
  lastSearchRtn: string | null = null;

  constructor(
    private fb: FormBuilder,
    private rtnService: RtnService,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      rtn: ['', [Validators.required, Validators.pattern('^[0-9]{14}$')]]
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.executeSearch(this.searchForm.get('rtn')?.value);
    } else {
      // Mostrar errores de validación
      if (this.searchForm.get('rtn')?.errors?.['pattern']) {
        this.toastr.error('El RTN debe tener 14 dígitos');
      }
    }
  }
  
  executeSearch(rtn: string): void {
    this.loading = true;
    this.error = null;
    this.obligadoTributario = null;
    this.isRetrying = false;
    this.retryCount = 0;
    this.lastSearchRtn = rtn;
    
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

    this.rtnService.consultarRtn(rtn).subscribe({
      next: (response) => {
        // Restaurar console.log original
        console.log = originalConsoleLog;
        this.isRetrying = false;
        
        if (response.isSuccess) {
          this.obligadoTributario = response.data.obligadoTributario;
          this.toastr.success('Consulta realizada con éxito');
          this.canRetryManually = false;
        } else {
          this.error = response.message || 'No se encontró información para el RTN proporcionado';
          this.toastr.warning(this.error);
          this.canRetryManually = false;
        }
        this.loading = false;
      },
      error: (error) => {
        // Restaurar console.log original
        console.log = originalConsoleLog;
        this.isRetrying = false;
        
        console.error('Error consulting RTN:', error);
        
        // Manejar errores personalizados
        if (error && 'isUserMessage' in error && error.isUserMessage) {
          this.error = error.message;
          this.toastr.info(this.error || '');
          this.canRetryManually = false; // No permitir reintentos para errores de validación
        } else {
          this.error = error.error?.message || 'Ocurrió un error al consultar el RTN';
          this.toastr.error(this.error || 'Error desconocido');
          this.canRetryManually = true;
        }
        
        this.loading = false;
      }
    });
  }
  
  retryManually(): void {
    if (this.lastSearchRtn) {
      this.executeSearch(this.lastSearchRtn);
    }
  }
  
  // Helper method to format date (YYYYMMDD to DD/MM/YYYY)
  formatDate(dateString: string): string {
    if (!dateString || dateString.length !== 8) return 'Fecha no disponible';
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    return `${day}/${month}/${year}`;
  }
  
  // Helper method to build the complete address
  getDireccionCompleta(): string {
    if (!this.obligadoTributario) return '';
    
    const parts = [];
    
    if (this.obligadoTributario.barrio) parts.push(this.obligadoTributario.barrio);
    if (this.obligadoTributario.calleAvenida) parts.push(this.obligadoTributario.calleAvenida);
    if (this.obligadoTributario.numeroCasa) parts.push(`Casa/Local: ${this.obligadoTributario.numeroCasa}`);
    if (this.obligadoTributario.bloque) parts.push(`Edificio: ${this.obligadoTributario.bloque}`);
    if (this.obligadoTributario.sector) parts.push(`Sector: ${this.obligadoTributario.sector}`);
    
    return parts.join(', ');
  }
}
