import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { User } from './core/interfaces/user.interface';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <!-- Layout for non-authenticated users -->
    <div *ngIf="!currentUser" class="min-h-screen bg-gray-50">
      <router-outlet />
    </div>

    <!-- Layout for authenticated users -->
    <div *ngIf="currentUser" class="min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside 
        class="fixed inset-y-0 left-0 z-50 transition-all duration-300"
        [class.w-64]="isSidebarOpen"
        [class.w-20]="!isSidebarOpen"
      >
        <app-sidebar 
          [currentUser]="currentUser"
          [isOpen]="isSidebarOpen"
          (toggleSidebar)="toggleSidebar()"
          (onLogout)="handleLogout()"
          class="h-full"
        />
      </aside>

      <!-- Main content -->
      <main 
        class="transition-all duration-300 ease-in-out p-6"
        [class.ml-64]="isSidebarOpen"
        [class.ml-20]="!isSidebarOpen"
      >
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen = true;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Detectar si es dispositivo móvil al inicio
      this.checkScreenSize();

      // Escuchar cambios en el tamaño de la ventana
      window.addEventListener('resize', () => {
        this.checkScreenSize();
      });
    }
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    if (isPlatformBrowser(this.platformId)) {
      // Observar cambios en el breakpoint
      this.breakpointObserver.observe([Breakpoints.Handset])
        .subscribe((result: BreakpointState) => {
          this.isMobile = result.matches;
          this.isSidebarOpen = !this.isMobile;
        });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  handleLogout() {
    // El logout ya se maneja en el sidebar, aquí solo navegamos
    this.router.navigate(['/auth/login']);
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // 768px es el breakpoint para tablets
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }
}
