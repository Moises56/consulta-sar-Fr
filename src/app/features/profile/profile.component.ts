import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/interfaces/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Mi Perfil
          </h2>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div class="md:grid md:grid-cols-3 md:gap-6">
            <div class="md:col-span-1">
              <h3 class="text-lg font-medium leading-6 text-gray-900">Información Personal</h3>
              <p class="mt-1 text-sm text-gray-500">
                Actualiza tu información personal y contraseña.
              </p>
            </div>
            <div class="mt-5 md:mt-0 md:col-span-2">
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
                    <input type="text" id="username" formControlName="username"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      readonly>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" formControlName="email"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <div *ngIf="profileForm.get('email')?.errors?.['required'] && profileForm.get('email')?.touched"
                      class="text-red-500 text-sm mt-1">
                      El email es requerido
                    </div>
                    <div *ngIf="profileForm.get('email')?.errors?.['email'] && profileForm.get('email')?.touched"
                      class="text-red-500 text-sm mt-1">
                      El email no es válido
                    </div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <input type="text" id="name" formControlName="name"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <div *ngIf="profileForm.get('name')?.errors?.['required'] && profileForm.get('name')?.touched"
                      class="text-red-500 text-sm mt-1">
                      El nombre es requerido
                    </div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="identidad" class="block text-sm font-medium text-gray-700">Identidad</label>
                    <input type="text" id="identidad" formControlName="identidad"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <div *ngIf="profileForm.get('identidad')?.errors?.['required'] && profileForm.get('identidad')?.touched"
                      class="text-red-500 text-sm mt-1">
                      La identidad es requerida
                    </div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="Nempleado" class="block text-sm font-medium text-gray-700">Número de Empleado</label>
                    <input type="text" id="Nempleado" formControlName="Nempleado"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <div *ngIf="profileForm.get('Nempleado')?.errors?.['required'] && profileForm.get('Nempleado')?.touched"
                      class="text-red-500 text-sm mt-1">
                      El número de empleado es requerido
                    </div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="gerencia" class="block text-sm font-medium text-gray-700">Gerencia</label>
                    <input type="text" id="gerencia" formControlName="gerencia"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <div *ngIf="profileForm.get('gerencia')?.errors?.['required'] && profileForm.get('gerencia')?.touched"
                      class="text-red-500 text-sm mt-1">
                      La gerencia es requerida
                    </div>
                  </div>

                  <div class="col-span-6">
                    <label for="currentPassword" class="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                    <input type="password" id="currentPassword" formControlName="currentPassword"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="newPassword" class="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                    <input type="password" id="newPassword" formControlName="newPassword"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <div *ngIf="profileForm.get('newPassword')?.errors?.['minlength'] && profileForm.get('newPassword')?.touched"
                      class="text-red-500 text-sm mt-1">
                      La contraseña debe tener al menos 6 caracteres
                    </div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                    <input type="password" id="confirmPassword" formControlName="confirmPassword"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <div *ngIf="profileForm.errors?.['passwordMismatch'] && profileForm.get('confirmPassword')?.touched"
                      class="text-red-500 text-sm mt-1">
                      Las contraseñas no coinciden
                    </div>
                  </div>
                </div>

                <div class="mt-5 flex justify-end gap-3">
                  <button type="button" (click)="onCancel()"
                    class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancelar
                  </button>
                  <button type="submit"
                    [disabled]="!profileForm.valid || loading"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mt-6">
          <div class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <!-- Heroicon name: solid/check-circle -->
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800">
                  {{successMessage}}
                </p>
              </div>
            </div>
          </div>
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
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{error}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      identidad: ['', [Validators.required]],
      Nempleado: ['', [Validators.required]],
      gerencia: ['', [Validators.required]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (this.currentUser) {
      this.profileForm.patchValue({
        username: this.currentUser.username,
        email: this.currentUser.email,
        name: this.currentUser.name,
        identidad: this.currentUser.identidad,
        Nempleado: this.currentUser.Nempleado,
        gerencia: this.currentUser.gerencia
      });
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      // Verificar si el usuario está intentando cambiar su contraseña
      const currentPassword = this.profileForm.get('currentPassword')?.value;
      const newPassword = this.profileForm.get('newPassword')?.value;

      // Si el usuario está cambiando su contraseña
      if (currentPassword && newPassword) {
        this.authService.changeOwnPassword(currentPassword, newPassword).subscribe({
          next: () => {
            this.loading = false;
            this.successMessage = 'Contraseña actualizada exitosamente';
            this.profileForm.get('currentPassword')?.reset();
            this.profileForm.get('newPassword')?.reset();
            this.profileForm.get('confirmPassword')?.reset();
          },
          error: () => {
            this.loading = false;
            // Los mensajes de error los maneja el servicio AuthService
          }
        });
        return;
      }

      const updateData = {
        ...this.profileForm.value,
        id: this.currentUser.id
      };

      // Eliminar campos de contraseña del objeto de actualización de datos de perfil
      delete updateData.currentPassword;
      delete updateData.newPassword;
      delete updateData.confirmPassword;

      this.userService.updateUser(this.currentUser.id, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Perfil actualizado exitosamente';

          // Update the current user in auth service
          // Check auth status to refresh user data
          this.authService.checkAuthStatus();
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al actualizar el perfil';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
