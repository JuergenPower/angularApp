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
  selector: 'app-deposit-bottles',
  styleUrl: './deposit-bottles.css',
  templateUrl: './deposit-bottles.html',
})
export class DepositBottles {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  protected readonly bottleCount = signal(0);
  protected readonly bottleMaxCount = signal(2);
  protected readonly isBusy = signal(false);          // Indicates whether an action is currently in progress
  protected readonly activeAction = signal<'collecting' | 'redeeming' | null>(null);
  protected readonly activeActionDurationMs = signal(0);
  protected bottleCollectionDurationMs = 2000;
  protected redemptionDurationMs = 5000;
  readonly redeemed = output<number>();
  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });
  protected readonly shopOffers = signal<ShopOffer[]>([
    { id: 'collection-tool', name: 'Sammelwerkzeug', cost: 10, tooltip: 'Ermöglicht das Sammeln von Flaschen effizienter', action: () => {this.bottleCollectionDurationMs = 400} },
    { id: 'larger-bag', name: 'Tasche', cost: 5, tooltip: 'Ermöglicht das Sammeln von mehr Flaschen gleichzeitig', action: () => {this.bottleMaxCount.set(10)} },
    { id: 'tretroller', name: 'Tretroller', cost: 30, tooltip: 'Ermöglicht schnelleres Pfand abholen', action: () => {this.redemptionDurationMs = 2000} }
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
    const amountEarned = this.bottleCount() * 25;

    this.runTimedAction(this.redemptionDurationMs, 'redeeming', () => {
      this.bottleCount.set(0);
      this.redeemed.emit(amountEarned);
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
