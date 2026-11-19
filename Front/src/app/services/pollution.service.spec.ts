import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PollutionService } from './pollution.service';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';

describe('PollutionService', () => {
  let service: PollutionService;
  let httpTesting: HttpTestingController;
  const expectedEndpoint = `${environment.apiUrl}/pollutions`;

  const dummyPollutions: Pollution[] = [
    {
      id: 1,
      titre: 'Décharge sauvage',
      type: 'Dépôt sauvage',
      description: 'Déchets plastiques et gravats dans les bois',
      lieu: 'Fontainebleau',
      dateObservation: '2026-10-18',
      latitude: 48.4047,
      longitude: 2.7016,
      gravite: 'Critique',
      statut: 'En attente'
    },
    {
      id: 2,
      titre: 'Nappe hydrocarbures',
      type: 'Eau',
      description: 'Hydrocarbures sur la Seine',
      lieu: 'Rouen',
      dateObservation: '2026-10-19',
      latitude: 49.4432,
      longitude: 1.0999,
      gravite: 'Critique',
      statut: 'En cours'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PollutionService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PollutionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('devrait être initialisé', () => {
    expect(service).toBeTruthy();
  });

  it('1. GET /pollutions : devrait récupérer la liste des pollutions', () => {
    service.getPollutions().subscribe((data) => {
      expect(data.length).toBe(2);
      expect(data).toEqual(dummyPollutions);
    });

    const req = httpTesting.expectOne(expectedEndpoint);
    expect(req.request.method).toBe('GET');
    req.flush(dummyPollutions);
  });

  it('2. GET /pollutions/:id : devrait récupérer le détail d\'une pollution par ID', () => {
    const target = dummyPollutions[0];

    service.getPollutionById(1).subscribe((data) => {
      expect(data).toEqual(target);
      expect(data.id).toBe(1);
    });

    const req = httpTesting.expectOne(`${expectedEndpoint}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(target);
  });

  it('3. POST /pollutions : devrait créer une nouvelle pollution', () => {
    const newPollutionData: Partial<Pollution> = {
      titre: 'Fumées industrielles',
      type: 'Air',
      description: 'Odeur âcre et fumée noire',
      lieu: 'Feyzin',
      dateObservation: '2026-10-21',
      latitude: 45.6719,
      longitude: 4.8589
    };

    const createdPollution: Pollution = {
      ...newPollutionData,
      id: 3,
      titre: newPollutionData.titre!,
      type: newPollutionData.type!,
      description: newPollutionData.description!,
      lieu: newPollutionData.lieu!,
      dateObservation: newPollutionData.dateObservation!,
      latitude: newPollutionData.latitude!,
      longitude: newPollutionData.longitude!
    };

    service.createPollution(newPollutionData).subscribe((data) => {
      expect(data.id).toBe(3);
      expect(data.titre).toBe('Fumées industrielles');
    });

    const req = httpTesting.expectOne(expectedEndpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPollutionData);
    req.flush(createdPollution);
  });

  it('4. PUT /pollutions/:id : devrait mettre à jour une pollution existante', () => {
    const updatePayload: Partial<Pollution> = {
      titre: 'Titre mis à jour',
      statut: 'Traité'
    };

    const updatedResponse: Pollution = {
      ...dummyPollutions[0],
      ...updatePayload
    };

    service.updatePollution(1, updatePayload).subscribe((data) => {
      expect(data.titre).toBe('Titre mis à jour');
      expect(data.statut).toBe('Traité');
    });

    const req = httpTesting.expectOne(`${expectedEndpoint}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatePayload);
    req.flush(updatedResponse);
  });

  it('5. DELETE /pollutions/:id : devrait supprimer une pollution par son ID', () => {
    const mockDeleteResponse = {
      success: true,
      message: 'Pollution #1 supprimée avec succès',
      id: 1
    };

    service.deletePollution(1).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.id).toBe(1);
    });

    const req = httpTesting.expectOne(`${expectedEndpoint}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDeleteResponse);
  });
});
