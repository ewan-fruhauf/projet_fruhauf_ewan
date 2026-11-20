import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserSignUp, UserResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

// Vérifie que le mot de passe et sa confirmation sont identiques
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-client-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-signup.component.html',
  styleUrls: ['./client-signup.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSignupComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly apiUrl = environment.apiUrl;
  readonly currentUser = this.userService.currentUser;

  isLoading = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  apiResponse = signal<UserResponse | null>(null);
  errorMessage = signal<string | null>(null);
  httpStatusCode = signal<number | null>(null);
  authGuardTriggered = signal<boolean>(false);

  signupForm: FormGroup = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    // Écoute réactive des paramètres d'URL pour détecter à tout moment un blocage par AuthGuard
    this.route.queryParamMap.subscribe(params => {
      const authRequired = params.get('authRequired') === 'true';
      this.authGuardTriggered.set(authRequired && !this.currentUser());
    });
  }

  // Connexion rapide en 1 clic (pratique pour tester le Guard sans remplir tout le formulaire)
  quickLogin(): void {
    this.userService.setCurrentUser({
      id: 1,
      login: 'agent_eco',
      nom: 'Martin',
      prenom: 'Alex',
      role: 'Agent de terrain',
      email: 'alex.martin@terrashield.org'
    });
    this.authGuardTriggered.set(false);
    this.router.navigate(['/pollutions']);
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.httpStatusCode.set(null);

    const formValues = this.signupForm.value;
    const newUserData: UserSignUp = {
      login: formValues.login.trim(),
      email: formValues.email.trim(),
      nom: formValues.nom.trim(),
      prenom: formValues.prenom.trim(),
      password: formValues.password
    };

    this.userService.createUser(newUserData).subscribe({
      next: (response: UserResponse) => {
        this.isLoading.set(false);
        this.isSubmitted.set(true);
        this.authGuardTriggered.set(false);
        this.apiResponse.set(response);
        if (response.user) {
          this.userService.setCurrentUser(response.user);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.httpStatusCode.set(error.status);

        if (error.status === 0) {
          this.errorMessage.set(`Impossible de joindre le serveur API à ${this.apiUrl}/users.`);
        } else if (error.error?.message) {
          this.errorMessage.set(`Erreur ${error.status} : ${error.error.message}`);
        } else {
          this.errorMessage.set(`Erreur HTTP ${error.status}`);
        }
      }
    });
  }

  onReset(): void {
    this.signupForm.reset();
    this.isSubmitted.set(false);
    this.apiResponse.set(null);
    this.errorMessage.set(null);
    this.httpStatusCode.set(null);
    this.isLoading.set(false);
  }
}
