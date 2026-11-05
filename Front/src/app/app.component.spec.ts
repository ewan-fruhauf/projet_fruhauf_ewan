import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
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

  it('devrait contenir le titre TERRA SHIELD dans le template', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('TERRA SHIELD');
  });

  it('devrait afficher les liens de navigation principaux', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navText = compiled.querySelector('.nav-links')?.textContent;
    expect(navText).toContain('Signalements');
    expect(navText).toContain('Déclarer');
    expect(navText).toContain('Service Client');
  });

  it('devrait réinitialiser l\'utilisateur lors de la déconnexion', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.currentUser = { login: 'test', nom: 'Nom', prenom: 'Prenom' };
    fixture.detectChanges();

    app.logout();
    fixture.detectChanges();

    expect(app.currentUser).toBeNull();
  });
});
