import { Routes } from '@angular/router';
import { PollutionListComponent } from './pollution-list/pollution-list.component';
import { PollutionDetailComponent } from './pollution-detail/pollution-detail.component';
import { PollutionFormComponent } from './pollution-form/pollution-form.component';
import { ClientSignupComponent } from './client-signup/client-signup.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pollutions',
    pathMatch: 'full'
  },
  {
    path: 'pollutions',
    component: PollutionListComponent,
    title: 'Observatoire des Pollutions — Liste'
  },
  {
    path: 'pollutions/new',
    component: PollutionFormComponent,
    title: 'Déclarer un signalement de pollution'
  },
  {
    path: 'pollutions/:id',
    component: PollutionDetailComponent,
    title: 'Détail de la pollution'
  },
  {
    path: 'pollutions/:id/edit',
    component: PollutionFormComponent,
    title: 'Modifier un signalement de pollution'
  },
  {
    path: 'signup',
    component: ClientSignupComponent,
    title: 'Inscription Agent Client'
  },
  {
    path: '**',
    redirectTo: 'pollutions'
  }
];
