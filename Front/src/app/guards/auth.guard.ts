import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard de sécurité (TP 05) :
 * Vérifie qu'un utilisateur est connecté avant d'autoriser l'accès aux pages protégées
 * (création/modification de pollution et gestion des utilisateurs).
 * Si aucun utilisateur n'est connecté, redirige proprement vers /signup.
 */
export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/signup'], {
    queryParams: { authRequired: 'true' }
  });
};

