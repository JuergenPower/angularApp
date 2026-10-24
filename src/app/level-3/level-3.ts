import { Component, effect, input, output, signal, computed } from '@angular/core';
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
  protected readonly bouquetCount = signal(0);
  protected readonly bouquetMax = signal(2);
  protected readonly currentBouquetDemand = signal(0);
  protected readonly maxBouquetDemand = signal(0);

  private readonly failSound = new Audio('/sounds/fail.mp3');
  private readonly successSound = new Audio('/sounds/success.mp3');
  private readonly levelUpSound = new Audio('/sounds/level-up.mp3');

  protected readonly devMutiplicator: number = 10;
  protected  bukettPrice: number = this.devMutiplicator * 2;
  protected readonly expPerTry: number = this.devMutiplicator * 7;
  protected readonly requiredExpPerLevel: number = 100;
  protected readonly maxLevel: number = 10;
  protected readonly currentExp = signal(0);
  protected readonly currentLevel = signal(1);
  protected readonly levelUpExp = signal(0);
  protected readonly probabilityToMakeBukett = computed(() => 0.1 * this.currentLevel());
  protected readonly probabilityToMakeBukettPercentage = computed(() =>
    Math.round(this.probabilityToMakeBukett() * 100),
  );


  protected readonly isBusy = signal(false); // Indicates whether an action is currently in progress
  protected readonly activeAction = signal<'collecting' | 'processing' | 'selling' | null>(null);
  protected readonly activeActionDurationMs = signal(0);
  protected flowerCollectionDurationMs = 2000;
  protected processingDurationMs = 4000;
  protected bukettSellingDurationMs = 4000;
  protected bouquetDemandDurationMs = 60000;
  protected readonly bouquetDemandProgress = signal(0);

  constructor() {
    effect(onCleanup => {
      const maxDemand = this.maxBouquetDemand();
      const currentDemand = this.currentBouquetDemand();

      if (maxDemand <= currentDemand) {
        this.bouquetDemandProgress.set(0);
        return;
      }

      const durationMs = Math.max(1, this.bouquetDemandDurationMs);
      const startedAt = performance.now();
      const interval = setInterval(() => {
        const elapsedMs = performance.now() - startedAt;
        const progress = Math.min((elapsedMs / durationMs) * 100, 100);
        this.bouquetDemandProgress.set(progress);

        if (progress >= 100) {
          clearInterval(interval);
          this.bouquetDemandProgress.set(0);
          this.currentBouquetDemand.update(demand =>
            Math.min(demand + 1, this.maxBouquetDemand()),
          );
        }
      }, 50);

      onCleanup(() => clearInterval(interval));
    });
  }

  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });

  protected readonly hadIdeaToSellBouquet = signal(false);

  protected readonly shopOffers = signal<ShopOffer[]>([
    {
      visible: () => this.flowerCount() >= 3,
      id: 'idea-bouquet',
      name: 'Idee: Bukett arrangieren',
      cost: 0,
      tooltip: 'Just try it!',
      action: () => {
        this.hadIdeaToSellBouquet.set(true);
      },
    },
    {
      visible: () => this.bouquetCount() > 0,
      id: 'sell-sign',
      name: '"Zu verkaufen Pappschild"',
      cost: 0,
      tooltip: 'Sollte Nachfrage nach Buketts erzeugen',
      action: () => {
        this.maxBouquetDemand.set(1);
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
      this.bouquetCount() >= this.bouquetMax()
    ) {
      return;
    }

    this.runTimedAction(this.processingDurationMs, 'processing', () => {
      this.flowerCount.update(count => count - 3);
      const leveledUp = this.earnExperience(this.expPerTry);
      if (Math.random() < this.probabilityToMakeBukett()) {
        this.bouquetCount.update(count =>
          Math.min(count + 1, this.bouquetMax()),
        );
        if (!leveledUp){
          this.successSound.currentTime = 0;
          this.successSound.play().catch((error: unknown) => {
            console.error('Could not play the success sound.', error);
          });
        }
        if (!this.hadIdeaToSellBouquet())
          this.hadIdeaToSellBouquet.set(true);
      }
      else if (!leveledUp)
      {
        this.failSound.currentTime = 0;
        this.failSound.play().catch((error: unknown) => {
          console.error('Could not play the fail sound.', error);
        });
      }
    });
  }

  protected sellBuketts(): void {
    const numBouquetsToSell = Math.min(this.bouquetCount(), this.currentBouquetDemand());
    const amountEarned = numBouquetsToSell * this.bukettPrice;
    this.runTimedAction(this.bukettSellingDurationMs, 'selling', () => {
      this.bouquetCount.set(this.bouquetCount() - numBouquetsToSell);
      this.earnMoney.emit(amountEarned);
    });
  }

  private earnExperience(amount: number): boolean {

    let levelUp = false;
    if (this.currentLevel() >= this.maxLevel) {
      this.currentExp.set(0);
      return levelUp;
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
      levelUp = true;
    }

    if (this.currentLevel() >= this.maxLevel) {
      this.currentExp.set(0);
    }
    if (levelUp){
      this.levelUpSound.currentTime = 0;
      this.levelUpSound.play().catch((error: unknown) => {
        console.error('Could not play the level up sound.', error);
      });
    }
    return levelUp;
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
