import { Component, output, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-deposit-bottles',
  styleUrl: './deposit-bottles.css',
  templateUrl: './deposit-bottles.html',
})
export class DepositBottles {
  protected readonly bottleCount = signal(0);
  protected readonly bottleMaxCount = signal(2);
  protected readonly isRedeeming = signal(false);
  protected readonly redemptionDurationMs = 5000;
  readonly redeemed = output<number>();
  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });

  protected collectBottle(): void {
    this.bottleCount.update(count => Math.min(count + 1, this.bottleMaxCount()));

    const currentPosition = this.buttonPosition();
    const columnCount = 10;
    const rowCount = 10;
    const positionCount = columnCount * rowCount;
    const currentIndex =
      (currentPosition.row - 1) * columnCount + currentPosition.column - 1;
    const nextIndex =
      (currentIndex + 1 + Math.floor(Math.random() * (positionCount - 1))) %
      positionCount;

    this.buttonPosition.set({
      row: Math.floor(nextIndex / columnCount) + 1,
      column: (nextIndex % columnCount) + 1,
    });
  }

  protected redeemBottles(): void {
    if (this.isRedeeming()) {
      return;
    }

    this.isRedeeming.set(true);
    const amountEarned = this.bottleCount() * 0.25;

    setTimeout(() => {
      this.bottleCount.set(0);
      this.redeemed.emit(amountEarned);
      this.isRedeeming.set(false);
    }, this.redemptionDurationMs);
  }
}
