import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollutionRecapComponent } from './pollution-recap.component';

describe('PollutionRecapComponent', () => {
  let component: PollutionRecapComponent;
  let fixture: ComponentFixture<PollutionRecapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionRecapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollutionRecapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
