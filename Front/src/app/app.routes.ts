import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Configuration des routes avec Lazy Loading (loadComponent) et protection par Guard (TP 05)
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pollutions',
    pathMatch: 'full'
  },
  {
    path: 'pollutions',
    loadComponent: () =>
      import('./pollution-list/pollution-list.component').then(m => m.PollutionListComponent),
    title: 'Observatoire des Pollutions — Liste'
  },
  {
    path: 'pollutions/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pollution-form/pollution-form.component').then(m => m.PollutionFormComponent),
    title: 'Déclarer un signalement de pollution'
  },
  {
    path: 'pollutions/:id',
    loadComponent: () =>
      import('./pollution-detail/pollution-detail.component').then(m => m.PollutionDetailComponent),
    title: 'Détail de la pollution'
  },
  {
    path: 'pollutions/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pollution-form/pollution-form.component').then(m => m.PollutionFormComponent),
    title: 'Modifier un signalement de pollution'
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./user-list/user-list.component').then(m => m.UserListComponent),
    title: 'Gestion des Utilisateurs & Agents'
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./client-signup/client-signup.component').then(m => m.ClientSignupComponent),
    title: 'Connexion & Inscription Agent'
  },
  {
    path: '**',
    redirectTo: 'pollutions'
  }
];
