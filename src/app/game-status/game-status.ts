import { Component, effect, input, signal } from '@angular/core';
import type { GameLevel } from '../game-level';

@Component({
  imports: [],
  selector: 'app-game-status',
  styleUrl: './game-status.css',
  templateUrl: './game-status.html',
})
export class GameStatus {
  readonly money = input.required<number>();
  readonly level = input.required<GameLevel>();
  protected readonly moneyIncreased = signal(false);
  private previousMoney: number | undefined;

  constructor() {
    effect(onCleanup => {
      const currentMoney = this.money();
      const increased =
        this.previousMoney !== undefined && currentMoney > this.previousMoney;
      this.previousMoney = currentMoney;

      if (!increased) {
        this.moneyIncreased.set(false);
        return;
      }

      this.moneyIncreased.set(true);
      const timeout = setTimeout(() => this.moneyIncreased.set(false), 700);
      onCleanup(() => clearTimeout(timeout));
    });
  }
}
