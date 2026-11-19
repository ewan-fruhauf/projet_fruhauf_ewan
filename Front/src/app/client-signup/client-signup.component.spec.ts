import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClientSignupComponent } from './client-signup.component';
import { UserService } from '../services/user.service';
import { UserResponse } from '../models/user.model';

describe('ClientSignupComponent', () => {
  let component: ClientSignupComponent;
  let fixture: ComponentFixture<ClientSignupComponent>;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSignupComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientSignupComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    fixture.detectChanges();
  });

  it('devrait créer le composant d\'inscription', () => {
    expect(component).toBeTruthy();
  });

  it('devrait initialiser un formulaire vide et invalide', () => {
    expect(component.signupForm.valid).toBeFalse();
  });

  it('devrait détecter la non-concordance des mots de passe', () => {
    component.signupForm.patchValue({
      login: 'agent_eco',
      email: 'agent@example.com',
      nom: 'Dupont',
      prenom: 'Alex',
      password: 'password123',
      confirmPassword: 'differentPassword'
    });

    expect(component.signupForm.errors?.['passwordMismatch']).toBeTrue();
    expect(component.signupForm.valid).toBeFalse();
  });

  it('le formulaire devrait être valide avec des champs corrects', () => {
    component.signupForm.patchValue({
      login: 'agent_eco',
      email: 'agent@example.com',
      nom: 'Dupont',
      prenom: 'Alex',
      password: 'password123',
      confirmPassword: 'password123'
    });

    expect(component.signupForm.valid).toBeTrue();
  });

  it('devrait appeler UserService.createUser et afficher le résultat en cas de succès', () => {
    const mockResponse: UserResponse = {
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: 1,
        login: 'agent_eco',
        email: 'agent@example.com',
        nom: 'Dupont',
        prenom: 'Alex'
      }
    };

    spyOn(userService, 'createUser').and.returnValue(of(mockResponse));

    component.signupForm.patchValue({
      login: 'agent_eco',
      email: 'agent@example.com',
      nom: 'Dupont',
      prenom: 'Alex',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(userService.createUser).toHaveBeenCalled();
    expect(component.isSubmitted()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
    expect(component.apiResponse()).toEqual(mockResponse);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Inscription confirmée par le service');
  });

  it('devrait gérer l\'erreur de communication HTTP et afficher une alerte', () => {
    const errorResponse = {
      status: 0,
      statusText: 'Unknown Error',
      error: {}
    };

    spyOn(userService, 'createUser').and.returnValue(throwError(() => errorResponse));

    component.signupForm.patchValue({
      login: 'agent_eco',
      email: 'agent@example.com',
      nom: 'Dupont',
      prenom: 'Alex',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(userService.createUser).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
    expect(component.isSubmitted()).toBeFalse();
    expect(component.errorMessage()).toContain('Impossible de joindre le serveur API');
  });

  it('devrait réinitialiser le formulaire avec onReset', () => {
    component.isSubmitted.set(true);
    component.apiResponse.set({ success: true, message: 'ok' });
    component.errorMessage.set('erreur');

    component.onReset();

    expect(component.isSubmitted()).toBeFalse();
    expect(component.apiResponse()).toBeNull();
    expect(component.errorMessage()).toBeNull();
  });
});
