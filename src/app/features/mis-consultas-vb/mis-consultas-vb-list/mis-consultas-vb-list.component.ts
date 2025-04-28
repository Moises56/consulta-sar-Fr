import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MisConsultasVbService } from '../../../core/services/mis-consultas-vb.service';
import { ToastrService } from 'ngx-toastr';
import { ConsultaVb } from '../../../core/interfaces/mis-consultas-vb.interface';
import { catchError, tap, finalize, of } from 'rxjs';

@Component({
  selector: 'app-mis-consultas-vb-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 w-full">
      <header class="bg-white shadow-sm w-full">
        <div class="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <h2 class="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            Mis Consultas de Ventas Brutas
          </h2>
        </div>
      </header>

      <div class="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <!-- Search Form -->
        <div class="bg-white px-4 py-5 sm:px-6 rounded-lg shadow-sm w-full mb-6">
          <form [formGroup]="searchForm" (ngSubmit)="search()" class="w-full">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="w-full">
                <label for="rtn" class="block text-sm font-medium text-gray-700">RTN</label>
                <div class="mt-1 relative">
                  <input 
                    type="text" 
                    id="rtn" 
                    formControlName="rtn"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                    placeholder="Ingrese RTN para filtrar (opcional)">
                </div>
              </div>
              
              <div class="w-full md:col-span-2 flex flex-col md:flex-row md:items-end gap-2">
                <button 
                  type="submit" 
                  class="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  [disabled]="loading"
                >
                  <svg *ngIf="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg *ngIf="!loading" class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </button>
                
                <button 
                  type="button" 
                  (click)="resetFilters()" 
                  class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Limpiar filtros
                </button>

                <a 
                  routerLink="/rtn/ventas-brutas" 
                  class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Consulta
                </a>
              </div>
            </div>
          </form>
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

        <!-- Results -->
        <div *ngIf="loading" class="flex justify-center py-10">
          <svg class="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div *ngIf="!loading && consultas.length === 0" class="bg-white p-6 rounded-lg shadow-sm text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay consultas guardadas</h3>
          <p class="mt-1 text-sm text-gray-500">Realice consultas de ventas brutas para guardarlas.</p>
          <div class="mt-6">
            <a routerLink="/rtn/ventas-brutas" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Consulta
            </a>
          </div>
        </div>

        <!-- List of saved consultations -->
        <div *ngIf="!loading && consultas.length > 0" class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li *ngFor="let consulta of consultas">
              <a routerLink="/mis-consultas-vb/{{consulta.id}}" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-indigo-600 truncate">{{consulta.nombreComercial}}</p>
                      <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {{consulta.rtn}}
                      </span>
                    </div>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p 
                        [ngClass]="{
                          'text-green-800 bg-green-100': consulta.analisis.includes('favor'),
                          'text-red-800 bg-red-100': consulta.analisis.includes('contra'),
                          'text-gray-800 bg-gray-100': consulta.analisis.includes('iguales')
                        }" 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{consulta.analisis}}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        <span>Año: {{consulta.anio}}</span>
                      </p>
                      <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span>Ventas SAR: L. {{consulta.importeTotalVentas.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}</span>
                      </p>
                      <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span>Diferencia: L. {{consulta.diferencia.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}</span>
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      <p>
                        {{formatDate(consulta.fechaConsulta)}}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </li>
          </ul>
          
          <!-- Pagination -->
          <div *ngIf="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button 
                [disabled]="currentPage === 1" 
                (click)="goToPage(currentPage - 1)"
                [ngClass]="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md"
              >
                Anterior
              </button>
              <button 
                [disabled]="currentPage === totalPages" 
                (click)="goToPage(currentPage + 1)"
                [ngClass]="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md"
              >
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Mostrando
                  <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                  a
                  <span class="font-medium">{{ math.min(currentPage * itemsPerPage, totalItems) }}</span>
                  de
                  <span class="font-medium">{{ totalItems }}</span>
                  resultados
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    [disabled]="currentPage === 1" 
                    (click)="goToPage(currentPage - 1)"
                    [ngClass]="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium"
                  >
                    <span class="sr-only">Anterior</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <ng-container *ngFor="let page of getPaginationArray()">
                    <button 
                      *ngIf="page !== '...'" 
                      [disabled]="currentPage === page"
                      (click)="goToPage(+page)"
                      [ngClass]="currentPage === page ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                      class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      {{page}}
                    </button>
                    <span *ngIf="page === '...'" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  </ng-container>
                  
                  <button 
                    [disabled]="currentPage === totalPages"
                    (click)="goToPage(currentPage + 1)"
                    [ngClass]="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium"
                  >
                    <span class="sr-only">Siguiente</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MisConsultasVbListComponent implements OnInit {
  consultas: ConsultaVb[] = [];
  loading = false;
  error: string | null = null;
  searchForm: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  math = Math; // Make Math available in template, lowercase to prevent Angular parsing error

  constructor(
    private misConsultasVbService: MisConsultasVbService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      rtn: ['']
    });
  }

  ngOnInit(): void {
    this.loadConsultas();
  }

  loadConsultas(page: number = 1): void {
    this.loading = true;
    this.error = null;
    const rtn = this.searchForm.get('rtn')?.value || '';

    this.misConsultasVbService.getConsultas(page, this.itemsPerPage, rtn)
      .pipe(
        tap(response => {
          this.consultas = response.data;
          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.currentPage = response.meta.page;
        }),
        catchError(error => {
          console.error('Error al cargar consultas:', error);
          this.error = 'Error al cargar las consultas guardadas. Por favor, inténtelo de nuevo.';
          this.toastr.error(this.error);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  search(): void {
    this.currentPage = 1;
    this.loadConsultas(this.currentPage);
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.currentPage = 1;
    this.loadConsultas(this.currentPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadConsultas(this.currentPage);
  }

  getPaginationArray(): Array<number | string> {
    const pages: Array<number | string> = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // If current page is close to start
      if (this.currentPage <= 3) {
        pages.push(2, 3, '...', this.totalPages);
      } 
      // If current page is close to end
      else if (this.currentPage >= this.totalPages - 2) {
        pages.push('...', this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } 
      // If current page is in the middle
      else {
        pages.push('...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
      }
    }
    
    return pages;
  }

  // Helper method to format date for display
  formatDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString('es-HN')} ${dateObj.toLocaleTimeString('es-HN', {hour: '2-digit', minute:'2-digit'})}`;
  }
}