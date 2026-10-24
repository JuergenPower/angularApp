import { Component, input, output, signal, computed } from '@angular/core';
import type { ShopOffer } from '../interfaces';

@Component({
  imports: [],
  selector: 'app-level-3',
  styleUrls: ['../shared/level-common.css', './level-3.css'],
  templateUrl: './level-3.html',
})
export class Level3 {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  readonly earnMoney = output<number>();
  readonly unlockLevel = output<number>();


  protected readonly flowerCount = signal(0);
  protected readonly flowerMax = signal(3);
  protected readonly bukettCount = signal(0);
  protected readonly bukettMax = signal(2);

  protected readonly devMutiplicator: number = 10;
  protected  bukettPrice: number = this.devMutiplicator * 2;
  protected readonly expPerTry: number = this.devMutiplicator * 13;
  protected readonly requiredExpPerLevel: number = 100;
  protected readonly maxLevel: number = 10;
  protected readonly currentExp = signal(0);
  protected readonly currentLevel = signal(1);
  protected readonly levelUpExp = signal(0);
  protected readonly probabilityToMakeBukett = computed(() => 0.1 * this.currentLevel());


  protected readonly isBusy = signal(false); // Indicates whether an action is currently in progress
  protected readonly activeAction = signal<'collecting' | 'processing' | 'selling' | null>(null);
  protected readonly activeActionDurationMs = signal(0);
  protected flowerCollectionDurationMs = 2000;
  protected processingDurationMs = 4000;
  protected bukettSellingDurationMs = 4000;

  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });

  protected readonly shopOffers = signal<ShopOffer[]>([
    {
      visible: () => true,
      id: 'quit-drinking',
      name: 'Idee: Mit dem Trinken aufhören',
      cost: 0,
      tooltip: 'Ermöglicht andere Möglichkeiten',
      action: () => {
        
      },
    },
  ]);

  protected collectFlower(): void {
    if (this.flowerCount() >= this.flowerMax()) {
      return;
    }

    this.runTimedAction(
      this.flowerCollectionDurationMs,
      'collecting',
      () => {
        this.flowerCount.update(count =>
          Math.min(count + 1, this.flowerMax()),
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

  protected arrangeBouquet(): void {
    if (
      this.isBusy() ||
      this.flowerCount() < 3 ||
      this.bukettCount() >= this.bukettMax()
    ) {
      return;
    }

    this.runTimedAction(this.processingDurationMs, 'processing', () => {
      this.flowerCount.update(count => count - 3);
      this.earnExperience(this.expPerTry);
      if (Math.random() < this.probabilityToMakeBukett()) {
        this.bukettCount.update(count =>
          Math.min(count + 1, this.bukettMax()),
        );
      }
    });
  }

  protected sellBuketts(): void {
    const amountEarned = this.bukettCount() * this.bukettPrice;

    this.runTimedAction(this.bukettSellingDurationMs, 'selling', () => {
      this.bukettCount.set(0);
      this.earnMoney.emit(amountEarned);
    });
  }

  private earnExperience(amount: number): void {
    if (this.currentLevel() >= this.maxLevel) {
      this.currentExp.set(0);
      return;
    }

    this.currentExp.update(experience => experience + amount);

    while (
      this.currentExp() >= this.requiredExpPerLevel &&
      this.currentLevel() < this.maxLevel
    ) {
      this.currentExp.update(
        experience => experience - this.requiredExpPerLevel,
      );
      this.currentLevel.update(level => level + 1);
    }

    if (this.currentLevel() >= this.maxLevel) {
      this.currentExp.set(0);
    }
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
    action: 'collecting' | 'processing' | 'selling',
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
