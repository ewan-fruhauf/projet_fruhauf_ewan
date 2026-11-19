import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { User } from '../models/user.model';
import { STORAGE_KEY, USERS_STORAGE_KEY, INITIAL_POLLUTIONS, INITIAL_USERS } from './mock-data';

// Helpers simples pour renvoyer une réponse HTTP simulée
function ok<T>(body: T, status = 200) {
  return of(new HttpResponse({ status, body })).pipe(delay(150));
}

function httpError(status: number, message: string, url: string) {
  return throwError(() => new HttpErrorResponse({ status, error: { message }, url })).pipe(delay(150));
}

// Récupère l'ID situé après le nom de la ressource (ex: "/api/pollutions/42" -> "42")
function getIdAfter(url: string, segment: string): string | null {
  const cleanUrl = url.split('?')[0];
  const parts = cleanUrl.split(`/${segment}/`);
  return parts.length > 1 && parts[1] ? parts[1] : null;
}

// Lecture et sauvegarde dans le localStorage du navigateur
function loadPollutions(): Pollution[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POLLUTIONS));
  return [...INITIAL_POLLUTIONS];
}

function savePollutions(data: Pollution[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadUsers(): User[] {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  return [...INITIAL_USERS];
}

function saveUsers(data: User[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
}

// Logique de simulation des routes /users et /pollutions
function simulateApi(req: HttpRequest<unknown>) {
  // --- 1. ROUTES UTILISATEURS (/api/users) ---
  if (req.url.includes('/users') || req.url.endsWith('/signup')) {
    const users = loadUsers();

    // POST /api/users/login : Connexion
    if (req.method === 'POST' && req.url.endsWith('/login')) {
      const body = req.body as any;
      const found = users.find(u => u.login === body?.login || u.email === body?.login);
      if (!found) {
        return httpError(401, 'Identifiants invalides (utilisateur non trouvé)', req.url);
      }
      return ok({ success: true, message: 'Authentification réussie', user: found });
    }

    // POST /api/users : Création d'un utilisateur
    if (req.method === 'POST') {
      const body = req.body as any;
      if (body?.login === 'error' || body?.email === 'error@test.com') {
        return httpError(409, 'Cet identifiant est déjà utilisé (Code 409 Conflict)', req.url);
      }
      if (users.some(u => u.login === body?.login)) {
        return httpError(409, `Le login "${body?.login}" est déjà pris.`, req.url);
      }

      const maxId = users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
      const newUser: User = {
        id: maxId + 1,
        login: body?.login,
        email: body?.email,
        nom: body?.nom,
        prenom: body?.prenom,
        role: body?.role || 'Agent de terrain',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);
      return ok({ success: true, message: 'Utilisateur créé avec succès', user: newUser }, 201);
    }

    // GET /api/users ou GET /api/users/:id
    if (req.method === 'GET') {
      const id = getIdAfter(req.url, 'users');
      if (!id) {
        return ok(users);
      }
      const found = users.find(u => String(u.id) === id);
      return found ? ok(found) : httpError(404, `Utilisateur #${id} introuvable`, req.url);
    }

    // DELETE /api/users/:id
    if (req.method === 'DELETE') {
      const id = getIdAfter(req.url, 'users');
      const remaining = users.filter(u => String(u.id) !== id);
      if (remaining.length === users.length) {
        return httpError(404, `Utilisateur #${id} introuvable`, req.url);
      }
      saveUsers(remaining);
      return ok({ success: true, message: `Utilisateur #${id} supprimé`, id });
    }
  }

  // --- 2. ROUTES POLLUTIONS (/api/pollutions) ---
  if (req.url.includes('/pollutions')) {
    const pollutions = loadPollutions();
    const id = getIdAfter(req.url, 'pollutions');

    // GET /api/pollutions ou GET /api/pollutions/:id
    if (req.method === 'GET') {
      if (!id) {
        return ok(pollutions);
      }
      const found = pollutions.find(p => String(p.id) === id);
      return found ? ok(found) : httpError(404, `Pollution #${id} introuvable`, req.url);
    }

    // POST /api/pollutions : Ajouter une pollution
    if (req.method === 'POST') {
      const body = req.body as Partial<Pollution>;
      const maxId = pollutions.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
      const newPollution: Pollution = {
        id: maxId + 1,
        titre: body.titre || 'Signalement sans titre',
        type: body.type || 'Autre',
        description: body.description || '',
        lieu: body.lieu || 'Non précisé',
        dateObservation: body.dateObservation || new Date().toISOString().split('T')[0],
        latitude: Number(body.latitude) || 0,
        longitude: Number(body.longitude) || 0,
        photoUrl: body.photoUrl || undefined,
        auteur: body.auteur || 'Agent anonyme',
        gravite: body.gravite || 'Moyenne',
        statut: body.statut || 'En attente',
        dateCreation: new Date().toISOString()
      };

      pollutions.unshift(newPollution);
      savePollutions(pollutions);
      return ok(newPollution, 201);
    }

    // PUT /api/pollutions/:id : Modifier une pollution
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const index = pollutions.findIndex(p => String(p.id) === id);
      if (index === -1) {
        return httpError(404, `Pollution #${id} introuvable`, req.url);
      }
      pollutions[index] = {
        ...pollutions[index],
        ...(req.body as object),
        id: pollutions[index].id
      };
      savePollutions(pollutions);
      return ok(pollutions[index]);
    }

    // DELETE /api/pollutions/:id : Supprimer une pollution
    if (req.method === 'DELETE') {
      const remaining = pollutions.filter(p => String(p.id) !== id);
      if (remaining.length === pollutions.length) {
        return httpError(404, `Pollution #${id} introuvable`, req.url);
      }
      savePollutions(remaining);
      return ok({ success: true, message: `Pollution #${id} supprimée`, id });
    }
  }

  return null;
}

/**
 * Intercepteur HTTP :
 * - En mode développement (mockApi: true), simule directement l'API REST.
 * - En mode production (mockApi: false), appelle le serveur Node.js/PostgreSQL sur Render,
 *   et bascule automatiquement sur le mock local si le serveur Render gratuit est en veille.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.mockApi) {
    return simulateApi(req) ?? next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si le serveur Render gratuit est endormi ou injoignable (status 0 ou 502/503/504)
      if (error.status === 0 || error.status >= 502) {
        const fallback = simulateApi(req);
        if (fallback) {
          return fallback;
        }
      }
      return throwError(() => error);
    })
  );
};
