import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientService } from '../services/client.service';
import { ClientSignUp, ClientResponse } from '../models/client.model';
import { environment } from '../../environments/environment';

/**
 * Validateur personnalisé pour vérifier que le mot de passe et sa confirmation correspondent.
 */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-client-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-signup.component.html',
  styleUrls: ['./client-signup.component.css']
})
export class ClientSignupComponent {
  // Émission de l'événement lors d'une inscription réussie
  @Output() signupSuccess = new EventEmitter<ClientResponse>();

  // 1. Injection de dépendances moderne via inject() (recommandation Séance 3)
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  // Exposition de la configuration d'environnement pour affichage informatif
  readonly apiUrl = environment.apiUrl;

  // 2. Gestion d'état moderne via Angular Signals (recommandation Séance 3)
  isLoading = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  apiResponse = signal<ClientResponse | null>(null);
  errorMessage = signal<string | null>(null);
  httpStatusCode = signal<number | null>(null);

  // Formulaire réactif avec validations
  signupForm: FormGroup = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  /**
   * Soumission du formulaire d'inscription.
   * Déclenche l'appel HTTP encapsulé dans ClientService.
   */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // Réinitialisation des états d'erreur/succès et passage en chargement
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.httpStatusCode.set(null);

    const formValues = this.signupForm.value;
    const clientData: ClientSignUp = {
      login: formValues.login.trim(),
      email: formValues.email.trim(),
      nom: formValues.nom.trim(),
      prenom: formValues.prenom.trim(),
      password: formValues.password
    };

    // 3. Consommation de l'Observable retourné par le service (Observables & RxJS - Séance 3)
    this.clientService.signUp(clientData).subscribe({
      next: (response: ClientResponse) => {
        this.isLoading.set(false);
        this.isSubmitted.set(true);
        this.apiResponse.set(response);
        // Émission pour redirection automatique vers la plateforme
        this.signupSuccess.emit(response);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.httpStatusCode.set(error.status);

        if (error.status === 0) {
          this.errorMessage.set(
            `Impossible de joindre le serveur API à ${this.apiUrl}/signup. Le backend est probablement hors ligne.`
          );
        } else if (error.error?.message) {
          this.errorMessage.set(`Erreur ${error.status} : ${error.error.message}`);
        } else {
          this.errorMessage.set(`Erreur HTTP ${error.status} (${error.statusText || 'Échec de la requête'})`);
        }
      }
    });
  }

  /**
   * Permet de simuler un retour API réussi pour tester l'interface
   * si aucun backend n'est encore démarré localement.
   */
  simulateMockSuccess(): void {
    const formValues = this.signupForm.value;
    const mockResponse: ClientResponse = {
      success: true,
      message: 'Utilisateur inscrit avec succès (Simulation)',
      user: {
        id: Math.floor(Math.random() * 9000) + 1000,
        login: formValues.login || 'utilisateur_test',
        email: formValues.email || 'test@example.com',
        nom: formValues.nom || 'Fruhauf',
        prenom: formValues.prenom || 'Ewan',
        createdAt: new Date().toISOString()
      }
    };

    this.isLoading.set(false);
    this.errorMessage.set(null);
    this.httpStatusCode.set(201);
    this.isSubmitted.set(true);
    this.apiResponse.set(mockResponse);
    this.signupSuccess.emit(mockResponse);
  }

  /**
   * Réinitialise le formulaire et l'état réactif du composant.
   */
  onReset(): void {
    this.signupForm.reset();
    this.isSubmitted.set(false);
    this.apiResponse.set(null);
    this.errorMessage.set(null);
    this.httpStatusCode.set(null);
    this.isLoading.set(false);
  }
}
