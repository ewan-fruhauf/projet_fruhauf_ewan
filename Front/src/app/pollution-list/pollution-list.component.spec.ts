import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PollutionListComponent } from './pollution-list.component';

describe('PollutionListComponent', () => {
  let component: PollutionListComponent;
  let fixture: ComponentFixture<PollutionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  it('devrait filtrer par mot-clé correctement', () => {
    component.pollutions.set([
      {
        id: 1,
        titre: 'Plastiques sur plage',
        type: 'Plastique',
        description: 'Bouteilles',
        lieu: 'Biarritz',
        dateObservation: '2026-10-20',
        latitude: 43.4,
        longitude: -1.5
      },
      {
        id: 2,
        titre: 'Fumées usine',
        type: 'Air',
        description: 'Fumée',
        lieu: 'Lyon',
        dateObservation: '2026-10-21',
        latitude: 45.7,
        longitude: 4.8
      }
    ]);

    component.searchTerm.set('Biarritz');
    expect(component.filteredPollutions().length).toBe(1);
    expect(component.filteredPollutions()[0].id).toBe(1);
  });

  it('devrait filtrer par type correctement', () => {
    component.pollutions.set([
      {
        id: 1,
        titre: 'Plastiques',
        type: 'Plastique',
        description: 'desc',
        lieu: 'Biarritz',
        dateObservation: '2026-10-20',
        latitude: 43.4,
        longitude: -1.5
      },
      {
        id: 2,
        titre: 'Fumées',
        type: 'Air',
        description: 'desc',
        lieu: 'Lyon',
        dateObservation: '2026-10-21',
        latitude: 45.7,
        longitude: 4.8
      }
    ]);

    component.selectedType.set('Air');
    expect(component.filteredPollutions().length).toBe(1);
    expect(component.filteredPollutions()[0].type).toBe('Air');
  });
});
