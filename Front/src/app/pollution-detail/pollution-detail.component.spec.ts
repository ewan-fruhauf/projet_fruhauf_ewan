import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PollutionDetailComponent } from './pollution-detail.component';

describe('PollutionDetailComponent', () => {
  let component: PollutionDetailComponent;
  let fixture: ComponentFixture<PollutionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  it('devrait générer un lien Google Maps valide', () => {
    const url = component.getMapsUrl(48.8566, 2.3522);
    expect(url).toBe('https://www.google.com/maps?q=48.8566,2.3522');
  });
});
