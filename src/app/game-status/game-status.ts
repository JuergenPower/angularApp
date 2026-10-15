import { Component, input } from '@angular/core';
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
}
