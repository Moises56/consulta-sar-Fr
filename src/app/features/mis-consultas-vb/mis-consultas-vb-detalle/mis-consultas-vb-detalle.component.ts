import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MisConsultasVbService } from '../../../core/services/mis-consultas-vb.service';
import { ToastrService } from 'ngx-toastr';
import { ConsultaVb, DeclaracionAmdc } from '../../../core/interfaces/mis-consultas-vb.interface';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mis-consultas-vb-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 w-full">
      <header class="bg-white shadow-sm w-full">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h2 class="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                Detalle de Consulta
              </h2>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <button
                (click)="goBack()"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              
              <button 
                *ngIf="isAdmin" 
                (click)="deleteConsulta()"
                [disabled]="loading || deleting"
                class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg *ngIf="!deleting" class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <svg *ngIf="deleting" class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Loading indicator -->
        <div *ngIf="loading" class="flex justify-center py-10">
          <svg class="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Error message -->
        <div *ngIf="error" class="bg-red-50 p-4 rounded-md mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Consultation details -->
        <div *ngIf="!loading && !error && consulta" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <!-- Header with company info -->
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ consulta.nombreComercial }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              RTN: {{ consulta.rtn }}
            </p>
          </div>

          <div class="border-t border-gray-200">
            <!-- Main data grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <!-- SAR Information -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-base font-medium text-gray-900">Información SAR</h4>
                </div>
                <div class="p-4">
                  <dl class="space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Año</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-semibold">{{consulta.anio}}</dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Total Ventas SAR</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-semibold">
                          L. {{consulta.importeTotalVentas.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Fecha de Consulta</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{formatDate(consulta.fechaConsulta)}}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <!-- AMDC Information -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-base font-medium text-gray-900">Información AMDC</h4>
                </div>
                <div class="p-4">
                  <dt class="text-sm font-medium text-gray-500 mb-3">Declaraciones</dt>
                  <div *ngIf="getDeclaracionesArray().length > 0" class="space-y-4">
                    <div *ngFor="let declaracion of getDeclaracionesArray(); let i = index" 
                      class="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors duration-150">
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <dt class="text-xs font-medium text-gray-500">Cantidad Declarada</dt>
                          <dd class="text-sm text-gray-900 font-semibold">
                            L. {{formatNumber(declaracion.cantidadDeclarada)}}
                          </dd>
                        </div>
                        <div>
                          <dt class="text-xs font-medium text-gray-500">Estatus</dt>
                          <dd [class]="declaracion.estatus === 'Vigente' ? 'text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full inline-block' : 'text-red-600 text-xs font-medium bg-red-100 px-2 py-0.5 rounded-full inline-block'">
                            {{declaracion.estatus}}
                          </dd>
                        </div>
                        <div>
                          <dt class="text-xs font-medium text-gray-500">Fecha</dt>
                          <dd class="text-sm text-gray-900">
                            {{declaracion.fecha}}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div *ngIf="getDeclaracionesArray().length === 0" class="text-sm text-gray-500 italic">
                    No hay declaraciones registradas.
                  </div>
                </div>
              </div>
              
              <!-- Analysis -->
              <div class="md:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-base font-medium text-gray-900">Análisis Comparativo</h4>
                </div>
                <div class="p-4">
                  <dt class="text-sm font-medium text-gray-500">Diferencia</dt>
                  <dd class="mt-3" 
                      [ngClass]="getAnalisisClass()">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg" 
                         [ngClass]="getAnalisisBgClass()">
                      <span class="text-lg font-bold">
                        L. {{consulta.diferencia.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}
                      </span>
                      <span class="text-sm">
                        <span class="inline-flex items-center">
                          <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path *ngIf="consulta.analisis.includes('contra')" fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            <path *ngIf="consulta.analisis.includes('favor')" fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            <path *ngIf="consulta.analisis.includes('iguales')" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          {{consulta.analisis}}
                        </span>
                      </span>
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MisConsultasVbDetalleComponent implements OnInit {
  consulta: ConsultaVb | null = null;
  loading = true;
  error: string | null = null;
  deleting = false;
  isAdmin = false;
  
  constructor(
    private misConsultasVbService: MisConsultasVbService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConsulta();
    this.checkUserRole();
  }

  checkUserRole(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isAdmin = user.role === 'ADMIN';
      }
    });
  }

  loadConsulta(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID de consulta no válido';
      this.loading = false;
      return;
    }

    this.misConsultasVbService.getConsultaDetalle(id)
      .pipe(
        catchError(error => {
          console.error('Error al cargar consulta:', error);
          this.error = 'No se pudo cargar la consulta. Verifique que exista o inténtelo de nuevo más tarde.';
          this.toastr.error(this.error);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          // Fix type mismatch by converting response to ConsultaVb type
          this.consulta = this.convertToConsultaVb(response);
        }
      });
  }

  // Helper method to convert response to ConsultaVb with proper typing
  convertToConsultaVb(response: any): ConsultaVb {
    const consultaVb: ConsultaVb = {
      id: response.id,
      rtn: response.rtn,
      nombreComercial: response.nombreComercial,
      anio: response.anio,
      importeTotalVentas: response.importeTotalVentas,
      declaracionesAmdc: Array.isArray(response.declaracionesAmdc) ? 
        response.declaracionesAmdc : 
        (typeof response.declaracionesAmdc === 'string' ? 
          JSON.parse(response.declaracionesAmdc) : []),
      diferencia: response.diferencia,
      analisis: response.analisis,
      fechaConsulta: response.fechaConsulta,
      userId: response.usuarioId || response.userId // Map either usuarioId or userId to userId
    };
    return consultaVb;
  }

  deleteConsulta(): void {
    if (!this.consulta?.id || !this.isAdmin) return;

    if (confirm('¿Está seguro de que desea eliminar esta consulta? Esta acción no se puede deshacer.')) {
      this.deleting = true;

      this.misConsultasVbService.eliminarConsulta(this.consulta.id)
        .pipe(
          catchError(error => {
            console.error('Error al eliminar la consulta:', error);
            this.toastr.error('No se pudo eliminar la consulta. Inténtelo de nuevo más tarde.');
            return of(null);
          }),
          finalize(() => {
            this.deleting = false;
          })
        )
        .subscribe(response => {
          if (response) {
            this.toastr.success('Consulta eliminada con éxito');
            this.router.navigate(['/mis-consultas-vb']);
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/mis-consultas-vb']);
  }

  formatDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString('es-HN')} ${dateObj.toLocaleTimeString('es-HN', {hour: '2-digit', minute:'2-digit'})}`;
  }

  formatNumber(value: string | number): string {
    if (!value) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getDeclaracionesArray(): DeclaracionAmdc[] {
    if (!this.consulta) return [];
    
    // Handle both string (serialized JSON) and array
    if (typeof this.consulta.declaracionesAmdc === 'string') {
      try {
        return JSON.parse(this.consulta.declaracionesAmdc);
      } catch (e) {
        console.error('Error parsing declaraciones:', e);
        return [];
      }
    }
    
    return this.consulta.declaracionesAmdc as DeclaracionAmdc[];
  }

  getAnalisisClass(): string {
    if (!this.consulta) return '';
    
    if (this.consulta.analisis.includes('contra')) {
      return 'text-red-600';
    } else if (this.consulta.analisis.includes('favor')) {
      return 'text-green-600';
    } else {
      return 'text-gray-600';
    }
  }

  getAnalisisBgClass(): string {
    if (!this.consulta) return '';
    
    if (this.consulta.analisis.includes('contra')) {
      return 'bg-red-50';
    } else if (this.consulta.analisis.includes('favor')) {
      return 'bg-green-50';
    } else {
      return 'bg-gray-50';
    }
  }
}