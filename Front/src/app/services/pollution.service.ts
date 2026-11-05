import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';

@Injectable({
  providedIn: 'root'
})
export class PollutionService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly endpoint = `${this.baseUrl}/pollutions`;

  /**
   * 1. READ ALL : Récupère la liste complète des pollutions enregistrées.
   * @returns Observable émettant le tableau des pollutions
   */
  getPollutions(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.endpoint);
  }

  /**
   * 2. READ ONE : Accède aux détails complets d'une pollution spécifique par son identifiant.
   * @param id Identifiant unique de la pollution
   * @returns Observable émettant la pollution trouvée
   */
  getPollutionById(id: number | string): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.endpoint}/${id}`);
  }

  /**
   * 3. CREATE : Ajoute un nouveau signalement de pollution dans le système.
   * @param pollution Données du signalement (sans ID qui sera assigné par le backend)
   * @returns Observable émettant la pollution créée avec son ID
   */
  createPollution(pollution: Omit<Pollution, 'id'> | Partial<Pollution>): Observable<Pollution> {
    return this.http.post<Pollution>(this.endpoint, pollution);
  }

  /**
   * 4. UPDATE : Modifie une pollution existante (PUT/PATCH).
   * @param id Identifiant de la pollution à modifier
   * @param pollution Nouvelles données de la pollution
   * @returns Observable émettant la pollution mise à jour
   */
  updatePollution(id: number | string, pollution: Partial<Pollution>): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.endpoint}/${id}`, pollution);
  }

  /**
   * 5. DELETE : Supprime une pollution par son identifiant.
   * @param id Identifiant de la pollution à supprimer
   * @returns Observable émettant la confirmation de suppression
   */
  deletePollution(id: number | string): Observable<{ success: boolean; message: string; id: number | string }> {
    return this.http.delete<{ success: boolean; message: string; id: number | string }>(`${this.endpoint}/${id}`);
  }
}
