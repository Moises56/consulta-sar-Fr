import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DATOS_AMDC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./datos-amdc-list/datos-amdc-list.component').then(m => m.DatosAMDCListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'new',
    loadComponent: () => import('./datos-amdc-form/datos-amdc-form.component').then(m => m.DatosAMDCFormComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: ':id',
    loadComponent: () => import('./datos-amdc-form/datos-amdc-form.component').then(m => m.DatosAMDCFormComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  }
];
