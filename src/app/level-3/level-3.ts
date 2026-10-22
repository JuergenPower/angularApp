import { Component, input, output, signal } from '@angular/core';

interface ShopOffer {
  id: string;
  name: string;
  cost: number;
  tooltip: string;
  action: () => void;
}

@Component({
  imports: [],
  selector: 'app-level-3',
  styleUrl: '../shared/level-common.css',
  templateUrl: './level-3.html',
})
export class Level3 {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  readonly unlockLevel = output<number>();
  protected readonly bottleCount = signal(0);
  protected readonly bottleMaxCount = signal(2);
  protected readonly isBusy = signal(false);          // Indicates whether an action is currently in progress
  protected readonly activeAction = signal<'collecting' | 'redeeming' | null>(null);
  protected readonly activeActionDurationMs = signal(0);
  protected bottleCollectionDurationMs = 2000;
  protected redemptionDurationMs = 5000;
  readonly earnMoney = output<number>();
  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });
  protected readonly shopOffers = signal<ShopOffer[]>([
    { id: 'greifzange', name: 'Greifzange', cost: 10, tooltip: '50% schnelleres Flaschen sammeln', action: () => {this.bottleCollectionDurationMs /= 2} },
    { id: 'tasche', name: 'Tasche', cost: 5, tooltip: '+100% Flaschenkapazität', action: () => {this.bottleMaxCount.set(this.bottleMaxCount() * 2)} },
    { id: 'tretroller', name: 'Tretroller', cost: 30, tooltip: '50% schnelleres Pfand abholen', action: () => {this.redemptionDurationMs /= 2} },
    { id: 'schuhe', name: 'Schuhe', cost: 20, tooltip: '50% schnelleres Pfand abholen', action: () => {this.redemptionDurationMs /= 2} },
    { id: 'handschuhe', name: 'Handschuhe', cost: 5, tooltip: '50% schnelleres Flaschen sammeln', action: () => {this.bottleCollectionDurationMs /= 2} },
    { id: 'rucksack', name: 'Rucksack', cost: 15, tooltip: '+100% Flaschenkapazität', action: () => {this.bottleMaxCount.set(this.bottleMaxCount() * 2)} },
  ]);

  protected collectBottle(): void {
    if (this.bottleCount() >= this.bottleMaxCount()) {
      return;
    }

    this.runTimedAction(
      this.bottleCollectionDurationMs,
      'collecting',
      () => {
        this.bottleCount.update(count =>
          Math.min(count + 1, this.bottleMaxCount()),
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

  protected redeemBottles(): void {
    const amountEarned = this.bottleCount() * 2;

    this.runTimedAction(this.redemptionDurationMs, 'redeeming', () => {
      this.bottleCount.set(0);
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
