import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserSignUp, UserResponse } from '../models/user.model';

const DEFAULT_AGENT: User = {
  id: 1,
  login: 'agent_eco',
  nom: 'Martin',
  prenom: 'Alex',
  role: 'Agent de terrain',
  email: 'alex.martin@terrashield.org'
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/users`;

  // Signal contenant l'utilisateur connecté (ou null si déconnecté)
  currentUser = signal<User | null>(this.loadInitialUser());

  private loadInitialUser(): User | null {
    try {
      // Si l'utilisateur a cliqué sur "Déconnexion", on reste déconnecté (utile pour tester le Guard)
      if (sessionStorage.getItem('isLoggedOut') === 'true') {
        return null;
      }
      const saved = sessionStorage.getItem('currentUser');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignorer en cas d'erreur de lecture
    }
    // Par défaut au premier lancement, on connecte l'agent de démonstration
    sessionStorage.setItem('currentUser', JSON.stringify(DEFAULT_AGENT));
    return DEFAULT_AGENT;
  }

  // 1. GET /api/users : Liste tous les utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.endpoint);
  }

  // 2. GET /api/users/:id : Détails d'un utilisateur
  getUserById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.endpoint}/${id}`);
  }

  // 3. POST /api/users : Créer un utilisateur
  createUser(user: UserSignUp): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.endpoint, user);
  }

  // 4. DELETE /api/users/:id : Supprimer un utilisateur
  deleteUser(id: number | string): Observable<{ success: boolean; message: string; id: number | string }> {
    return this.http.delete<{ success: boolean; message: string; id: number | string }>(`${this.endpoint}/${id}`);
  }

  // 5. POST /api/users/login : Authentification fictive
  login(credentials: { login: string; password?: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.endpoint}/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  // Met à jour l'utilisateur connecté dans le signal et dans la session
  setCurrentUser(user: User | null): void {
    if (user) {
      sessionStorage.removeItem('isLoggedOut');
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('currentUser');
      sessionStorage.setItem('isLoggedOut', 'true');
    }
    this.currentUser.set(user);
  }

  // Déconnecte l'utilisateur actuel
  logout(): void {
    this.setCurrentUser(null);
  }
}
