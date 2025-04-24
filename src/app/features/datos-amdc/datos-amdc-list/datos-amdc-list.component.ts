import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatosAMDCService } from '../../../core/services/datos-amdc.service';
import { DatosAMDC } from '../../../core/interfaces/datos-amdc.interface';

@Component({
  selector: 'app-datos-amdc-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 w-full">
      <header class="bg-white shadow w-full">
        <div class="w-full py-6 px-2 sm:px-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Datos AMDC
              </h2>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <a routerLink="new"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Nuevo Registro
              </a>
            </div>
          </div>
        </div>
      </header>

      <main class="w-full py-4 px-2 md:py-6 md:px-4">
        <!-- Filters -->
        <div class="bg-white px-3 py-4 md:px-4 md:py-5 md:rounded-lg shadow-sm">
          <form [formGroup]="filterForm" (ngSubmit)="onFilter()">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label for="rtn" class="block text-sm font-medium text-gray-700">RTN</label>
                <input type="text" id="rtn" formControlName="rtn"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              <div>
                <label for="nombreComercial" class="block text-sm font-medium text-gray-700">Nombre Comercial</label>
                <input type="text" id="nombreComercial" formControlName="nombreComercial"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              <div>
                <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="nombre" formControlName="nombre"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <button type="submit"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Filtrar
              </button>
            </div>
          </form>
        </div>

        <!-- Desktop Table - Visible only on medium screens and up -->
        <div class="hidden md:flex flex-col mt-6">
          <div class="-my-2 overflow-x-auto -mx-4">
            <div class="py-2 align-middle inline-block min-w-full px-4">
              <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RTN
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ICS
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre Comercial
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Año
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estatus
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let dato of datosAmdc">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ dato.RTN }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ dato.ICS }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ dato.NOMBRE_COMERCIAL }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ dato.NOMBRE }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ dato.ANIO }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ dato.CANTIDAD_DECLARADA | number:'1.2-2' }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ dato.ESTATUS }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a [routerLink]="[dato.id]" class="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <!-- Editar -->
                        </a>
                        <button (click)="deleteDatoAmdc(dato.id)" class="text-red-600 hover:text-red-900 inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <!-- Eliminar -->
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Card View - Visible only on small screens -->
        <div class="md:hidden mt-4 space-y-3">
          <div *ngFor="let dato of datosAmdc" class="bg-white shadow-sm w-full">
            <div class="px-4 py-3 bg-white flex justify-between items-center border-b">
              <h3 class="text-lg font-medium text-gray-900">
                {{ dato.NOMBRE_COMERCIAL }}
              </h3>
            </div>
            <div class="px-4 py-2">
              <dl>
                <div class="py-2 flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">RTN</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ dato.RTN }}</dd>
                </div>
                <div class="py-2 flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ dato.NOMBRE }}</dd>
                </div>
              </dl>
            </div>
            <div class="px-4 py-3 bg-gray-50 flex gap-4">
              <button (click)="openModal(dato)" class="text-sm text-blue-600 hover:text-blue-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Ver -->
              </button>
              <a [routerLink]="[dato.id]" class="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <!-- Editar -->
              </a>
              <button (click)="deleteDatoAmdc(dato.id)" class="text-sm text-red-600 hover:text-red-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <!-- Eliminar -->
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 mt-4 md:mt-6 md:rounded-lg">
          <div class="flex-1 flex justify-between sm:hidden">
            <button (click)="previousPage()" [disabled]="currentPage === 1"
              class="relative inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="sr-only">Anterior</span>
            </button>
            <button (click)="nextPage()" [disabled]="!hasNextPage"
              class="ml-3 relative inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <span class="sr-only">Siguiente</span>
              <!-- <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg> -->
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando <span class="font-medium">{{(currentPage - 1) * pageSize + 1}}</span> a
                <span class="font-medium">{{Math.min(currentPage * pageSize, totalItems)}}</span> de
                <span class="font-medium">{{totalItems}}</span> resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button (click)="previousPage()" [disabled]="currentPage === 1"
                  class="relative inline-flex justify-center items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 min-w-[40px]">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="sr-only">Anterior</span>
                </button>
                <button (click)="nextPage()" [disabled]="!hasNextPage"
                  class="relative inline-flex justify-center items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 min-w-[40px]">
                  <span class="sr-only">Siguiente</span>
                  <!-- <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg> -->
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal for Mobile View - Improved design -->
    <div *ngIf="isModalOpen" class="fixed inset-0 overflow-y-auto z-50 md:hidden">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" (click)="closeModal()">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="bg-gray-100 rounded-lg shadow-xl w-full max-w-sm relative z-10">
          <!-- Top bar with title -->
          <div class="px-4 py-3 bg-white rounded-t-lg">
            <div class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <h3 class="mt-1 text-center text-lg font-medium text-gray-700">
              Nombre Comercial
            </h3>
          </div>
          
          <!-- Content -->
          <div class="px-4 py-3">
            <h4 class="text-center text-xl font-medium text-gray-800 mb-4">
              {{ selectedDato?.NOMBRE_COMERCIAL }}
            </h4>
            
            <div class="flex flex-col space-y-1 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">RTN</p>
              <p class="text-center text-gray-700">{{ selectedDato?.RTN }}</p>
            </div>

            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">Nombre</p>
              <p class="text-center text-gray-700">{{ selectedDato?.NOMBRE }}</p>
            </div>
            
            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">ICS</p>
              <p class="text-center text-gray-700">{{ selectedDato?.ICS }}</p>
            </div>
            
            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">Año</p>
              <p class="text-center text-gray-700">{{ selectedDato?.ANIO }}</p>
            </div>
            
            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">Cantidad Declarada</p>
              <p class="text-center text-gray-700">{{ selectedDato?.CANTIDAD_DECLARADA | number:'1.2-2' }}</p>
            </div>

            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">Estatus</p>
              <p class="text-center text-gray-700">{{ selectedDato?.ESTATUS }}</p>
            </div>

            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">Fecha</p>
              <p class="text-center text-gray-700">{{ selectedDato?.FECHA | date:'dd/MM/yyyy' }}</p>
            </div>

            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">Creado en</p>
              <p class="text-center text-gray-700">{{ selectedDato?.createdAt | date:'dd/MM/yyyy' }}</p>
            </div>

            <div class="flex flex-col space-y-1 border-t border-gray-200 pt-3 mb-4">
              <p class="text-center text-sm text-gray-800 font-medium">Última actualización</p>
              <p class="text-center text-gray-700">{{ selectedDato?.updatedAt | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>
          
          <!-- Bottom button -->
          <div class="border-t border-gray-200">
            <div class="flex justify-center p-2">
              <button (click)="closeModal()" class="w-full py-3 px-4 bg-white text-indigo-600 font-medium rounded-md">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DatosAmdcListComponent implements OnInit {
  datosAmdc: DatosAMDC[] = [];
  filterForm: FormGroup;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  hasNextPage = false;
  Math = Math; // Make Math available in template
  
  // Modal variables
  isModalOpen = false;
  selectedDato: DatosAMDC | null = null;

  constructor(
    private datosAmdcService: DatosAMDCService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      rtn: [''],
      nombreComercial: [''],
      nombre: ['']
    });
  }

  ngOnInit(): void {
    this.loadDatosAmdc();
  }

  loadDatosAmdc(): void {
    // Crear objeto de filtros mapeando los nombres de campos correctamente
    const filters: any = {};
    if (this.filterForm.value.rtn) {
      filters.RTN = this.filterForm.value.rtn;
    }
    if (this.filterForm.value.nombreComercial) {
      filters.NOMBRE_COMERCIAL = this.filterForm.value.nombreComercial;
    }
    if (this.filterForm.value.nombre) {
      filters.NOMBRE = this.filterForm.value.nombre;
    }

    // Llamar al servicio con los parámetros separados para page y limit
    this.datosAmdcService.getDatosAMDC(filters, this.currentPage, this.pageSize).subscribe({
      next: (response: { data: DatosAMDC[], meta: { total: number, page: number, limit: number } }) => {
        this.datosAmdc = response.data;
        this.totalItems = response.meta.total;
        this.hasNextPage = this.currentPage * this.pageSize < this.totalItems;
      },
      error: (error: any) => {
        console.error('Error loading datos-amdc:', error);
        // Here you would typically show an error message
      }
    });
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadDatosAmdc();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDatosAmdc();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadDatosAmdc();
    }
  }

  deleteDatoAmdc(id: string): void {
    if (confirm('¿Está seguro que desea eliminar este registro?')) {
      this.datosAmdcService.deleteDatoAMDC(id).subscribe({
        next: () => {
          this.loadDatosAmdc();
        },
        error: (error: any) => {
          console.error('Error deleting dato-amdc:', error);
          // Here you would typically show an error message
        }
      });
    }
  }

  // Modal functions
  openModal(dato: DatosAMDC): void {
    this.selectedDato = dato;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedDato = null;
  }
}
