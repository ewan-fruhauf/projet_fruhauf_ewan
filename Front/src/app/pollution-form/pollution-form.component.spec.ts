import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PollutionFormComponent } from './pollution-form.component';

describe('PollutionFormComponent', () => {
  let component: PollutionFormComponent;
  let fixture: ComponentFixture<PollutionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  it('devrait initialiser un formulaire invalide au démarrage', () => {
    expect(component.pollutionForm.valid).toBeFalse();
  });

  it('devrait valider le formulaire quand tous les champs obligatoires sont remplis', () => {
    component.pollutionForm.patchValue({
      titre: 'Décharge sauvage constatée',
      type: 'Plastique',
      gravite: 'Critique',
      statut: 'En attente',
      description: 'Présence de nombreux sacs plastiques le long du chemin',
      lieu: 'Forêt de Bondy',
      dateObservation: '2026-10-22',
      latitude: '48.8566',
      longitude: '2.3522'
    });

    expect(component.pollutionForm.valid).toBeTrue();
  });
});
