import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./mis-consultas-vb-list/mis-consultas-vb-list.component')
      .then(m => m.MisConsultasVbListComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./mis-consultas-vb-detalle/mis-consultas-vb-detalle.component')
      .then(m => m.MisConsultasVbDetalleComponent),
    canActivate: [authGuard]
  }
] as Routes;