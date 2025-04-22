import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const RTN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rtn-consulta/rtn-consulta.component').then(m => m.RtnConsultaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ventas-brutas',
    loadComponent: () => import('./ventas-brutas/ventas-brutas.component').then(m => m.VentasBrutasComponent),
    canActivate: [authGuard]
  }
];
