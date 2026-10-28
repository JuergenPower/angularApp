import { Component, effect, input, output, signal, computed, untracked } from '@angular/core';
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

  private readonly failSound = new Audio('sounds/fail.mp3');
  private readonly successSound = new Audio('sounds/success.mp3');
  private readonly levelUpSound = new Audio('sounds/level-up.mp3');
  private readonly pickFlowerSound = new Audio('sounds/pick-flower.mp3');

  protected readonly devMutiplicator: number = 1;
  protected  bukettPrice: number = this.devMutiplicator * 2;
  protected readonly expPerTry: number = this.devMutiplicator * 7;
  protected readonly requiredExpPerLevel: number = 100;
  protected readonly maxLevel = signal(1);
  protected readonly currentExp = signal(0);
  protected readonly currentLevel = signal(1);
  protected readonly levelUpExp = signal(0);
  protected readonly probabilityToMakeBukett = computed(() => 0.1 * this.currentLevel());
  protected readonly probabilityToMakeBukettPercentage = computed(() =>
    Math.round(this.probabilityToMakeBukett() * 100),
  );
  protected chanceExtraFlower = 0;


  protected readonly isBusy = signal(false); // Indicates whether an action is currently in progress
  protected readonly activeAction = signal<'collecting' | 'processing' | 'selling' | null>(null);
  protected readonly activeActionDurationMs = signal(0);
  protected flowerCollectionDurationMs = 2000;
  protected processingDurationMs = 4000;
  protected bukettSellingDurationMs = 4000;
  protected bouquetDemandDurationMs = 60000;
  protected readonly bouquetDemandProgress = signal(0);

  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });

  protected readonly hadIdeaToSellBouquet = signal(false);
  protected readonly sellSignBought = signal(false);
  protected numberOfOptimizations = 0;
  protected readonly thingBought = signal(false);

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
        this.sellSignBought.set(true);
      },
    },
    {
      visible: () => this.sellSignBought(),
      id: 'book-arrange-skill-1',
      name: 'Buch: Blumen arrangieren',
      cost: 5,
      tooltip: 'Ermöglicht den "Arrangier Skill" zu verbessern',
      action: () => {
        this.maxLevel.set(5);
      },
    },
    // Optimization phase 1
    {
      visible: () => this.maxLevel() > 1,
      id: 'scissors',
      name: 'Gartenschere',
      cost: 3,
      tooltip: '- 0,5 s Pflückgeschwindigkeit',
      action: () => {
        this.flowerCollectionDurationMs -= 500;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 1,
      id: 'wire',
      name: 'Blumendraht',
      cost: 4,
      tooltip: '- 1 s Blumen arrangieren',
      action: () => {
        this.processingDurationMs -= 1000;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 1,
      id: 'small-table',
      name: 'Kleiner Verkaufstisch',
      cost: 8,
      tooltip: '- 1 s Bukett verkaufen',
      action: () => {
        this.bukettSellingDurationMs -= 1000;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 1,
      id: 'faster-demand-1',
      name: 'Handgeschriebenes Werbeplakat',
      cost: 3.5,
      tooltip: '10 s schnellere Nachfrage',
      action: () => {
        this.bouquetDemandDurationMs -= 10000;
        this.numberOfOptimizations++;
        this.shopOffers.update(offers => offers.map(o => {
          if(o.id === 'faster-demand-2') o.visible = () =>true; return o
        }));
      },
    },
    {
      visible: () => false,
      id: 'faster-demand-2',
      name: 'Bunte Wimpelkette',
      cost: 9.5,
      tooltip: '10 s schnellere Nachfrage',
      action: () => {
        this.bouquetDemandDurationMs -= 10000;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 1,
      id: 'sun-umbrella',
      name: 'Sonnenschirm',
      cost: 7.5,
      tooltip: '+1 maximale Nachfrage',
      action: () => {
        this.maxBouquetDemand.set(this.maxBouquetDemand() + 1);
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 1,
      id: 'ribbon',
      name: 'Dekoratives Geschenkband',
      cost: 6.5,
      tooltip: '+ 0,5 Euro Bukett Preis',
      action: () => {
        this.bukettPrice += 0.5;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 1,
      id: 'small-bucket',
      name: 'Kleiner Blumeneimer',
      cost: 5,
      tooltip: '+ 1 Blumenmaximum',
      action: () => {
        this.flowerMax.set(this.flowerMax() + 1);
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 1,
      id: 'vase',
      name: 'Vase',
      cost: 4,
      tooltip: '+ 1 Bukettmaximum',
      action: () => {
        this.bouquetMax.set(this.bouquetMax() + 1);
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.numberOfOptimizations >= 7,
      id: 'book-arrange-skill-2',
      name: 'Buch: Floristik für Fortgeschrittene',
      cost: 10,
      tooltip: '+5 max. "Arrangier Skill"',
      action: () => {
        this.maxLevel.set(this.maxLevel() + 5);
      },
    },
    // Optimization phase 2:
    {
      visible: () => this.maxLevel() > 5,
      id: 'profi-scissors',
      name: 'Profi-Gartenschere',
      cost: 9,
      tooltip: '- 0,5 s Pflückgeschwindigkeit',
      action: () => {
        this.flowerCollectionDurationMs -= 500;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 5,
      id: 'florist-knife',
      name: 'Floristenmesser',
      cost: 8.5,
      tooltip: '- 1 s Arrangierzeit',
      action: () => {
        this.processingDurationMs -= 1000;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 5,
      id: 'market-stand',
      name: 'Klappbarer Marktstand',
      cost: 8.5,
      tooltip: '- 1 s Verkaufzeit',
      action: () => {
        this.bukettSellingDurationMs -= 1000;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 5,
      id: 'faster-demand-3',
      name: 'Werbeflyer',
      cost: 12.5,
      tooltip: '10 s schnellere Nachfrage',
      action: () => {
        this.bouquetDemandDurationMs -= 10000;
        this.numberOfOptimizations++;
        this.shopOffers.update(offers => offers.map(o => {
          if(o.id === 'faster-demand-4') o.visible = () =>true; return o
        }));
      },
    },
    {
      visible: () => false,
      id: 'faster-demand-4',
      name: 'Kreidetafel mit Blumenangebot',
      cost: 16,
      tooltip: '10 s schnellere Nachfrage',
      action: () => {
        this.bouquetDemandDurationMs -= 10000;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 5,
      id: 'decoration',
      name: 'Dekoration',
      cost: 11,
      tooltip: '+ 1 maximale Nachfrage',
      action: () => {
        this.maxBouquetDemand.set(this.maxBouquetDemand() + 1);
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 5,
      id: 'ribbon-2',
      name: 'Hochwertiges Seidenband',
      cost: 15,
      tooltip: '+ 0,5 Bukett Preis',
      action: () => {
        this.bukettPrice += 0.5;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.maxLevel() > 5,
      id: 'basket',
      name: 'Blumenkorb',
      cost: 13,
      tooltip: '20 % Chance auf Extrablume beim Pflücken',
      action: () => {
        this.chanceExtraFlower += 0.2;
        this.numberOfOptimizations++;
      },
    },
    {
      visible: () => this.numberOfOptimizations > 15,
      id: '???',
      name: '?????',
      cost: 20,
      tooltip: 'Dummy Voraussetzung für Level 4',
      action: () => {
        this.thingBought.set(true);
      },
    },
  ]);

  constructor() {
    effect(onCleanup => {
      const maxDemand = this.maxBouquetDemand();
      const currentDemand = this.currentBouquetDemand();

      if (maxDemand <= currentDemand) {
        return;
      }

      const durationMs = Math.max(1, this.bouquetDemandDurationMs);
      const initialProgress = untracked(() => this.bouquetDemandProgress());
      const startedAt = performance.now();
      const interval = setInterval(() => {
        const elapsedMs = performance.now() - startedAt;
        const progress = Math.min(initialProgress + (elapsedMs / durationMs) * 100, 100);
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

  protected collectFlower(): void {
    if (this.flowerCount() >= this.flowerMax()) {
      return;
    }

    this.pickFlowerSound.currentTime = 0;
    this.pickFlowerSound.play().catch((error: unknown) => {
      console.error('Could not play the success sound.', error);
    });

    this.runTimedAction(
      this.flowerCollectionDurationMs,
      'collecting',
      () => {
        let numFlowersToAdd = 1;
        if (Math.random() < this.chanceExtraFlower) numFlowersToAdd++;
        this.flowerCount.update(count =>
          Math.min(count + numFlowersToAdd, this.flowerMax()),
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
      this.currentBouquetDemand.set(this.currentBouquetDemand() - numBouquetsToSell);
      this.earnMoney.emit(amountEarned);
    });
  }

  private earnExperience(amount: number): boolean {

    let levelUp = false;
    if (this.currentLevel() >= this.maxLevel()) {
      this.currentExp.set(0);
      return levelUp;
    }
    this.currentExp.update(experience => experience + amount);

    while (
      this.currentExp() >= this.requiredExpPerLevel &&
      this.currentLevel() < this.maxLevel()) {
      this.currentExp.update(experience => experience - this.requiredExpPerLevel,);
      this.currentLevel.update(level => level + 1);
      levelUp = true;
    }

    if (this.currentLevel() >= this.maxLevel()) {
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

  protected unlockNextLevel(): void {
    if (this.thingBought()) {
      this.unlockLevel.emit(4);
    }
  }
}
