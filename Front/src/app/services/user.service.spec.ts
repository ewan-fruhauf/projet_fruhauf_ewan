import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';
import { UserSignUp, UserResponse } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait envoyer une requête POST /users pour créer un utilisateur', () => {
    const mockUser: UserSignUp = {
      login: 'agent_eco',
      email: 'test@example.com',
      nom: 'Dupont',
      prenom: 'Alex',
      password: 'secretPassword123'
    };

    const mockResponse: UserResponse = {
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: 42,
        login: mockUser.login,
        email: mockUser.email,
        nom: mockUser.nom,
        prenom: mockUser.prenom
      }
    };

    service.createUser(mockUser).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.success).toBeTrue();
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('devrait déconnecter l\'utilisateur avec logout()', () => {
    service.logout();
    expect(service.currentUser()).toBeNull();
  });
});
