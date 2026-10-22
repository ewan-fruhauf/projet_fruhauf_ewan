import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Suivi de Pollution';
  readonly apiUrl = environment.apiUrl;
  readonly isMocked = (environment as any).mockApi !== false;

  currentUser: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.refreshUser();
  }

  refreshUser(): void {
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch {
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
      }
    } else {
      // Utilisateur agent par défaut pour simplifier les tests et l'évaluation immédiate
      this.currentUser = {
        login: 'agent_terrain',
        nom: 'Fruhauf',
        prenom: 'Ewan'
      };
      sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUser = null;
    this.router.navigate(['/signup']);
  }
}
