import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepositBottles } from './deposit-bottles';

describe('DepositBottles', () => {
  let component: DepositBottles;
  let fixture: ComponentFixture<DepositBottles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepositBottles],
    }).compileComponents();

    fixture = TestBed.createComponent(DepositBottles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
