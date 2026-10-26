import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';

type PlotState = 'empty' | 'planted' | 'germinated' | 'maturing' | 'mature';

interface Plot {
  id: number;
  state: PlotState;
  stateStartedAt: number;
}

@Component({
  imports: [],
  selector: 'app-level-4',
  styleUrls: ['../shared/level-common.css', './level-4.css'],
  templateUrl: './level-4.html',
})
export class Level4 {
  readonly money = input.required<number>();
  readonly purchaseRequested = output<number>();
  readonly earnMoney = output<number>();
  readonly unlockLevel = output<number>();

  protected readonly harvestedCount = signal(0);
  protected readonly plots = signal<Plot[]>(
    Array.from({ length: 27 }, (_, id) => ({
      id,
      state: 'empty',
      stateStartedAt: Date.now(),
    })),
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly growthStageDurationMs = 10000;

  constructor() {
    const intervalId = setInterval(() => this.advanceGrowth(Date.now()), 250);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  protected handlePlotClick(plotId: number): void {
    const plot = this.plots().find((candidate) => candidate.id === plotId);
    if (!plot) {
      return;
    }

    if (plot.state === 'empty') {
      this.updatePlot(plotId, {
        state: 'planted',
        stateStartedAt: Date.now(),
      });
    } else if (plot.state === 'mature') {
      this.harvestedCount.update((count) => count + 1);
      this.updatePlot(plotId, {
        state: 'empty',
        stateStartedAt: Date.now(),
      });
    }
  }

  protected stateLabel(state: PlotState): string {
    switch (state) {
      case 'empty':
        return 'Leer';
      case 'planted':
        return 'Gepflanzt';
      case 'germinated':
        return 'Gekeimt';
      case 'maturing':
        return 'Wachsend';
      case 'mature':
        return 'Erntereif';
    }
  }

  private advanceGrowth(now: number): void {
    if (
      !this.plots().some(
        (plot) =>
          plot.state === 'planted' || plot.state === 'germinated' || plot.state === 'maturing',
      )
    ) {
      return;
    }

    this.plots.update((plots) =>
      plots.map((plot) => {
        let nextPlot = plot;

        while (
          nextPlot.state !== 'empty' &&
          nextPlot.state !== 'mature' &&
          now - nextPlot.stateStartedAt >= this.growthStageDurationMs
        ) {
          nextPlot = {
            ...nextPlot,
            state: this.nextGrowthState(nextPlot.state),
            stateStartedAt: nextPlot.stateStartedAt + this.growthStageDurationMs,
          };
        }

        return nextPlot;
      }),
    );
  }

  private nextGrowthState(state: PlotState): PlotState {
    switch (state) {
      case 'planted':
        return 'germinated';
      case 'germinated':
        return 'maturing';
      case 'maturing':
        return 'mature';
      case 'empty':
      case 'mature':
        return state;
    }
  }

  private updatePlot(plotId: number, update: Pick<Plot, 'state' | 'stateStartedAt'>): void {
    this.plots.update((plots) =>
      plots.map((plot) => (plot.id === plotId ? { ...plot, ...update } : plot)),
    );
  }
}
