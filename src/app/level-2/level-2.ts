import { Component, input, output, signal } from '@angular/core';
import type { ShopOffer } from '../interfaces';

type DepositFindType = 'glass-bottle' | 'can' | 'plastic-bottle';

interface DepositFindButton {
  type: DepositFindType;
  imageSrc: string;
  label: string;
  buttonPosition: { row: number; column: number };
}

const DEPOSIT_FIND_DETAILS: Record<DepositFindType,Pick<DepositFindButton, 'imageSrc' | 'label'>> = 
  {
  'glass-bottle': {
    imageSrc: '/images/glass-bottle.png',
    label: 'Glasflasche',
  },
  can: {
    imageSrc: '/images/can.png',
    label: 'Dose',
  },
  'plastic-bottle': {
    imageSrc: '/images/plastic-bottle.png',
    label: 'Plastikflasche',
  },
};

@Component({
  imports: [],
  selector: 'app-level-2',
  styleUrls: ['../shared/level-common.css', './level-2.css'],
  templateUrl: './level-2.html',
})
export class Level2 {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  readonly earnMoney = output<number>();
  readonly unlockLevel = output<number>();

  protected readonly devSellPriceMultiplier: number = 10;
  protected readonly glassBottleCount = signal(0);
  protected readonly glassBottleMax = signal(2);
  protected readonly glassBottleDeposit: number = this.devSellPriceMultiplier * 0.1;
  protected readonly canCount = signal(0);
  protected readonly canMax = signal(2);
  protected readonly canDeposit: number = this.devSellPriceMultiplier * 0.15;
  protected readonly plasticBottleCount = signal(0);
  protected readonly plasticBottleMax = signal(2);
  protected readonly plasticBottleDeposit: number = this.devSellPriceMultiplier * 0.25;
  protected readonly depositFindTypes: readonly DepositFindType[] = [
    'glass-bottle',
    'can',
    'plastic-bottle',
  ];
  protected readonly depositFindProbabilities: Record<DepositFindType, number> = {
    'glass-bottle': 1,
    'can': 0,
    'plastic-bottle': 0,
  };
  protected readonly depositFindButton = signal(
    this.createDepositFindButton({ row: 5, column: 5 }),
  );


  protected readonly isBusy = signal(false);          // Indicates whether an action is currently in progress
  protected readonly activeAction = signal<'collecting' | 'redeeming' | null>(null);
  protected readonly activeActionDurationMs = signal(0);

  protected collectionDurationMs = 2500;
  protected redemptionDurationMs = 5000;

  protected readonly meadowHeight = 360;
  protected readonly meadowMaxWidth = 640;

  // Level logic
  protected canQuitDrinking = signal(false);
  protected quitDrinking = signal(false);
  protected numOfOptimizations = 0;
  protected cansEnabled = signal(false);
  protected plasticBottlesEnabled = signal(false);
  protected shoppingCartEnabled = signal(false);
  protected capBought = signal(false);


  protected readonly shopOffers = signal<ShopOffer[]>([
    {
      visible: () => this.canQuitDrinking(),
      id: 'quit-drinking',
      name: 'Idee: Mit dem Trinken aufhören',
      cost: 0,
      tooltip: 'Ermöglicht andere Möglichkeiten',
      action: () => {
        this.quitDrinking.set(true);
      },
    },
    // Optimization phase 1:
    {
      visible: () => this.quitDrinking(),
      id: 'small-bag',
      name: 'Kleine Tüte',
      cost: 1,
      tooltip: '+1 Tragekapazität',
      action: () => {
        this.numOfOptimizations++;
        this.glassBottleMax.set(this.glassBottleMax() + 1);
      },
    },
    {
      visible: () => this.quitDrinking(),
      id: 'left-shoe',
      name: 'Gebrauchter linker Schuh',
      cost: 1.5,
      tooltip: '- 1s Pfandrückgabezeit',
      action: () => {
        this.numOfOptimizations++;
        this.redemptionDurationMs -= 1000;
      },
    },
    {
      visible: () => this.quitDrinking(),
      id: 'glove',
      name: 'Gummihandschuh',
      cost: 2,
      tooltip: '- 0,5s Sammelzeit',
      action: () => {
        this.numOfOptimizations++;
        this.collectionDurationMs -= 500;
      },
    },
    {
      visible: () => this.quitDrinking(),
      id: 'bottle-box',
      name: 'Flaschenkiste',
      cost: 1.5,
      tooltip: '+1 Tragekapazität',
      action: () => {
        this.numOfOptimizations++;
        this.glassBottleMax.set(this.glassBottleMax() + 1);
      },
    },
    {
      visible: () => this.numOfOptimizations >= 4,
      id: 'idea-cans',
      name: 'Idee: Auch Dosen sammeln',
      cost: 0,
      tooltip: 'Ermöglicht Dosensammeln',
      action: () => {
        this.cansEnabled.set(true);
        this.depositFindProbabilities['can'] = 0.5;
      },
    },
    // Optimization phase 2
    {
      visible: () => this.cansEnabled(),
      id: 'net',
      name: 'Tragenetz',
      cost: 1,
      tooltip: '+1 Dosen-Tragekapazität',
      action: () => {
        this.numOfOptimizations++;
        this.canMax.set(this.canMax() + 1);
      },
    },
    {
      visible: () => this.cansEnabled(),
      id: 'right-shoe',
      name: 'Gebrauchter rechter Schuh',
      cost: 1.5,
      tooltip: '- 1s Pfandrückgabezeit',
      action: () => {
        this.numOfOptimizations++;
        this.redemptionDurationMs -= 1000;
      },
    },
    {
      visible: () => this.cansEnabled(),
      id: 'knee-pad',
      name: 'Knieschoner',
      cost: 2,
      tooltip: '- 0,5 s Sammelzeit',
      action: () => {
        this.numOfOptimizations++;
        this.collectionDurationMs -= 500;
      },
    },
    {
      visible: () => this.cansEnabled(),
      id: 'new-route',
      name: 'Neue Route',
      cost: 2.5,
      tooltip: 'Höhere Wahrscheinlichkeit für Dosen',
      action: () => {
        this.numOfOptimizations++;
        this.depositFindProbabilities['can'] = 1;
      },
    },
    {
      visible: () => this.cansEnabled(),
      id: 'can-bag',
      name: 'Dosen-Sammelbehälter',
      cost: 1.5,
      tooltip: '+1 Dosen-Tragekapazität',
      action: () => {
        this.numOfOptimizations++;
        this.canMax.set(this.canMax() + 1);
      },
    },
    {
      visible: () => this.numOfOptimizations >= 9,
      id: 'idea-plastic-bottles',
      name: 'Idee: Auch Plastikflaschen sammeln',
      cost: 0,
      tooltip: 'Ermöglicht Plastikflaschen',
      action: () => {
        this.plasticBottlesEnabled.set(true);
        this.depositFindProbabilities['plastic-bottle'] = 1;
      },
    },
    // Optimization phase 3
    {
      visible: () => this.plasticBottlesEnabled(),
      id: 'cloth-bag',
      name: 'Stoffbeutel',
      cost: 2,
      tooltip: '+1 Plastikflaschen-Tragekapazität',
      action: () => {
        this.numOfOptimizations++;
        this.plasticBottleMax.set(this.plasticBottleMax() + 1);
      },
    },
    {
      visible: () => this.plasticBottlesEnabled(),
      id: 'shoelace',
      name: 'Schnürsenkel',
      cost: 2.5,
      tooltip: '- 1 s Pfandrückgabezeit',
      action: () => {
        this.numOfOptimizations++;
        this.redemptionDurationMs -= 1000;
      },
    },
    {
      visible: () => this.plasticBottlesEnabled(),
      id: 'grabber',
      name: 'Greifzange',
      cost: 3.5,
      tooltip: '- 0,5 s Sammelzeit',
      action: () => {
        this.numOfOptimizations++;
        this.collectionDurationMs -= 500;
      },
    },
    {
      visible: () => this.plasticBottlesEnabled(),
      id: 'trash-bag',
      name: 'Müllsack',
      cost: 2.5,
      tooltip: '+1 Plastikflaschen-Kapazität',
      action: () => {
        this.numOfOptimizations++;
        this.plasticBottleMax.set(this.plasticBottleMax() + 1);
      },
    },
    {
      visible: () => this.plasticBottlesEnabled(),
      id: 'optimize-route',
      name: 'Sammelroute optimieren',
      cost: 3,
      tooltip: 'Mehr Plastikflaschen',
      action: () => {
        this.plasticBottlesEnabled.set(true);
        this.numOfOptimizations++;
        this.depositFindProbabilities['plastic-bottle'] = 2;
      },
    },
    {
      visible: () => this.numOfOptimizations >= 14,
      id: 'shopping-cart',
      name: 'Einkaufswagen',
      cost: 5,
      tooltip: 'Gemeinsame Pfandrückgabe',
      action: () => {
        this.shoppingCartEnabled.set(true);
      },
    },
    {
      visible: () => this.shoppingCartEnabled(),
      id: 'posh-hat',
      name: 'Schicke Mütze',
      cost: 10,
      tooltip: 'Gepflegteres Aussehen eröffnet neue Möglichkeiten',
      action: () => {
        this.capBought.set(true);
      },
    },
  ]);

  protected collect(): void {
    const currentFind = this.depositFindButton();
    if (this.isBusy() || this.isFindAtCapacity(currentFind.type)) {
      return;
    }

    this.runTimedAction(
      this.collectionDurationMs,
      'collecting',
      () => {
        this.addFindToInventory(currentFind.type);
        const currentPosition = currentFind.buttonPosition;
        const columnCount = 10;
        const rowCount = 10;
        const positionCount = columnCount * rowCount;
        const currentIndex =
          (currentPosition.row - 1) * columnCount + currentPosition.column - 1;
        const nextIndex =
          (currentIndex + 1 + Math.floor(Math.random() * (positionCount - 1))) %
          positionCount;

        this.depositFindButton.set(
          this.createDepositFindButton({
            row: Math.floor(nextIndex / columnCount) + 1,
            column: (nextIndex % columnCount) + 1,
          }),
        );
      },
    );
  }

  private createDepositFindButton(
    buttonPosition: DepositFindButton['buttonPosition'],
  ): DepositFindButton {
    const availableTypes = this.depositFindTypes.filter(
      type => this.depositFindProbabilities[type] > 0,
    );
    const totalProbability = availableTypes.reduce(
      (total, type) => total + this.depositFindProbabilities[type],
      0,
    );

    if (totalProbability <= 0) {
      throw new Error('At least one deposit find type must have a positive probability.');
    }

    let randomValue = Math.random() * totalProbability;
    let selectedType: DepositFindType | undefined;

    for (const type of availableTypes) {
      randomValue -= this.depositFindProbabilities[type];
      if (randomValue < 0) {
        selectedType = type;
        break;
      }
    }

    selectedType ??= availableTypes[availableTypes.length - 1];
    if (!selectedType) {
      throw new Error('No deposit find type is available.');
    }

    return {
      type: selectedType,
      ...DEPOSIT_FIND_DETAILS[selectedType],
      buttonPosition,
    };
  }

  protected isFindAtCapacity(type: DepositFindType): boolean {
    switch (type) {
      case 'glass-bottle':
        return this.glassBottleCount() >= this.glassBottleMax();
      case 'can':
        return this.canCount() >= this.canMax();
      case 'plastic-bottle':
        return this.plasticBottleCount() >= this.plasticBottleMax();
    }
  }

  private addFindToInventory(type: DepositFindType): void {
    switch (type) {
      case 'glass-bottle':
        this.glassBottleCount.update(count =>
          Math.min(count + 1, this.glassBottleMax()),
        );
        break;
      case 'can':
        this.canCount.update(count => Math.min(count + 1, this.canMax()));
        break;
      case 'plastic-bottle':
        this.plasticBottleCount.update(count =>
          Math.min(count + 1, this.plasticBottleMax()),
        );
        break;
    }
  }

  protected redeemGlassBottles(): void {
    const amountEarned = this.glassBottleCount() * this.glassBottleDeposit;
    this.runTimedAction(this.redemptionDurationMs, 'redeeming', () => {
      this.glassBottleCount.set(0);
      this.earnMoney.emit(amountEarned);
    });
  }

  protected redeemCans(): void {
    const amountEarned = this.canCount() * this.canDeposit;
    this.runTimedAction(this.redemptionDurationMs, 'redeeming', () => {
      this.canCount.set(0);
      this.earnMoney.emit(amountEarned);
    });
  }

  protected redeemPlasticBottles(): void {
    const amountEarned = this.plasticBottleCount() * this.plasticBottleDeposit;
    this.runTimedAction(this.redemptionDurationMs, 'redeeming', () => {
      this.plasticBottleCount.set(0);
      this.earnMoney.emit(amountEarned);
    });
  }

  protected redeemAll(): void {
    const amountEarned = this.glassBottleCount() * this.glassBottleDeposit + 
      this.canCount() * this.canDeposit + 
      this.plasticBottleCount() * this.plasticBottleDeposit;
    this.runTimedAction(this.redemptionDurationMs, 'redeeming', () => {
      this.glassBottleCount.set(0);
      this.canCount.set(0);
      this.plasticBottleCount.set(0);
      this.earnMoney.emit(amountEarned);
    });
  }

  protected hasDeposits(): boolean {
    return this.glassBottleCount() > 0 || this.canCount() > 0 || this.plasticBottleCount() > 0;
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

  protected drinkBeer(): void {
    this.glassBottleCount.update(c => c - 1);
    this.canQuitDrinking.set(true);
  }

  protected unlockNextLevel(): void {
    if (this.capBought()) {
      this.unlockLevel.emit(3);
    }
  }
}
