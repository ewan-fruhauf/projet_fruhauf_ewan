import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { mockApiInterceptor } from './mock-api.interceptor';
import { environment } from '../../environments/environment';

describe('mockApiInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('devrait intercepter un POST /signup et renvoyer une réponse mockée 201', (done) => {
    const payload = {
      login: 'tester',
      email: 'tester@example.com',
      nom: 'Test',
      prenom: 'User',
      password: 'secretPassword123'
    };

    httpClient.post<any>(`${environment.apiUrl}/signup`, payload).subscribe({
      next: (res) => {
        expect(res.success).toBeTrue();
        expect(res.user.login).toEqual('tester');
        expect(res.user.email).toEqual('tester@example.com');
        done();
      },
      error: (err) => {
        fail('Ne devrait pas échouer : ' + JSON.stringify(err));
        done();
      }
    });
  });

  it('devrait intercepter un login error et renvoyer une erreur 409', (done) => {
    const payload = {
      login: 'error',
      email: 'error@test.com',
      nom: 'Test',
      prenom: 'User',
      password: 'secretPassword123'
    };

    httpClient.post<any>(`${environment.apiUrl}/signup`, payload).subscribe({
      next: () => {
        fail('Aurait dû échouer avec un code 409');
        done();
      },
      error: (err) => {
        expect(err.status).toBe(409);
        expect(err.error.message).toContain('déjà utilisé');
        done();
      }
    });
  });
});
