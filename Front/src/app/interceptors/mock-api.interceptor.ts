import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { User } from '../models/user.model';
import { STORAGE_KEY, USERS_STORAGE_KEY, INITIAL_POLLUTIONS, INITIAL_USERS } from './mock-data';

function ok<T>(body: T, status = 200, delayMs = 200) {
  return of(new HttpResponse({
    status,
    statusText: status === 201 ? 'Created' : 'OK',
    body
  })).pipe(delay(delayMs));
}

function notFound(message: string, url: string) {
  return throwError(() => new HttpErrorResponse({
    status: 404,
    statusText: 'Not Found',
    error: { message },
    url
  })).pipe(delay(150));
}

function errorResponse(status: number, statusText: string, message: string, url: string) {
  return throwError(() => new HttpErrorResponse({
    status,
    statusText,
    error: { message },
    url
  })).pipe(delay(200));
}

function loadPollutions(): Pollution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Mock API] Erreur lors de la lecture du localStorage pollutions', err);
  }
  savePollutions(INITIAL_POLLUTIONS);
  return INITIAL_POLLUTIONS;
}

function savePollutions(data: Pollution[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[Mock API] Erreur lors de l\'enregistrement dans localStorage pollutions', err);
  }
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Mock API] Erreur lors de la lecture du localStorage users', err);
  }
  saveUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

function saveUsers(data: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[Mock API] Erreur lors de l\'enregistrement dans localStorage users', err);
  }
}

/**
 * Intercepteur HTTP pour simuler l'ensemble des endpoints REST :
 * - /api/users (GET, POST, DELETE, POST /login)
 * - /api/pollutions (GET, GET /:id, POST, PUT, DELETE)
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const isMockEnabled = (environment as any).mockApi !== false;

  if (!isMockEnabled) {
    return next(req);
  }

  // --- 1. GESTION DES UTILISATEURS : /api/users & /api/signup & /api/login (TP 04) ---
  if (req.url.includes('/users') || req.url.endsWith('/signup') || req.url.endsWith('/login')) {
    let users = loadUsers();

    // Authentification fictive : POST /users/login ou POST /login
    if (req.method === 'POST' && (req.url.endsWith('/login') || req.url.includes('/users/login'))) {
      const body = req.body as any;
      const found = users.find(u => u.login === body?.login || u.email === body?.login);
      if (!found) {
        return errorResponse(401, 'Unauthorized', 'Identifiants invalides (utilisateur non trouvé)', req.url);
      }
      return ok({
        success: true,
        message: 'Authentification réussie via API mockée',
        user: {
          id: found.id,
          login: found.login,
          email: found.email,
          nom: found.nom,
          prenom: found.prenom,
          role: found.role
        }
      }, 200, 200);
    }

    // Création : POST /users ou POST /signup
    if (req.method === 'POST' && (req.url.endsWith('/users') || req.url.endsWith('/signup'))) {
      const body = req.body as any;

      if (body?.login === 'error' || body?.email === 'error@test.com') {
        return errorResponse(409, 'Conflict', "Cet identifiant est déjà utilisé (Simulation d'erreur HTTP 409)", req.url);
      }

      const existing = users.find(u => u.login === body?.login);
      if (existing) {
        return errorResponse(409, 'Conflict', `Le login "${body?.login}" est déjà pris.`, req.url);
      }

      const maxId = users.reduce((max, u) => (Number(u.id) > max ? Number(u.id) : max), 0);
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

      return ok({
        success: true,
        message: 'Utilisateur créé avec succès via API mockée',
        user: newUser
      }, 201, 250);
    }

    // Lecture : GET /users ou GET /users/:id
    if (req.method === 'GET' && req.url.includes('/users')) {
      const urlParts = req.url.split('/users');
      const pathAfterUsers = urlParts[1] || '';
      const idMatch = pathAfterUsers.match(/^\/([^/?#]+)/);
      const targetId = idMatch ? idMatch[1] : null;

      if (!targetId) {
        return ok(users);
      }
      const found = users.find(u => String(u.id) === String(targetId));
      return found ? ok(found, 200, 150) : notFound(`Utilisateur #${targetId} introuvable`, req.url);
    }

    // Suppression : DELETE /users/:id
    if (req.method === 'DELETE' && req.url.includes('/users/')) {
      const urlParts = req.url.split('/users/');
      const targetId = urlParts[1]?.split(/[?#]/)[0];
      const initialLength = users.length;
      users = users.filter(u => String(u.id) !== String(targetId));

      if (users.length < initialLength) {
        saveUsers(users);
        return ok({
          success: true,
          message: `Utilisateur #${targetId} supprimé avec succès`,
          id: targetId
        }, 200, 200);
      }
      return notFound(`Impossible de supprimer : Utilisateur #${targetId} introuvable`, req.url);
    }
  }

  // --- 2. GESTION DES POLLUTIONS : CRUD /pollutions (TP 03 & TP 04) ---
  if (req.url.includes('/pollutions') || req.url.includes('/pollution')) {
    const urlParts = req.url.includes('/pollutions') ? req.url.split('/pollutions') : req.url.split('/pollution');
    const pathAfterPollutions = urlParts[1] || '';
    const idMatch = pathAfterPollutions.match(/^\/([^/?#]+)/);
    const targetId = idMatch ? idMatch[1] : null;

    let pollutions = loadPollutions();

    switch (req.method) {
      case 'GET': {
        if (!targetId) {
          return ok(pollutions);
        }
        const found = pollutions.find(p => String(p.id) === String(targetId));
        return found ? ok(found, 200, 150) : notFound(`Pollution #${targetId} introuvable`, req.url);
      }

      case 'POST': {
        const body = req.body as Partial<Pollution>;
        const maxId = pollutions.reduce((max, p) => (Number(p.id) > max ? Number(p.id) : max), 0);
        const newPollution: Pollution = {
          id: maxId + 1,
          titre: body.titre || 'Signalement sans titre',
          type: (body.type as any) || 'Autre',
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
        return ok(newPollution, 201, 250);
      }

      case 'PUT':
      case 'PATCH': {
        if (!targetId) {
          return errorResponse(400, 'Bad Request', 'ID manquant pour la modification', req.url);
        }
        const index = pollutions.findIndex(p => String(p.id) === String(targetId));
        if (index === -1) {
          return notFound(`Impossible de modifier : Pollution #${targetId} introuvable`, req.url);
        }

        pollutions[index] = {
          ...pollutions[index],
          ...(req.body as object),
          id: pollutions[index].id
        };

        savePollutions(pollutions);
        return ok(pollutions[index], 200, 200);
      }

      case 'DELETE': {
        if (!targetId) {
          return errorResponse(400, 'Bad Request', 'ID manquant pour la suppression', req.url);
        }
        const initialLength = pollutions.length;
        pollutions = pollutions.filter(p => String(p.id) !== String(targetId));

        if (pollutions.length < initialLength) {
          savePollutions(pollutions);
          return ok({
            success: true,
            message: `Pollution #${targetId} supprimée avec succès`,
            id: targetId
          }, 200, 200);
        }
        return notFound(`Impossible de supprimer : Pollution #${targetId} introuvable`, req.url);
      }

      default:
        return next(req);
    }
  }

  return next(req);
};
