import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';

// Clé de stockage pour la persistance locale du mock
const STORAGE_KEY = 'mock_pollutions_database';

// Données initiales par défaut au démarrage
const INITIAL_POLLUTIONS: Pollution[] = [
  {
    id: 1,
    titre: 'Décharge sauvage en bordure de forêt',
    type: 'Dépôt sauvage',
    description: "Accumulation d'encombrants, vieux pneus et gravats de chantier abandonnés le long du chemin forestier.",
    lieu: 'Forêt de Fontainebleau, Seine-et-Marne',
    dateObservation: '2026-10-18',
    latitude: 48.4047,
    longitude: 2.7016,
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    auteur: 'Ewan Fruhauf',
    gravite: 'Critique',
    statut: 'En attente',
    dateCreation: '2026-10-18T14:32:00.000Z'
  },
  {
    id: 2,
    titre: "Nappe d'hydrocarbures sur berge fluviale",
    type: 'Eau',
    description: "Nappe irisée avec forte odeur de carburant observée sur la berge suite à un dégazage ou fuite de cuve suspectée.",
    lieu: 'Quai fluvial, Rouen (Seine-Maritime)',
    dateObservation: '2026-10-19',
    latitude: 49.4432,
    longitude: 1.0999,
    photoUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80',
    auteur: 'Sarah Connor',
    gravite: 'Critique',
    statut: 'En cours',
    dateCreation: '2026-10-19T09:15:00.000Z'
  },
  {
    id: 3,
    titre: 'Amas de microplastiques et emballages sur plage',
    type: 'Plastique',
    description: 'Grande quantité de bouteilles, filets de pêche et microparticules plastiques échoués après la dernière marée haute.',
    lieu: 'Plage de la Côte des Basques, Biarritz',
    dateObservation: '2026-10-20',
    latitude: 43.4795,
    longitude: -1.5647,
    photoUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80',
    auteur: 'Alexandre Dumas',
    gravite: 'Moyenne',
    statut: 'En attente',
    dateCreation: '2026-10-20T16:45:00.000Z'
  },
  {
    id: 4,
    titre: "Fumées âcres et épaisses d'origine industrielle",
    type: 'Air',
    description: 'Émanations de fumées noires et odeurs soufrées intenses signalées par les riverains aux abords de la zone artisanale.',
    lieu: 'Zone industrielle Nord, Feyzin (Lyon)',
    dateObservation: '2026-10-21',
    latitude: 45.6719,
    longitude: 4.8589,
    photoUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80',
    auteur: 'Thomas Pesquet',
    gravite: 'Critique',
    statut: 'En cours',
    dateCreation: '2026-10-21T11:20:00.000Z'
  },
  {
    id: 5,
    titre: 'Bidons de solvants abandonnés en zone agricole',
    type: 'Chimique',
    description: 'Trois fûts métalliques de 50L corrodés avec étiquetage de risque chimique laissés près d\'un fossé de drainage.',
    lieu: 'Bordure de champ, Beauce (Chartres)',
    dateObservation: '2026-10-22',
    latitude: 48.4561,
    longitude: 1.4841,
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    auteur: 'Camille Claudel',
    gravite: 'Critique',
    statut: 'Traité',
    dateCreation: '2026-10-22T08:10:00.000Z'
  }
];

/**
 * Récupère les données depuis localStorage ou initialise le jeu de test
 */
function loadPollutions(): Pollution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Mock API] Erreur lors de la lecture du localStorage, chargement par défaut', err);
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
 * Intercepteur HTTP pour simuler (mocker) l'ensemble des endpoints CRUD :
 * - POST /signup (Ex02)
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
      const errorResponse = new HttpErrorResponse({
        error: { message: "Cet identifiant est déjà utilisé (Simulation d'erreur HTTP 409)" },
        status: 409,
        statusText: 'Conflict',
        url: req.url
      });
      return throwError(() => errorResponse).pipe(delay(300));
    }

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
    return of(successResponse).pipe(delay(250));
  }

  // --- 2. GESTION DES POLLUTIONS (TP 03 CRUD) ---
  const isPollutionsUrl = req.url.includes('/pollutions');
  if (isPollutionsUrl) {
    const urlParts = req.url.split('/pollutions');
    const pathAfterPollutions = urlParts[1] || '';
    const idMatch = pathAfterPollutions.match(/^\/([^/?#]+)/);
    const targetId = idMatch ? idMatch[1] : null;

    let pollutions = loadPollutions();

    // 2.A : READ ALL -> GET /pollutions
    if (req.method === 'GET' && !targetId) {
      return of(new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: pollutions
      })).pipe(delay(200));
    }

    // 2.B : READ ONE -> GET /pollutions/:id
    if (req.method === 'GET' && targetId) {
      const found = pollutions.find(p => String(p.id) === String(targetId));
      if (found) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: found
        })).pipe(delay(150));
      } else {
        return throwError(() => new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          error: { message: `Pollution #${targetId} introuvable` },
          url: req.url
        })).pipe(delay(150));
      }
    }

    // 2.C : CREATE -> POST /pollutions
    if (req.method === 'POST' && !targetId) {
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

      pollutions.unshift(newPollution); // Ajouter au début pour visibilité immédiate
      savePollutions(pollutions);

      return of(new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: newPollution
      })).pipe(delay(250));
    }

    // 2.D : UPDATE -> PUT /pollutions/:id
    if ((req.method === 'PUT' || req.method === 'PATCH') && targetId) {
      const body = req.body as Partial<Pollution>;
      const index = pollutions.findIndex(p => String(p.id) === String(targetId));

      if (index !== -1) {
        const updatedPollution: Pollution = {
          ...pollutions[index],
          ...body,
          id: pollutions[index].id // ID immuable
        };
        pollutions[index] = updatedPollution;
        savePollutions(pollutions);

        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: updatedPollution
        })).pipe(delay(200));
      } else {
        return throwError(() => new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          error: { message: `Impossible de modifier : Pollution #${targetId} introuvable` },
          url: req.url
        })).pipe(delay(150));
      }
    }

    // 2.E : DELETE -> DELETE /pollutions/:id
    if (req.method === 'DELETE' && targetId) {
      const initialLength = pollutions.length;
      pollutions = pollutions.filter(p => String(p.id) !== String(targetId));

      if (pollutions.length < initialLength) {
        savePollutions(pollutions);
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: `Pollution #${targetId} supprimée avec succès`,
            id: targetId
          }
        })).pipe(delay(200));
      } else {
        return throwError(() => new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          error: { message: `Impossible de supprimer : Pollution #${targetId} introuvable` },
          url: req.url
        })).pipe(delay(150));
      }
    }
  }

  // Requêtes non interceptées
  return next(req);
};
