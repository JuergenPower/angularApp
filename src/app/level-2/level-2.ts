import { Component, input, output, signal } from '@angular/core';
import type { ShopOffer } from '../interfaces';

@Component({
  imports: [],
  selector: 'app-level-2',
  styleUrl: '../shared/level-common.css',
  templateUrl: './level-2.html',
})
export class Level2 {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  readonly unlockLevel = output<number>();
  protected readonly canCount = signal(0);
  protected readonly canMaxCount = signal(2);
  protected readonly isBusy = signal(false);          // Indicates whether an action is currently in progress
  protected readonly activeAction = signal<'collecting' | 'redeeming' | null>(null);
  protected readonly activeActionDurationMs = signal(0);
  protected canCollectionDurationMs = 2000;
  protected redemptionDurationMs = 5000;
  readonly earnMoney = output<number>();
  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });
  protected readonly shopOffers = signal<ShopOffer[]>([
    {
      visible: () => true,
      id: 'can-magnet',
      name: 'Dosenmagnet',
      cost: 5,
      tooltip: '50% schnelleres Dosen sammeln',
      action: () => {
        this.canCollectionDurationMs /= 2;
      },
    },
  ]);

  protected collectCan(): void {
    if (this.canCount() >= this.canMaxCount()) {
      return;
    }

    this.runTimedAction(
      this.canCollectionDurationMs,
      'collecting',
      () => {
        this.canCount.update(count =>
          Math.min(count + 1, this.canMaxCount()),
        );

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
      },
    );
  }

  protected redeemCans(): void {
    const amountEarned = this.canCount() * 2;

    this.runTimedAction(this.redemptionDurationMs, 'redeeming', () => {
      this.canCount.set(0);
      this.earnMoney.emit(amountEarned);
    });
  }

  protected buyOffer(offer: ShopOffer): void {
    if (this.money() < offer.cost) {
      return;
    }

    this.shopOffers.update(offers =>
      offers.filter(currentOffer => currentOffer.id !== offer.id),
    );
    this.purchaseRequested.emit(offer.cost);
    offer.action();
  }

  private runTimedAction(
    durationMs: number,
    action: 'collecting' | 'redeeming',
    onComplete: () => void,
  ): void {
    if (this.isBusy()) {
      return;
    }

    this.isBusy.set(true);
    this.activeAction.set(action);
    this.activeActionDurationMs.set(durationMs);

    setTimeout(() => {
      try {
        onComplete();
      } finally {
        this.activeAction.set(null);
        this.isBusy.set(false);
      }
    }, durationMs);
  }
}
