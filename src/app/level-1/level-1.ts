import { Component, input, output, signal } from '@angular/core';
import type { ShopOffer } from '../interfaces';

type ActiveAction = 'collecting' | 'extracting' | 'rolling' | 'selling' | 'smoking';

@Component({
  imports: [],
  selector: 'app-level-1',
  styleUrls: ['../shared/level-common.css', './level-1.css'],
  templateUrl: './level-1.html',
})
export class Level1 {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  readonly earnMoney = output<number>();
  readonly unlockLevel = output<number>();
  protected readonly buttCount = signal(0);
  protected readonly buttMaxCount = signal(3);
  protected readonly tobaccoResiduesCount = signal(0);
  protected readonly tobaccoResiduesMaxCount = signal(3);
  protected readonly cigarettesCount = signal(0);

  // Preconditions
  protected readonly enableQuitSmoking = signal(false);
  protected readonly quitSmoking = signal(false);
  protected readonly numberOfOptimizations = signal(0);
  protected readonly rollingEnabled = signal(false);
  protected readonly jacketOwned = signal(false);


  protected readonly isBusy = signal(false);
  protected readonly activeAction = signal<ActiveAction | null>(null);
  protected readonly activeActionDurationMs = signal(0);
  protected buttCollectionDurationMs = 2000;
  protected extractingDurationMs = 5000;
  protected sellStuffDurationMs = 8000;
  protected rollingDurationMs = 8000;

  protected readonly devSellPriceMultiplier: number = 1;
  protected readonly tobaccoResiduePrice = this.devSellPriceMultiplier * 0.1;
  protected  cigarettePrice = this.devSellPriceMultiplier * 0.3;

  
  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });

  // Shop offers available in this level
  protected readonly shopOffers = signal<ShopOffer[]>([
    {
      visible: () => this.enableQuitSmoking(),
      id: 'quit-smoking',
      name: 'Mit dem Rauchen aufhören',
      cost: 0,
      tooltip: 'Idee: Vielleicht könnte man etwas anderes mit den Stummeln machen',
      action: () => {
        this.quitSmoking.set(true);
      },
    },
    {
      visible: () => this.quitSmoking(),
      id: 'kronkorken',
      name: 'Kronkorken',
      cost: 0.5,
      tooltip: '+ 2 Stummel Tragekapazität',
      action: () => {
        this.buttMaxCount.set(this.buttMaxCount() + 2);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.quitSmoking(),
      id: 'plastic-zipper',
      name: 'Plastikzipper',
      cost: 1.0,
      tooltip: '+ 1 Tabakreste Tragekapazität',
      action: () => {
        this.tobaccoResiduesMaxCount.set(this.tobaccoResiduesMaxCount() + 1);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.quitSmoking(),
      id: 'newspaper-knee-pads',
      name: 'Zeitungs-Kniepolster',
      cost: 1.5,
      tooltip: '50 % schnelleres Sammeln von Stummeln',
      action: () => {
        this.buttCollectionDurationMs /= 2;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.quitSmoking(),
      id: 'stummel-ritzer',
      name: 'Stummelritzer',
      cost: 2,
      tooltip: '50 % schnelleres Tabak rausholen',
      action: () => {
        this.extractingDurationMs /= 2;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.quitSmoking(),
      id: 'tobacco-sieve',
      name: 'Tabaksieb',
      cost: 2.5,
      tooltip: '50 % schnelleres Verkaufen',
      action: () => {
        this.sellStuffDurationMs /= 2;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.quitSmoking(),
      id: 'small-bowl',
      name: 'Kleine Schale',
      cost: 2,
      tooltip: '+ 2 Stummel Tragekapazität',
      action: () => {
        this.buttMaxCount.set(this.buttMaxCount() + 2);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.quitSmoking(),
      id: 'small-bag',
      name: 'Kleiner Beutel',
      cost: 1.5,
      tooltip: '+ 1 Tabakreste Tragekapazität',
      action: () => {
        this.tobaccoResiduesMaxCount.set(this.tobaccoResiduesMaxCount() + 1);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.numberOfOptimizations() >= 7,
      id: 'papers',
      name: 'Papers',
      cost: 4,
      tooltip: 'Ermöglicht das Rollen von Zigaretten',
      action: () => {
        this.rollingEnabled.set(true);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'butt-bowl',
      name: 'Stummelschale',
      cost: 3,
      tooltip: '+ 2 Stummel Tragekapazität',
      action: () => {
        this.buttMaxCount.set(this.buttMaxCount() + 2);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'jute-bag',
      name: 'Jutebeutel',
      cost: 2.5,
      tooltip: '+ 1 Tabakreste Tragekapazität',
      action: () => {
        this.tobaccoResiduesMaxCount.set(this.tobaccoResiduesMaxCount() + 1);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'sales-book',
      name: 'Buch: Verkaufstaktiken',
      cost: 4,
      tooltip: '50 % schnelleres Verkaufen',
      action: () => {
        this.sellStuffDurationMs /= 2;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'rolling-machine',
      name: 'Drehmaschine',
      cost: 5,
      tooltip: '50 % schnelleres Zigarettenrollen',
      action: () => {
        this.rollingDurationMs /= 2;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'filters',
      name: 'Filter',
      cost: 3,
      tooltip: 'Filterzigaretten rollen: + 0.1 € pro Zigarette',
      action: () => {
        this.cigarettePrice += 0.1;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'cushion-knee-pads',
      name: 'Kissen-Kniepolster',
      cost: 4,
      tooltip: '50 % schnelleres Sammeln von Stummeln',
      action: () => {
        this.buttCollectionDurationMs /= 2;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'tobacco-extractor',
      name: 'Tabak-Extractor',
      cost: 3.5,
      tooltip: '50 % schnelleres Tabak rausholen',
      action: () => {
        this.extractingDurationMs /= 2;
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'butt-box',
      name: 'Stummelbox',
      cost: 4,
      tooltip: '+ 2 Stummel Tragekapazität',
      action: () => {
        this.buttMaxCount.set(this.buttMaxCount() + 2);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.rollingEnabled(),
      id: 'tobacco-bag',
      name: 'Tabakbeutel',
      cost: 3,
      tooltip: '+ 1 Tabakreste Tragekapazität',
      action: () => {
        this.tobaccoResiduesMaxCount.set(this.tobaccoResiduesMaxCount() + 1);
        this.numberOfOptimizations.set(this.numberOfOptimizations() + 1);
      },
    },
    {
      visible: () => this.numberOfOptimizations() >= 16,
      id: 'used-jacket',
      name: 'Gebrauchtes Jackett',
      cost: 10,
      tooltip: 'Style upgrade: Eröffnet neue Möglichkeiten',
      action: () => {
        this.jacketOwned.set(true);
      },
    },
  ]);

  protected collectButt(): void {
    if (this.buttCount() >= this.buttMaxCount()) {
      return;
    }

    this.runTimedAction(
      this.buttCollectionDurationMs,
      'collecting',
      () => {
        this.buttCount.update(count =>
          Math.min(count + 1, this.buttMaxCount()),
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

  protected smoke(): void {
    if (this.buttCount() < 1 || this.isBusy()) {
      return;
    }

    this.runTimedAction(5000, 'smoking', () => {
      this.buttCount.update(count => count - 1);
      this.enableQuitSmoking.set(true);
    });
  }

  protected extractTobacco(): void {
    const buttCount = this.buttCount();
    if (buttCount < 1) {
      return;
    }

    const residuesExtracted = Math.floor(buttCount / 2);

    this.runTimedAction(this.extractingDurationMs, 'extracting', () => {
      this.buttCount.set(0);
      this.tobaccoResiduesCount.update(
        count => Math.min(count + residuesExtracted, this.tobaccoResiduesMaxCount()),
      );
    });
  }

  protected sellTobacco(): void {
    const residuesToSell = this.tobaccoResiduesCount();
    if (residuesToSell < 1 || this.isBusy()) {
      return;
    }

    this.runTimedAction(this.sellStuffDurationMs, 'selling', () => {
      this.tobaccoResiduesCount.set(0);
      this.earnMoney.emit(residuesToSell * this.tobaccoResiduePrice);
    });
  }

  protected rollCigaretts(): void {
    const residuesToRoll = this.tobaccoResiduesCount();
    if (this.isBusy()) {
      return;
    }
    this.runTimedAction(this.rollingDurationMs, 'rolling', () => {
      this.tobaccoResiduesCount.set(0);
      this.cigarettesCount.update(count => count +Math.floor(residuesToRoll / 2));
    });
  }

  protected sellCigarettes(): void {
    const cigarettesToSell = this.cigarettesCount();
    if (cigarettesToSell < 1 || this.isBusy()) {
      return;
    }
    this.runTimedAction(this.sellStuffDurationMs, 'selling', () => {
      this.cigarettesCount.set(0);
      this.earnMoney.emit(cigarettesToSell * this.cigarettePrice);
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

  protected unlockNextLevel(): void {
    if (this.jacketOwned()) {
      this.unlockLevel.emit(2);
    }
  }

  private runTimedAction(
    durationMs: number,
    action: ActiveAction,
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
