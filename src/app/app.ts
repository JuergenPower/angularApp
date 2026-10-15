import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DepositBottles } from './deposit-bottles/deposit-bottles';
import { GameStatus } from './game-status/game-status';
import { GameLevel } from './game-level';


@Component({
  imports: [RouterOutlet, DepositBottles, GameStatus],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('angular-app');
  protected readonly money = signal(0);
  protected readonly currentLevel = signal<GameLevel>('bottle-collector');
  private readonly cashRegisterSound = new Audio('/sounds/cash-register.mp3');

  protected addMoney(amount: number): void {
    this.money.update(currentMoney => currentMoney + amount);

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

    this.money.update(currentMoney => currentMoney - amount);
  }
}
