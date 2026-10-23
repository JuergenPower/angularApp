import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Level1 } from './level-1/level-1';
import { Level2 } from './level-2/level-2';
import { Level3 } from './level-3/level-3';
import { GameStatus } from './game-status/game-status';
import { GAME_LEVELS, type GameLevel } from './interfaces';


@Component({
  imports: [RouterOutlet, Level1, Level2, Level3, GameStatus],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('angular-app');
  protected readonly money = signal(0);
  protected readonly numberOfUnlockedLevels = signal(2);
  protected readonly unlockedLevels = computed(() =>
    GAME_LEVELS.slice(0, this.numberOfUnlockedLevels()),
  );
  protected readonly currentLevel = signal<GameLevel>('level-2');
  private readonly cashRegisterSound = new Audio('/sounds/cash-register.mp3');

  protected addMoney(amount: number): void {
    this.money.update(currentMoney => this.roundMoney(currentMoney + amount));

    if (amount > 0) {
      this.cashRegisterSound.currentTime = 0;
      this.cashRegisterSound.play().catch((error: unknown) => {
        console.error('Could not play the cash-register sound.', error);
      });
    }
  }

  protected spendMoney(amount: number): void {
    if (amount <= 0 || amount > this.money()) {
      return;
    }

    this.money.update(currentMoney => this.roundMoney(currentMoney - amount));
  }

  protected unlockLevel(levelNumber: number): void {
    if (
      Number.isInteger(levelNumber) &&
      levelNumber > this.numberOfUnlockedLevels() &&
      levelNumber <= GAME_LEVELS.length
    ) {
      this.numberOfUnlockedLevels.set(levelNumber);
    }
  }

  private roundMoney(amount: number): number {
    // Keep the stored balance accurate to cents despite floating-point precision.
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }
}
