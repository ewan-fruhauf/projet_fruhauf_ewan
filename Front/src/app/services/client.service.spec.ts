import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientService } from './client.service';
import { environment } from '../../environments/environment';
import { ClientSignUp, ClientResponse } from '../models/client.model';

describe('ClientService', () => {
  let service: ClientService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClientService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ClientService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait envoyer une requête POST pour inscrire un utilisateur avec l\'URL d\'environnement', () => {
    const mockUser: ClientSignUp = {
      login: 'agent_eco',
      email: 'test@example.com',
      nom: 'Dupont',
      prenom: 'Alex',
      password: 'secretPassword123'
    };

    const mockResponse: ClientResponse = {
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

    service.signUp(mockUser).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.success).toBeTrue();
    });

    const expectedUrl = `${environment.apiUrl}/signup`;
    const req = httpTesting.expectOne(expectedUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);

    req.flush(mockResponse);
  });
});
