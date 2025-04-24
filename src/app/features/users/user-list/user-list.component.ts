import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 w-full">
      <header class="bg-white shadow w-full">
        <div class="w-full py-6 px-2 sm:px-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Usuarios
              </h2>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <a routerLink="new"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Nuevo Usuario
              </a>
            </div>
          </div>
        </div>
      </header>

      <main class="w-full py-4 px-2 md:py-6 md:px-4">
        <!-- Filters -->
        <div class="bg-white px-3 py-4 md:px-4 md:py-5 md:rounded-lg shadow-sm">
          <form [formGroup]="filterForm" (ngSubmit)="onFilter()">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="text" id="email" formControlName="email"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
                <input type="text" id="username" formControlName="username"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              <div>
                <label for="Nempleado" class="block text-sm font-medium text-gray-700">No. Empleado</label>
                <input type="text" id="Nempleado" formControlName="Nempleado"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              <div>
                <label for="gerencia" class="block text-sm font-medium text-gray-700">Gerencia</label>
                <input type="text" id="gerencia" formControlName="gerencia"
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

        <!-- Desktop Users Table - Visible only on medium screens and up -->
        <div class="hidden md:flex flex-col mt-6">
          <div class="-my-2 overflow-x-auto -mx-4">
            <div class="py-2 align-middle inline-block min-w-full px-4">
              <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Empleado
                      </th>
                      <th scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let user of users">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{user.username}}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{user.email}}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{user.Nempleado}}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': user.role === 'ADMIN',
                            'bg-blue-100 text-blue-800': user.role === 'OPERADOR'
                          }">
                          {{user.role}}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a [routerLink]="[user.id]" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</a>
                        <a [routerLink]="[user.id, 'password']" class="text-yellow-600 hover:text-yellow-900 mr-4">Cambiar Contraseña</a>
                        <button (click)="deleteUser(user.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
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
          <div *ngFor="let user of users" class="bg-white shadow-sm w-full">
            <div class="px-4 py-3 bg-white flex justify-between items-center border-b">
              <h3 class="text-lg font-medium text-gray-900">
                {{user.username}}
              </h3>
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                [ngClass]="{
                  'bg-green-100 text-green-800': user.role === 'ADMIN',
                  'bg-blue-100 text-blue-800': user.role === 'OPERADOR'
                }">
                {{user.role}}
              </span>
            </div>
            <div class="px-4 py-2">
              <dl>
                <div class="py-2 flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{user.email}}</dd>
                </div>
                <div class="py-2 flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">No. Empleado</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{user.Nempleado || 'No asignado'}}</dd>
                </div>
                <div *ngIf="user.gerencia" class="py-2 flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Gerencia</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{user.gerencia}}</dd>
                </div>
              </dl>
            </div>
            <div class="px-4 py-3 bg-gray-50 flex flex-wrap gap-2">
              <a [routerLink]="[user.id]" class="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </a>
              <a [routerLink]="[user.id, 'password']" class="text-sm text-yellow-600 hover:text-yellow-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Cambiar Contraseña
              </a>
              <button (click)="deleteUser(user.id)" class="text-sm text-red-600 hover:text-red-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 mt-4 md:mt-6 md:rounded-lg">
          <div class="flex-1 flex justify-between sm:hidden">
            <button (click)="previousPage()" [disabled]="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button (click)="nextPage()" [disabled]="!hasNextPage"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
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
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Anterior</span>
                  <!-- Heroicon name: solid/chevron-left -->
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    aria-hidden="true">
                    <path fill-rule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
                <button (click)="nextPage()" [disabled]="!hasNextPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Siguiente</span>
                  <!-- Heroicon name: solid/chevron-right -->
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    aria-hidden="true">
                    <path fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filterForm: FormGroup;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  hasNextPage = false;
  Math = Math; // Make Math available in template

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      email: [''],
      username: [''],
      Nempleado: [''],
      gerencia: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const filters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize
    };

    this.usersService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalItems = response.meta.total;
        this.hasNextPage = this.currentPage * this.pageSize < this.totalItems;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Here you would typically show an error message
      }
    });
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  deleteUser(id: string): void {
    if (confirm('¿Está seguro que desea eliminar este usuario?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          // Here you would typically show an error message
        }
      });
    }
  }
}
