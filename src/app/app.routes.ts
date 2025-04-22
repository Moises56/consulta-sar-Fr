import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [publicGuard],
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'auth/login',
        canActivate: [publicGuard],
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        canActivate: [authGuard],
        data: { role: 'ADMIN' },
        loadChildren: () => import('./features/users/users.routes').then(m => m.USER_ROUTES)
      },
      {
        path: 'logs',
        loadComponent: () => import('./features/logs/log-list/log-list.component').then(m => m.LogListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'datos-amdc',
        loadChildren: () => import('./features/datos-amdc/datos-amdc.routes').then(m => m.DATOS_AMDC_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'rtn',
        loadChildren: () => import('./features/rtn/rtn.routes').then(m => m.RTN_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
