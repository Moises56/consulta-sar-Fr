import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RtnService } from '../../../core/services/rtn.service';
import { VentasBrutas } from '../../../core/interfaces/rtn.interface';

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
                <input type="month" id="periodoDesde" formControlName="periodoDesde"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="searchForm.get('periodoDesde')?.errors?.['required'] && searchForm.get('periodoDesde')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El periodo inicial es requerido
                </div>
              </div>

              <div>
                <label for="periodoHasta" class="block text-sm font-medium text-gray-700">Periodo Hasta</label>
                <input type="month" id="periodoHasta" formControlName="periodoHasta"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
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
                {{ loading ? 'Consultando...' : 'Consultar' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Error Message -->
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

        <!-- Results Table -->
        <div *ngIf="ventasBrutas.length > 0" class="mt-6">
          <div class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
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
                          Periodo
                        </th>
                        <th scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let venta of ventasBrutas">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{venta.rtn}}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{venta.periodo}}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{venta.monto | number:'1.2-2'}}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{venta.fecha | date:'shortDate'}}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="text-sm text-gray-900">
                <strong>Total de Ventas Brutas:</strong>
                {{totalVentas | number:'1.2-2'}}
              </div>
              <div class="text-sm text-gray-900 mt-2">
                <strong>Promedio Mensual:</strong>
                {{promedioMensual | number:'1.2-2'}}
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
  ventasBrutas: VentasBrutas[] = [];

  constructor(
    private fb: FormBuilder,
    private rtnService: RtnService
  ) {
    this.searchForm = this.fb.group({
      rtn: ['', [Validators.required, Validators.pattern('^[0-9]{14}$')]],
      periodoDesde: ['', [Validators.required]],
      periodoHasta: ['', [Validators.required]]
    });
  }

  get totalVentas(): number {
    return this.ventasBrutas.reduce((sum, venta) => sum + venta.monto, 0);
  }

  get promedioMensual(): number {
    if (this.ventasBrutas.length === 0) return 0;
    return this.totalVentas / this.ventasBrutas.length;
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.loading = true;
      this.error = null;
      this.ventasBrutas = [];

      const { rtn, periodoDesde, periodoHasta } = this.searchForm.value;

      this.rtnService.consultarVentasBrutas(rtn, periodoDesde, periodoHasta).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.ventasBrutas = response.data;
          } else {
            this.error = response.message || 'No se encontraron datos para los criterios especificados';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error consulting ventas brutas:', error);
          this.error = 'Ocurrió un error al consultar las ventas brutas. Por favor intente nuevamente.';
          this.loading = false;
        }
      });
    }
  }
}
