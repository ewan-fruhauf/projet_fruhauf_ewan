export type PollutionType = 'Plastique' | 'Chimique' | 'Dépôt sauvage' | 'Eau' | 'Air' | 'Autre';

export type PollutionGravite = 'Faible' | 'Moyenne' | 'Critique';

export type PollutionStatut = 'En attente' | 'En cours' | 'Traité';

export interface Pollution {
  id: number;
  titre: string;
  type: PollutionType;
  description: string;
  lieu: string;
  dateObservation: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  auteur?: string;
  gravite?: PollutionGravite;
  statut?: PollutionStatut;
  dateCreation?: string;
}

export interface PollutionFilter {
  type?: string;
  searchTerm?: string;
  dateMin?: string;
  dateMax?: string;
  gravite?: string;
}
