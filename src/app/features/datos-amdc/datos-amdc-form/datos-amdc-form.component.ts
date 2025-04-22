import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatosAMDCService } from '../../../core/services/datos-amdc.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-datos-amdc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {{ isEditing ? (isAdmin ? 'Editar' : 'Ver') : 'Nuevo' }} Registro AMDC
          </h2>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <form [formGroup]="datoForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="RTN" class="block text-sm font-medium text-gray-700">RTN</label>
                <input type="text" id="RTN" formControlName="RTN"
                  [readonly]="!isAdmin"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="datoForm.get('RTN')?.errors?.['required'] && datoForm.get('RTN')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El RTN es requerido
                </div>
              </div>

              <div>
                <label for="ICS" class="block text-sm font-medium text-gray-700">ICS</label>
                <input type="text" id="ICS" formControlName="ICS"
                  [readonly]="!isAdmin"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="datoForm.get('ICS')?.errors?.['required'] && datoForm.get('ICS')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El ICS es requerido
                </div>
              </div>

              <div>
                <label for="NOMBRE" class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="NOMBRE" formControlName="NOMBRE"
                  [readonly]="!isAdmin"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="datoForm.get('NOMBRE')?.errors?.['required'] && datoForm.get('NOMBRE')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El nombre es requerido
                </div>
              </div>

              <div>
                <label for="NOMBRE_COMERCIAL" class="block text-sm font-medium text-gray-700">Nombre Comercial</label>
                <input type="text" id="NOMBRE_COMERCIAL" formControlName="NOMBRE_COMERCIAL"
                  [readonly]="!isAdmin"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="datoForm.get('NOMBRE_COMERCIAL')?.errors?.['required'] && datoForm.get('NOMBRE_COMERCIAL')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El nombre comercial es requerido
                </div>
              </div>

              <div>
                <label for="ANIO" class="block text-sm font-medium text-gray-700">Año</label>
                <input type="number" id="ANIO" formControlName="ANIO"
                  [readonly]="!isAdmin"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="datoForm.get('ANIO')?.errors?.['required'] && datoForm.get('ANIO')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El año es requerido
                </div>
              </div>

              <div>
                <label for="CANTIDAD_DECLARADA" class="block text-sm font-medium text-gray-700">Cantidad Declarada</label>
                <input type="number" id="CANTIDAD_DECLARADA" formControlName="CANTIDAD_DECLARADA"
                  [readonly]="!isAdmin"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="datoForm.get('CANTIDAD_DECLARADA')?.errors?.['required'] && datoForm.get('CANTIDAD_DECLARADA')?.touched"
                  class="text-red-500 text-sm mt-1">
                  La cantidad declarada es requerida
                </div>
              </div>

              <div>
                <label for="ESTATUS" class="block text-sm font-medium text-gray-700">Estatus</label>
                <select id="ESTATUS" formControlName="ESTATUS"
                  [disabled]="!isAdmin"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option [value]="1">Activo</option>
                  <option [value]="0">Inactivo</option>
                </select>
              </div>

              <div>
                <label for="FECHA" class="block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" id="FECHA" formControlName="FECHA"
                  [readonly]="!isAdmin"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="datoForm.get('FECHA')?.errors?.['required'] && datoForm.get('FECHA')?.touched"
                  class="text-red-500 text-sm mt-1">
                  La fecha es requerida
                </div>
              </div>
            </div>

            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button *ngIf="isAdmin" type="submit"
                [disabled]="!datoForm.valid"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50">
                {{ isEditing ? 'Actualizar' : 'Crear' }}
              </button>
              <button type="button"
                (click)="onCancel()"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                {{ isAdmin ? 'Cancelar' : 'Volver' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `
})
export class DatosAMDCFormComponent implements OnInit {
  datoForm: FormGroup;
  isEditing = false;
  datoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private datosAMDCService: DatosAMDCService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.datoForm = this.fb.group({
      RTN: ['', [Validators.required]],
      ICS: ['', [Validators.required]],
      NOMBRE: ['', [Validators.required]],
      NOMBRE_COMERCIAL: ['', [Validators.required]],
      ANIO: ['', [Validators.required]],
      CANTIDAD_DECLARADA: ['', [Validators.required]],
      ESTATUS: [1, [Validators.required]],
      FECHA: ['', [Validators.required]]
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  ngOnInit(): void {
    this.datoId = this.route.snapshot.paramMap.get('id');
    if (this.datoId) {
      this.isEditing = true;
      this.loadDato(this.datoId);
    }

    if (!this.isAdmin) {
      this.datoForm.disable();
    }
  }

  loadDato(id: string): void {
    this.datosAMDCService.getDatoAMDC(id).subscribe({
      next: (dato) => {
        this.datoForm.patchValue({
          ...dato,
          FECHA: dato.FECHA.split('T')[0] // Format date for input
        });
      },
      error: (error) => {
        console.error('Error loading dato:', error);
        this.router.navigate(['/datos-amdc']);
      }
    });
  }

  onSubmit(): void {
    if (this.datoForm.valid && this.isAdmin) {
      const datoData = this.datoForm.value;
      
      if (this.isEditing) {
        this.datosAMDCService.updateDatoAMDC(this.datoId!, datoData).subscribe({
          next: () => this.router.navigate(['/datos-amdc']),
          error: (error) => console.error('Error updating dato:', error)
        });
      } else {
        this.datosAMDCService.createDatoAMDC(datoData).subscribe({
          next: () => this.router.navigate(['/datos-amdc']),
          error: (error) => console.error('Error creating dato:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/datos-amdc']);
  }
}
