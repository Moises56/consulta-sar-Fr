import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LogService, Log } from '../../../core/services/log.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 w-full">
      <header class="bg-white shadow w-full">
        <div class="w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Registro de Actividades
          </h2>
        </div>
      </header>

      <main class="w-full mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Filters -->
        <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <form [formGroup]="filterForm" (ngSubmit)="onFilter()">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label for="action" class="block text-sm font-medium text-gray-700">Acción</label>
                <select id="action" formControlName="action"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">Todas</option>
                  <option value="LOGIN">Inicio de Sesión</option>
                  <option value="LOGOUT">Cierre de Sesión</option>
                  <option value="CREATE">Creación</option>
                  <option value="READ">Consulta</option>
                  <option value="UPDATE">Actualización</option>
                  <option value="DELETE">Eliminación</option>
                </select>
              </div>

              <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                <input type="date" id="startDate" formControlName="startDate"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>

              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700">Fecha Fin</label>
                <input type="date" id="endDate" formControlName="endDate"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>

              <div class="flex items-end">
                <button type="submit"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
                  Filtrar
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Desktop Logs Table - Visible only on medium screens and up -->
        <div class="hidden md:flex flex-col mt-6">
          <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Correo
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalles
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let log of logs" class="bg-white hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ log.createdAt | date:'medium' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ log.user.name }}</div>
                        <div class="text-sm text-gray-500">{{ log.user.username }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ log.user.email }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': log.action === 'LOGIN',
                            'bg-red-100 text-red-800': log.action === 'LOGOUT',
                            'bg-blue-100 text-blue-800': log.action === 'CREATE',
                            'bg-yellow-100 text-yellow-800': log.action === 'UPDATE',
                            'bg-purple-100 text-purple-800': log.action === 'READ',
                            'bg-gray-100 text-gray-800': log.action === 'DELETE'
                          }">
                          {{ log.action }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {{ log.details }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button (click)="openModal(log)" class="text-blue-600 hover:text-blue-900 inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver
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
        <div class="md:hidden mt-6 space-y-4">
          <div *ngFor="let log of logs" class="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div class="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 class="text-base font-medium text-gray-900">{{ log.user.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ log.createdAt | date:'short' }}</p>
              </div>
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                [ngClass]="{
                  'bg-green-100 text-green-800': log.action === 'LOGIN',
                  'bg-red-100 text-red-800': log.action === 'LOGOUT',
                  'bg-blue-100 text-blue-800': log.action === 'CREATE',
                  'bg-yellow-100 text-yellow-800': log.action === 'UPDATE',
                  'bg-purple-100 text-purple-800': log.action === 'READ',
                  'bg-gray-100 text-gray-800': log.action === 'DELETE'
                }">
                {{ log.action }}
              </span>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-3 sm:py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Usuario</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ log.user.username }}</dd>
                </div>
                <div class="py-3 sm:py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Correo</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ log.user.email }}</dd>
                </div>
                <div class="py-3 sm:py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Detalles</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ log.details }}</dd>
                </div>
              </dl>
            </div>
            <div class="border-t border-gray-200 flex justify-center bg-gray-50">
              <button (click)="openModal(log)" class="text-sm text-blue-600 hover:text-blue-900 flex items-center py-3 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Más
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg mt-6">
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
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
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
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal para ver detalles completos -->
    <div *ngIf="isModalOpen" class="fixed inset-0 overflow-y-auto z-50">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" (click)="closeModal()">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                Detalles del Registro
              </h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="px-6 py-4">
            <div class="mb-4">
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                [ngClass]="{
                  'bg-green-100 text-green-800': selectedLog?.action === 'LOGIN',
                  'bg-red-100 text-red-800': selectedLog?.action === 'LOGOUT',
                  'bg-blue-100 text-blue-800': selectedLog?.action === 'CREATE',
                  'bg-yellow-100 text-yellow-800': selectedLog?.action === 'UPDATE',
                  'bg-purple-100 text-purple-800': selectedLog?.action === 'READ',
                  'bg-gray-100 text-gray-800': selectedLog?.action === 'DELETE'
                }">
                {{ selectedLog?.action }}
              </span>
            </div>
            
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Fecha y hora</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ selectedLog?.createdAt | date:'medium' }}</dd>
              </div>
              
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Usuario</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ selectedLog?.user?.name }} ({{ selectedLog?.user?.username }})</dd>
              </div>
              
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Correo</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ selectedLog?.user?.email }}</dd>
              </div>
              
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Detalles</dt>
                <dd class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ selectedLog?.details }}</dd>
              </div>
            </dl>
          </div>
          
          <div class="px-6 py-3 bg-gray-50 text-right rounded-b-lg">
            <button (click)="closeModal()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LogListComponent implements OnInit {
  logs: Log[] = [];
  filterForm: FormGroup;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  hasNextPage = false;
  Math = Math; // Make Math available in template
  
  // Variables para el modal
  isModalOpen = false;
  selectedLog: Log | null = null;

  constructor(
    private logService: LogService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      action: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    const filters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize
    };

    // If not admin, only show own logs
    if (!this.authService.isAdmin) {
      filters.userId = this.authService.currentUser?.id;
    }

    this.logService.getLogs(filters).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.totalItems = response.meta.total;
        this.hasNextPage = this.currentPage * this.pageSize < this.totalItems;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        // Here you would typically show an error message
      }
    });
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadLogs();
    }
  }
  
  // Funciones para el modal
  openModal(log: Log): void {
    this.selectedLog = log;
    this.isModalOpen = true;
  }
  
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedLog = null;
  }
}
