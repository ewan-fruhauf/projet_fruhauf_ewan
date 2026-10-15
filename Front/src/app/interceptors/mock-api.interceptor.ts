import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Intercepteur HTTP pour simuler (mocker) l'API backend d'inscription.
 * 
 * Permet de faire fonctionner l'ensemble de la chaîne HttpClient et Observables
 * sans avoir besoin d'un serveur backend réel actif en arrière-plan.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const isMockEnabled = (environment as any).mockApi !== false;

  // Intercepte les requêtes POST vers /signup si le mock est activé
  if (isMockEnabled && req.method === 'POST' && req.url.endsWith('/signup')) {
    const body = req.body as any;
    console.log('[Mock API Interceptor] Requête d\'inscription capturée :', body);

    // Cas de test d'erreur : si le login ou l'email vaut 'error', on simule un échec HTTP 409
    if (body?.login === 'error' || body?.email === 'error@test.com') {
      const errorResponse = new HttpErrorResponse({
        error: { message: "Cet identifiant est déjà utilisé (Simulation d'erreur HTTP 409)" },
        status: 409,
        statusText: 'Conflict',
        url: req.url
      });
      return throwError(() => errorResponse).pipe(delay(300));
    }

    // Cas nominal : Simulation d'un retour API 201 Created réussi
    const successResponse = new HttpResponse({
      status: 201,
      statusText: 'Created',
      body: {
        success: true,
        message: 'Inscription enregistrée avec succès via l\'API mockée',
        user: {
          id: Math.floor(Math.random() * 9000) + 1000,
          login: body?.login,
          email: body?.email,
          nom: body?.nom,
          prenom: body?.prenom,
          createdAt: new Date().toISOString()
        }
      }
    });

    // Simule une latence réseau de 400ms pour observer le spinner de chargement
    return of(successResponse).pipe(delay(400));
  }

  // Laisse passer les autres requêtes vers le réseau réel
  return next(req);
};
