import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'new',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: ':id',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: ':id/password',
    loadComponent: () => import('./user-password/user-password.component').then(m => m.UserPasswordComponent),
    canActivate: [authGuard]
  }
];
