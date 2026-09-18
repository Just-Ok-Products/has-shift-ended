import { Component, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { TimespanRowComponent } from './Components/timespan-row/timespan-row.component';
import { DayCalculatorService, DayState } from './services/day-calculator.service';
import { MealVoucherDetail, MealVoucherService } from './services/meal-voucher.service';
import { TrainSuggestionService } from '../shared/services/train-suggestion.service';
import { TrainSuggestionView } from './Components/day-hero/day-hero.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

  @ViewChildren(TimespanRowComponent) rows!: QueryList<TimespanRowComponent>;

  public intervals: Date[] = [];
  public hoursDue = 8;
  public dayState: DayState;
  public mealVoucherDetail: MealVoucherDetail;
  public trainSuggestion: TrainSuggestionView = { hasSearched: false, suggestedExitTime: null };

  private tickTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private _dayCalculator: DayCalculatorService,
    private _mealVoucherService: MealVoucherService,
    private _trainSuggestionService: TrainSuggestionService
  ) {
    this.dayState = this._dayCalculator.compute(this.intervals, this.hoursDue);
    this.mealVoucherDetail = this._mealVoucherService.getDetail(this.intervals);
  }

  ngOnDestroy(): void {
    this.clearTick();
  }

  public addInterval(): void {
    this.intervals.push(new Date());
    this.recompute();
    setTimeout(() => this.rows.last?.focus());
  }

  public removeLastInterval(): void {
    if (this.intervals.length === 0) {
      return;
    }
    this.intervals.pop();
    this.recompute();
  }

  public onIntervalChange(index: number, value: Date): void {
    this.intervals[index] = value;
    this.recompute();
  }

  public onHoursDueChange(value: number): void {
    this.hoursDue = value;
    this.recompute();
  }

  public isInvalid(index: number): boolean {
    return this.dayState.invalidIndexes.includes(index);
  }

  private recompute(): void {
    const now = new Date();
    this.dayState = this._dayCalculator.compute(this.intervals, this.hoursDue, now);
    this.mealVoucherDetail = this._mealVoucherService.getDetail(this.intervals);
    this.trainSuggestion = this.computeTrainSuggestion(now);
    this.syncTick();
  }

  private computeTrainSuggestion(now: Date): TrainSuggestionView {
    const hasSearched = this._trainSuggestionService.hasSearched();
    if (!hasSearched || this.dayState.status === 'incoherent') {
      return { hasSearched, suggestedExitTime: null };
    }
    const threshold = this.computeHoursDueReachedAt(now);
    const suggestedExitTime = threshold ? this._trainSuggestionService.getSuggestedDeparture(threshold) : null;
    return { hasSearched, suggestedExitTime };
  }

  /** Momento in cui, sommando le timbrature (l'intervallo aperto conta fino a `now`), si raggiungono hoursDue ore. */
  private computeHoursDueReachedAt(now: Date): Date | null {
    const dueMinutes = Math.round(this.hoursDue * 60);
    let cumulativeMinutes = 0;

    const pairsCount = Math.floor(this.intervals.length / 2);
    for (let i = 0; i < pairsCount; i++) {
      const start = this.intervals[i * 2];
      const end = this.intervals[i * 2 + 1];
      const pairMinutes = this.minutesBetween(start, end);
      if (cumulativeMinutes + pairMinutes >= dueMinutes) {
        return new Date(start.getTime() + (dueMinutes - cumulativeMinutes) * 60000);
      }
      cumulativeMinutes += pairMinutes;
    }

    if (this.intervals.length % 2 === 1) {
      const openStart = this.intervals[this.intervals.length - 1];
      const openMinutes = this.minutesBetween(openStart, now);
      if (cumulativeMinutes + openMinutes >= dueMinutes) {
        return new Date(openStart.getTime() + (dueMinutes - cumulativeMinutes) * 60000);
      }
    }

    return null;
  }

  private minutesBetween(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }

  // Tick da 60s allineato al cambio di minuto, attivo solo in stato 'working': serve a
  // tenere aggiornati "ore fatte finora" e il passaggio automatico a 'done' col solo
  // passare del tempo. L'orario di uscita previsto è deterministico e non ne ha bisogno.
  private syncTick(): void {
    this.clearTick();
    if (this.dayState.status === 'working') {
      const delay = 60000 - (Date.now() % 60000);
      this.tickTimeout = setTimeout(() => this.recompute(), delay);
    }
  }

  private clearTick(): void {
    if (this.tickTimeout) {
      clearTimeout(this.tickTimeout);
      this.tickTimeout = null;
    }
  }
}
