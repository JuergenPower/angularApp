import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameStatus } from './game-status';

describe('GameStatus', () => {
  let component: GameStatus;
  let fixture: ComponentFixture<GameStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(GameStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
