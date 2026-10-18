import { Component, effect, input, output, signal } from '@angular/core';
import type { GameLevel, GameLevelOption } from '../game-level';

@Component({
  imports: [],
  selector: 'app-game-status',
  styleUrl: './game-status.css',
  templateUrl: './game-status.html',
})
export class GameStatus {
  readonly money = input.required<number>();
  readonly level = input.required<GameLevel>();
  readonly levelOptions = input.required<readonly GameLevelOption[]>();
  readonly levelChange = output<GameLevel>();
  protected readonly moneyIncreased = signal(false);
  private previousMoney: number | undefined;

  protected changeLevel(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    const selectedLevel = target.value;
    const selectedOption = this.levelOptions().find(
      option => option.value === selectedLevel,
    );
    if (selectedOption) {
      this.levelChange.emit(selectedOption.value);
    }
  }

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
