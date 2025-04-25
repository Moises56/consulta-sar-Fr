import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- logo esta en logos/logo2.png -->
        <div>
          <img class="mx-auto h-12 w-auto" src="logos/logo2.png " alt="Logo">
        </div>
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="login" class="sr-only">Usuario o Email</label>
              <input id="login" name="login" type="text" formControlName="login" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Usuario o Email">
            </div>
            <div>
              <label for="password" class="sr-only">Contraseña</label>
              <input id="password" name="password" type="password" formControlName="password" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña">
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="!loginForm.valid"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#5ccedf] hover:bg-[#4ab8e0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Obtener el returnUrl de los parámetros de consulta si existe
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
        console.log('Return URL found:', this.returnUrl);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Redirigir a la URL de retorno o al dashboard por defecto
          console.log('Login successful, redirecting to:', this.returnUrl);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          console.error('Login error:', error);
          // Here you would typically show an error message to the user
        }
      });
    }
  }
}
