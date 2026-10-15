import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { ClientResponse } from './models/client.model';

describe('AppComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('devrait créer l\'application', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`devrait avoir le titre 'Front'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Front');
  });

  it('devrait afficher le formulaire d\'inscription au démarrage (non connecté)', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('PORTAIL D\'ACCÈS');
    expect(compiled.querySelector('app-client-signup')).toBeTruthy();
  });

  it('devrait basculer vers la plateforme de signalement après inscription', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const mockResponse: ClientResponse = {
      success: true,
      message: 'Compte créé',
      user: {
        id: 42,
        login: 'ewan_f',
        email: 'ewan@test.com',
        nom: 'Fruhauf',
        prenom: 'Ewan'
      }
    };

    app.onSignupSuccess(mockResponse);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('SUIVI DE POLLUTION');
    expect(compiled.querySelector('.user-name')?.textContent).toContain('Ewan Fruhauf');
    expect(compiled.querySelector('app-pollution-form')).toBeTruthy();
  });

  it('devrait revenir à l\'inscription lors de la déconnexion', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.currentUser = { login: 'test', nom: 'Nom', prenom: 'Prenom' };
    fixture.detectChanges();

    app.logout();
    fixture.detectChanges();

    expect(app.currentUser).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('PORTAIL D\'ACCÈS');
  });
});
