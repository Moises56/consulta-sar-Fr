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
        <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
          <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
            <div class="flex flex-col md:flex-row gap-4 items-end">
              <div class="flex-grow">
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
              <div class="flex gap-4">
                <button type="submit"
                  [disabled]="!searchForm.valid || loading"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                  {{ loading ? 'Consultando...' : 'Consultar' }}
                </button>
                <a routerLink="ventas-brutas"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Consultar Ventas Brutas
                </a>
              </div>
            </div>
          </form>
        </div>

        <!-- Results -->
        <div *ngIf="error" class="mt-6">
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <!-- Heroicon name: solid/x-circle -->
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error en la consulta</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{error}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="obligadoTributario" class="mt-6">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Información del Contribuyente
              </h3>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">RTN</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{obligadoTributario.rtn}}</dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{obligadoTributario.nombre}}</dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Nombre Comercial</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{obligadoTributario.nombreComercial || 'No disponible'}}</dd>
                </div>
                <div *ngIf="obligadoTributario.direccion" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Dirección</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{obligadoTributario.direccion}}</dd>
                </div>
                <div *ngIf="obligadoTributario.telefono" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{obligadoTributario.telefono}}</dd>
                </div>
                <div *ngIf="obligadoTributario.email" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{obligadoTributario.email}}</dd>
                </div>
              </dl>
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
      this.loading = true;
      this.error = null;
      this.obligadoTributario = null;

      this.rtnService.consultarRtn(this.searchForm.get('rtn')?.value).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.obligadoTributario = response.data.obligadoTributario;
            this.toastr.success('Consulta realizada con éxito');
          } else {
            this.toastr.warning(response.message || 'No se encontró información para el RTN proporcionado');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error consulting RTN:', error);
          this.toastr.error(error.error?.message || 'Ocurrió un error al consultar el RTN');
          this.loading = false;
        }
      });
    } else {
      // Mostrar errores de validación
      if (this.searchForm.get('rtn')?.errors?.['pattern']) {
        this.toastr.error('El RTN debe tener 14 dígitos');
      }
    }
  }
}
