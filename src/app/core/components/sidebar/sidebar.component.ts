import { Component, EventEmitter, Input, Output, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex h-full flex-col bg-white shadow-lg transition-all duration-300 ease-in-out">
      <!-- Logo section -->
      <div class="flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <img 
            *ngIf="isOpen" 
            src="https://gestorimg.amdc.hn/uploads/1743178647837-488843555-logo2.webp" 
            alt="Logo" 
            class="h-8 w-8 flex-shrink-0"
          >

          <span 
            class="text-xl font-semibold text-gray-900 transition-all duration-300" 
            [class.opacity-0]="!isOpen"
            [class.w-0]="!isOpen"
          >ConsultaSAR</span>
        </div>

        <!-- Toggle button -->
        <button 
          class="p-2 rounded-lg hover:bg-gray-100 focus:outline-none" 
          (click)="toggleSidebar.emit()"
        >
          <svg
            class="w-6 h-6 text-gray-500 transition-transform duration-300"
            [class.transform]="!isOpen"
            [class.rotate-180]="!isOpen"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation section -->
      <div class="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <!-- Navigation links -->
        <!-- Dashboard -->
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-indigo-50 text-indigo-600"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span [class.opacity-0]="!isOpen" [class.w-0]="!isOpen" class="transition-opacity duration-300">Dashboard</span>
        </a>

        <!-- Usuarios (solo para admin) -->
        <a
          *ngIf="currentUser?.role === 'ADMIN'"
          routerLink="/usuarios"
          routerLinkActive="bg-indigo-50 text-indigo-600"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <span [class.opacity-0]="!isOpen" [class.w-0]="!isOpen" class="transition-opacity duration-300">Usuarios</span>
        </a>

        <!-- Datos AMDC -->
        <a
          routerLink="/datos-amdc"
          routerLinkActive="bg-indigo-50 text-indigo-600"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <span [class.opacity-0]="!isOpen" [class.w-0]="!isOpen" class="transition-opacity duration-300">Datos AMDC</span>
        </a>

        <!-- RTN -->
        <a
          routerLink="/rtn"
          routerLinkActive="bg-indigo-50 text-indigo-600"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span [class.opacity-0]="!isOpen" [class.w-0]="!isOpen" class="transition-opacity duration-300">RTN</span>
        </a>
        
        <!-- Mis Consultas VB -->
        <a
          routerLink="/mis-consultas-vb"
          routerLinkActive="bg-indigo-50 text-indigo-600"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
          <span [class.opacity-0]="!isOpen" [class.w-0]="!isOpen" class="transition-opacity duration-300">Mis Consultas VB</span>
        </a>

        <!-- Logs (solo para admin) -->
        <a
          *ngIf="currentUser?.role === 'ADMIN'"
          routerLink="/logs"
          routerLinkActive="bg-indigo-50 text-indigo-600"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span [class.opacity-0]="!isOpen" [class.w-0]="!isOpen" class="transition-opacity duration-300">Logs</span>
        </a>
      </div>

      <!-- User section -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span class="text-sm font-medium text-indigo-600">{{ currentUser?.name?.charAt(0) || 'U' }}</span>
          </div>
          <div class="flex-1 overflow-hidden transition-opacity duration-300" [class.opacity-0]="!isOpen" [class.w-0]="!isOpen">
            <p class="text-sm font-medium text-gray-900 truncate">{{ currentUser?.name || 'Usuario' }}</p>
            <p class="text-xs text-gray-500 truncate">{{ currentUser?.email }}</p>
          </div>
          <button
            (click)="logout()"
            class="rounded-lg bg-red-100 p-2 text-sm font-medium text-red-700 hover:bg-red-200 flex-shrink-0"
            [title]="'Cerrar Sesión'"
          >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            
          </button>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Input() isOpen = true;
  @Output() onLogout = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  isMobile = false;
  constructor(private authService: AuthService, private router: Router) {
    // Detectar si es dispositivo móvil al inicio
    this.checkScreenSize();

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // 768px es el breakpoint para tablets
  }

  logout() {
    // Llamar al servicio de autenticación para hacer logout
    this.authService.logout().subscribe({
      next: () => {
        // Emitir el evento de logout para que el componente padre maneje la navegación
        this.onLogout.emit();
      },
      error: (error) => {
        console.error('Error durante el cierre de sesión:', error);
        // Si hay un error en el cierre de sesión, emitimos el evento igualmente
        // para forzar la navegación al login y asegurar que el usuario salga
        this.onLogout.emit();
      }
    });
  }
}
