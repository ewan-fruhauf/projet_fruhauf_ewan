import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { UserService } from './services/user.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Suivi de Pollution & Gestion Utilisateurs';
  readonly apiUrl = environment.apiUrl;
  readonly isMocked = (environment as any).mockApi !== false;

  private userService = inject(UserService);
  private router = inject(Router);

  currentUser: User | null = null;

  ngOnInit(): void {
    // Écoute réactive de l'utilisateur connecté via UserService
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Initialisation d'un profil par défaut si aucun n'est actif
    if (!this.currentUser) {
      this.userService.setCurrentUser({
        id: 1,
        login: 'agent_eco',
        nom: 'Martin',
        prenom: 'Alex',
        role: 'Agent de terrain',
        email: 'alex.martin@terrashield.org'
      });
    }
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/signup']);
  }
}
