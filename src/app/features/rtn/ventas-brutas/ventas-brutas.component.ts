import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RtnService } from '../../../core/services/rtn.service';
import { VentasBrutasData } from '../../../core/interfaces/rtn.interface';
import { ToastrService } from 'ngx-toastr';

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
                <select id="periodoDesde" formControlName="periodoDesde"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  <option value="">Seleccione un periodo</option>
                  <optgroup *ngFor="let year of getYears()" [label]="year">
                    <option *ngFor="let periodo of periodosAgrupados[year]" [value]="periodo">
                      {{year}}-{{periodo.slice(4)}}
                    </option>
                  </optgroup>
                </select>
                <div *ngIf="searchForm.get('periodoDesde')?.errors?.['required'] && searchForm.get('periodoDesde')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El periodo inicial es requerido
                </div>
              </div>

              <div>
                <label for="periodoHasta" class="block text-sm font-medium text-gray-700">Periodo Hasta</label>
                <select id="periodoHasta" formControlName="periodoHasta"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  <option value="">Seleccione un periodo</option>
                  <optgroup *ngFor="let year of getYears()" [label]="year">
                    <option *ngFor="let periodo of periodosAgrupados[year]" [value]="periodo">
                      {{year}}-{{periodo.slice(4)}}
                    </option>
                  </optgroup>
                </select>
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

        <!-- Results -->
        <div *ngIf="ventasBrutas" class="mt-6">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Año</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ventasBrutas.anio}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Total de Ventas Brutas</dt>
                  <dd class="mt-1 text-sm text-gray-900">L. {{totalVentas | number:'1.2-2'}}</dd>
                </div>
              </dl>
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

  periodosAgrupados: { [key: string]: string[] } = {};

  constructor(
    private fb: FormBuilder,
    private rtnService: RtnService,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      rtn: ['', [Validators.required, Validators.pattern('^[0-9]{14}$')]],
      periodoDesde: ['', [Validators.required]],
      periodoHasta: ['', [Validators.required]]
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
  }

  get totalVentas(): number {
    return this.ventasBrutas?.importeTotalVentas || 0;
  }

  getYears(): string[] {
    return Object.keys(this.periodosAgrupados).sort();
  }

  resetForm(): void {
    this.searchForm.reset();
    this.ventasBrutas = null;
    this.error = null;
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.loading = true;
      this.error = null;
      this.ventasBrutas = null;

      const { rtn, periodoDesde, periodoHasta } = this.searchForm.value;
      
      // Convertir los períodos al formato requerido (YYYYMM)
      const periodoDesdeFormatted = periodoDesde.replace('-', '');
      const periodoHastaFormatted = periodoHasta.replace('-', '');

      this.rtnService.consultarVentasBrutas(rtn, periodoDesdeFormatted, periodoHastaFormatted).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.ventasBrutas = response.data.ventasBrutas;
            this.toastr.success('Consulta realizada con éxito');
          } else {
            this.toastr.warning(response.message || 'No se encontraron datos para los criterios especificados');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error consulting ventas brutas:', error);
          this.toastr.error(error.error?.message || 'Ocurrió un error al consultar las ventas brutas');
          this.loading = false;
        }
      });
    }
  }
}
