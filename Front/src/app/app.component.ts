import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientSignupComponent } from './client-signup/client-signup.component';
import { PollutionFormComponent } from './pollution-form/pollution-form.component';
import { PollutionRecapComponent } from './pollution-recap/pollution-recap.component';
import { ClientResponse } from './models/client.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ClientSignupComponent, 
    PollutionFormComponent, 
    PollutionRecapComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Front';

  // Utilisateur actuellement inscrit / connecté
  currentUser: any = null;

  // État du signalement de pollution
  isSubmitted = false;
  formData: any = null;

  ngOnInit(): void {
    // Restaure la session si l'utilisateur s'est déjà inscrit dans cet onglet
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch {
        sessionStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Déclenché dès que l'inscription via le service client réussit.
   * Fait basculer automatiquement l'utilisateur vers la plateforme de signalement.
   */
  onSignupSuccess(response: ClientResponse): void {
    this.currentUser = response.user || {
      login: 'agent',
      nom: '',
      prenom: ''
    };
    sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  /**
   * Déconnexion de l'utilisateur pour revenir au formulaire d'inscription.
   */
  logout(): void {
    this.currentUser = null;
    this.isSubmitted = false;
    this.formData = null;
    sessionStorage.removeItem('currentUser');
  }

  /**
   * Traite la soumission du formulaire de pollution.
   */
  onFormSubmit(data: any): void {
    this.formData = data;
    this.isSubmitted = true;
  }
}
