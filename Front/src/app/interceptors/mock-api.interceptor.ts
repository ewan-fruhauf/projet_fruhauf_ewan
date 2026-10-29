import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { STORAGE_KEY, INITIAL_POLLUTIONS } from './mock-data';

/**
 * Fonctions utilitaires pour standardiser les réponses mockées avec délai simulé
 */
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

/**
 * Récupère les données depuis localStorage ou initialise le jeu de test.
 * Si la clé existe (même si la liste est vide []), on conserve l'état.
 */
function loadPollutions(): Pollution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Mock API] Erreur lors de la lecture du localStorage, initialisation par défaut', err);
  }
  savePollutions(INITIAL_POLLUTIONS);
  return INITIAL_POLLUTIONS;
}

/**
 * Sauvegarde l'état actuel des pollutions dans le localStorage
 */
function savePollutions(data: Pollution[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[Mock API] Erreur lors de l\'enregistrement dans localStorage', err);
  }
}

/**
 * Intercepteur HTTP pour simuler (mocker) l'ensemble des endpoints REST :
 * - POST /signup (Exercice 02)
 * - GET /pollutions (Read all)
 * - GET /pollutions/:id (Read one)
 * - POST /pollutions (Create)
 * - PUT /pollutions/:id (Update)
 * - DELETE /pollutions/:id (Delete)
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const isMockEnabled = (environment as any).mockApi !== false;

  if (!isMockEnabled) {
    return next(req);
  }

  // --- 1. ROUTE D'INSCRIPTION : POST /signup (Exercice 02) ---
  if (req.method === 'POST' && req.url.endsWith('/signup')) {
    const body = req.body as any;

    if (body?.login === 'error' || body?.email === 'error@test.com') {
      return errorResponse(409, 'Conflict', "Cet identifiant est déjà utilisé (Simulation d'erreur HTTP 409)", req.url);
    }

    return ok({
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
    }, 201, 250);
  }

  // --- 2. GESTION DES POLLUTIONS : CRUD /pollutions (TP 03) ---
  if (req.url.includes('/pollutions')) {
    const urlParts = req.url.split('/pollutions');
    const pathAfterPollutions = urlParts[1] || '';
    const idMatch = pathAfterPollutions.match(/^\/([^/?#]+)/);
    const targetId = idMatch ? idMatch[1] : null;

    let pollutions = loadPollutions();

    switch (req.method) {
      // 2.A & 2.B : READ ALL / READ ONE
      case 'GET': {
        if (!targetId) {
          return ok(pollutions);
        }
        const found = pollutions.find(p => String(p.id) === String(targetId));
        return found ? ok(found, 200, 150) : notFound(`Pollution #${targetId} introuvable`, req.url);
      }

      // 2.C : CREATE
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

      // 2.D : UPDATE
      case 'PUT':
      case 'PATCH': {
        if (!targetId) {
          return errorResponse(400, 'Bad Request', 'Identifiant manquant pour la mise à jour', req.url);
        }
        const index = pollutions.findIndex(p => String(p.id) === String(targetId));
        if (index === -1) {
          return notFound(`Impossible de modifier : Pollution #${targetId} introuvable`, req.url);
        }

        const updatedPollution: Pollution = {
          ...pollutions[index],
          ...(req.body as Partial<Pollution>),
          id: pollutions[index].id
        };
        pollutions[index] = updatedPollution;
        savePollutions(pollutions);
        return ok(updatedPollution);
      }

      // 2.E : DELETE
      case 'DELETE': {
        if (!targetId) {
          return errorResponse(400, 'Bad Request', 'Identifiant manquant pour la suppression', req.url);
        }
        const initialLength = pollutions.length;
        pollutions = pollutions.filter(p => String(p.id) !== String(targetId));

        if (pollutions.length === initialLength) {
          return notFound(`Impossible de supprimer : Pollution #${targetId} introuvable`, req.url);
        }

        savePollutions(pollutions);
        return ok({
          success: true,
          message: `Pollution #${targetId} supprimée avec succès`,
          id: targetId
        });
      }

      default:
        return next(req);
    }
  }

  // Requêtes non interceptées
  return next(req);
};
