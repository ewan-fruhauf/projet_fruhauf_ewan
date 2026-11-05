import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserSignUp, UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly endpoint = `${this.baseUrl}/users`;

  // Gestion de l'état réactif de l'utilisateur connecté
  private currentUserSubject = new BehaviorSubject<User | null>(this.getInitialUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private getInitialUser(): User | null {
    try {
      const saved = sessionStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  /**
   * 1. GET /api/users : Liste de tous les utilisateurs enregistrés
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.endpoint);
  }

  /**
   * 2. GET /api/users/:id : Détails d'un utilisateur par son ID
   */
  getUserById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.endpoint}/${id}`);
  }

  /**
   * 3. POST /api/users : Création d'un nouvel utilisateur
   */
  createUser(user: UserSignUp): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.endpoint, user);
  }

  /**
   * 4. DELETE /api/users/:id : Suppression d'un utilisateur
   */
  deleteUser(id: number | string): Observable<{ success: boolean; message: string; id: number | string }> {
    return this.http.delete<{ success: boolean; message: string; id: number | string }>(`${this.endpoint}/${id}`);
  }

  /**
   * 5. POST /api/users/login : Authentification fictive
   */
  login(credentials: { login: string; password: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.endpoint}/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  /**
   * Sauvegarde l'utilisateur connecté dans la session et notifie les abonnés
   */
  setCurrentUser(user: User | null): void {
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(user);
  }

  /**
   * Récupère la valeur instantanée de l'utilisateur connecté
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    this.setCurrentUser(null);
  }
}
