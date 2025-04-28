import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Cambiar Contraseña
          </h2>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
            <div class="space-y-6">
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <input type="password" id="password" formControlName="password"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="passwordForm.get('password')?.errors?.['required'] && passwordForm.get('password')?.touched"
                  class="text-red-500 text-sm mt-1">
                  La contraseña es requerida
                </div>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input type="password" id="confirmPassword" formControlName="confirmPassword"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmPassword')?.touched"
                  class="text-red-500 text-sm mt-1">
                  Las contraseñas no coinciden
                </div>
              </div>
            </div>

            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button type="submit"
                [disabled]="!passwordForm.valid"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50">
                Cambiar Contraseña
              </button>
              <button type="button"
                (click)="onCancel()"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `
})
export class UserPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (!this.userId) {
      this.router.navigate(['/usuarios']);
      return;
    }

    // Check if user has permission to change this password
    if (this.userId !== this.authService.currentUser?.id && !this.authService.isAdmin) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'passwordMismatch': true };
  }

  onSubmit(): void {
    if (this.passwordForm.valid && this.userId) {
      this.userService.changePassword(this.userId, this.passwordForm.get('password')?.value).subscribe({
        next: (response) => {
          // Mostrar mensaje de éxito si lo hay
          if (response && response.message) {
            this.toastr.success(response.message);
          } else {
            this.toastr.success('Contraseña actualizada exitosamente');
          }
          
          // Redirect to appropriate page based on user role and if changing own password
          if (this.userId === this.authService.currentUser?.id) {
            this.router.navigate(['/perfil']);
          } else {
            this.router.navigate(['/usuarios']);
          }
        },
        error: (error) => {
          console.error('Error changing password:', error);
          // Mostrar mensaje de error
          if (error.error && error.error.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error('Error al cambiar la contraseña');
          }
        }
      });
    }
  }

  onCancel(): void {
    if (this.userId === this.authService.currentUser?.id) {
      this.router.navigate(['/perfil']);
    } else {
      this.router.navigate(['/usuarios']);
    }
  }
}
