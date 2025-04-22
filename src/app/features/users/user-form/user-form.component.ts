import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h2>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" formControlName="email"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="userForm.get('email')?.errors?.['required'] && userForm.get('email')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El email es requerido
                </div>
                <div *ngIf="userForm.get('email')?.errors?.['email'] && userForm.get('email')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El email no es válido
                </div>
              </div>

              <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
                <input type="text" id="username" formControlName="username"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="userForm.get('username')?.errors?.['required'] && userForm.get('username')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El usuario es requerido
                </div>
              </div>

              <div *ngIf="!isEditing">
                <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" id="password" formControlName="password"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="userForm.get('password')?.errors?.['required'] && userForm.get('password')?.touched"
                  class="text-red-500 text-sm mt-1">
                  La contraseña es requerida
                </div>
              </div>

              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input type="text" id="name" formControlName="name"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="userForm.get('name')?.errors?.['required'] && userForm.get('name')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El nombre es requerido
                </div>
              </div>

              <div>
                <label for="identidad" class="block text-sm font-medium text-gray-700">Identidad</label>
                <input type="text" id="identidad" formControlName="identidad"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="userForm.get('identidad')?.errors?.['required'] && userForm.get('identidad')?.touched"
                  class="text-red-500 text-sm mt-1">
                  La identidad es requerida
                </div>
              </div>

              <div>
                <label for="Nempleado" class="block text-sm font-medium text-gray-700">No. Empleado</label>
                <input type="text" id="Nempleado" formControlName="Nempleado"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="userForm.get('Nempleado')?.errors?.['required'] && userForm.get('Nempleado')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El número de empleado es requerido
                </div>
              </div>

              <div>
                <label for="gerencia" class="block text-sm font-medium text-gray-700">Gerencia</label>
                <input type="text" id="gerencia" formControlName="gerencia"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                <div *ngIf="userForm.get('gerencia')?.errors?.['required'] && userForm.get('gerencia')?.touched"
                  class="text-red-500 text-sm mt-1">
                  La gerencia es requerida
                </div>
              </div>

              <div>
                <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
                <select id="role" formControlName="role"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="ADMIN">Administrador</option>
                  <option value="OPERADOR">Operador</option>
                </select>
                <div *ngIf="userForm.get('role')?.errors?.['required'] && userForm.get('role')?.touched"
                  class="text-red-500 text-sm mt-1">
                  El rol es requerido
                </div>
              </div>
            </div>

            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button type="submit"
                [disabled]="!userForm.valid"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50">
                {{ isEditing ? 'Actualizar' : 'Crear' }}
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
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditing = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      name: ['', [Validators.required]],
      identidad: ['', [Validators.required]],
      Nempleado: ['', [Validators.required]],
      gerencia: ['', [Validators.required]],
      role: ['OPERADOR', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditing = true;
      this.userForm.get('password')?.removeValidators(Validators.required);
      this.loadUser(this.userId);
    }
  }

  loadUser(id: string): void {
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          username: user.username,
          name: user.name,
          identidad: user.identidad,
          Nempleado: user.Nempleado,
          gerencia: user.gerencia,
          role: user.role
        });
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.router.navigate(['/usuarios']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.isEditing) {
        delete userData.password;
        this.userService.updateUser(this.userId!, userData).subscribe({
          next: () => this.router.navigate(['/usuarios']),
          error: (error) => console.error('Error updating user:', error)
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: () => this.router.navigate(['/usuarios']),
          error: (error) => console.error('Error creating user:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }
}
