import { Component, input, output, signal } from '@angular/core';

interface ShopOffer {
  visible: boolean;
  id: string;
  name: string;
  cost: number;
  tooltip: string;
  action: () => void;
}

@Component({
  imports: [],
  selector: 'app-level-1',
  styleUrls: ['../shared/level-common.css', './level-1.css'],
  templateUrl: './level-1.html',
})
export class Level1 {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  protected readonly buttCount = signal(0);
  protected readonly buttMaxCount = signal(3);
  protected readonly tobaccoResiduesCount = signal(0);
  protected readonly tobaccoResiduesMaxCount = signal(3);
  protected readonly cigarettesCount = signal(0);
  protected readonly rollingEnabled = signal(false);



  protected readonly isBusy = signal(false);
  protected readonly activeAction = signal<'collecting' | 'extracting' | 'rolling' | 'selling' | null>(
    null,
  );
  protected readonly activeActionDurationMs = signal(0);
  protected buttCollectionDurationMs = 2000;
  protected extractingDurationMs = 5000;
  protected sellStuffDurationMs = 8000;
  protected rollingDurationMs = 8000;
  protected readonly tobaccoResiduePrice = 0.1;
  protected readonly cigarettePrice = 0.3;

  readonly earnMoney = output<number>();
  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;
  protected readonly buttonPosition = signal({ row: 5, column: 5 });
  protected readonly shopOffers = signal<ShopOffer[]>([
    {
      visible: true,
      id: 'stummel-greifzange',
      name: 'Stummel-Greifzange',
      cost: 10,
      tooltip: '50% schnelleres Stummel sammeln',
      action: () => {
        this.buttCollectionDurationMs /= 2;
      },
    },
    {
      visible: true,
      id: 'bierdeckel',
      name: 'Bierdeckel',
      cost: 0.5,
      tooltip: '+ 2 Stummel Tragekapazität',
      action: () => {
        this.buttMaxCount.set(this.buttMaxCount() + 2);
      },
    },
    {
      visible: true,
      id: 'papers',
      name: 'Papers',
      cost: 2,
      tooltip: 'Ermöglicht das Rollen von Zigaretten',
      action: () => {
        this.rollingEnabled.set(true);
      },
    },
    {
      visible: this.rollingEnabled(),
      id: 'rolling-machine',
      name: 'Drehmaschine',
      cost: 20,
      tooltip: '50 % schnelleres Zigarettenrollen',
      action: () => {
        this.rollingDurationMs /= 2;
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

  private runTimedAction(
    durationMs: number,
    action: 'collecting' | 'extracting' | 'rolling' | 'selling',
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
