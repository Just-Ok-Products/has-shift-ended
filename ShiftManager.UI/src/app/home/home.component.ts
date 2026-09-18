import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TimespanRowData } from './Components/timespan-row/timespan-row.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from '../snackbar.service';
import { MealVoucherService } from './services/meal-voucher.service';
import { TrainSuggestionService } from '../shared/services/train-suggestion.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private _snackBar: SnackbarService,
    private _mealVoucherService: MealVoucherService,
    private _trainSuggestionService: TrainSuggestionService
  ) { }

  public intervals: Date[] = []
  public numberOfIntervals: number = 0;
  public hoursDue: number = 8;
  public onSetTimes: EventEmitter<null> = new EventEmitter();
  /** Riga grigia/disabilitata con l'orario di uscita suggerito (Parte F), null se non mostrabile. */
  public suggestedExitTime: Date | null = null;

  ngOnInit() {
  }

  public addInterval() {
    this.numberOfIntervals++;
    this.intervals.push(new Date());
  }

  public removeInterval() {
    if (this.numberOfIntervals > 0) {
      this.numberOfIntervals--;
      this.intervals.pop();
    }
  }

  public updateData(rowData: TimespanRowData) {
    this.intervals[rowData.index] = rowData.time;
  }

  public calcTimeSpent() {
    this.onSetTimes.emit();
    let timeSpent = 0
    for (let i = 0; i < this.intervals.length; i = i + 2) {
      const start = this.intervals[i];
      const end = this.intervals[i + 1];

      if (start > end) {
        this._snackBar.openSnackbar('Start timespan cannot be bigger than Stop timespan')
        return;
      }

      timeSpent += end.getTime() - start.getTime();
    }
    timeSpent = timeSpent / 1000 / 60 / 60;
    this.suggestedExitTime = this.computeSuggestedExitTime();
    const mealVoucherEarned = this._mealVoucherService.isMealVoucherEarned(this.intervals);
    const mealVoucherMessage = `Buono pasto: ${mealVoucherEarned ? 'raggiunto ✅' : 'non raggiunto ❌'}`;
    if (timeSpent >= this.hoursDue) {
      this._snackBar.openSnackbar(`Done with ${Math.floor((timeSpent - this.hoursDue) * 60)} minutes to spare. ${mealVoucherMessage}`);
    } else {
      let splittedTime = (timeSpent + '').split('.');
      if (splittedTime.length != 2) {
        splittedTime.push('0');
      }
      let minutesMissing = (1 - parseFloat('0.' + splittedTime[1])) * 60;
      if (minutesMissing == 60) {
        this._snackBar.openSnackbar(`Missing ${this.hoursDue - Number(splittedTime[0])} hours. ${mealVoucherMessage}`);
      } else {
        this._snackBar.openSnackbar(`Missing ${this.hoursDue - Number(splittedTime[0]) - 1} ${this.hoursDue - Number(splittedTime[0]) - 1 == 1 ? 'hour' : 'hours'}
          and ${Math.round(minutesMissing)} minutes. ${mealVoucherMessage}`);
      }
    }
  }

  /**
   * Suggerimento treno (Parte F): null se l'utente non ha mai cercato treni in questa sessione,
   * o se hoursDue non viene raggiunto dagli intervalli inseriti, o se nessun treno è compatibile.
   */
  private computeSuggestedExitTime(): Date | null {
    if (!this._trainSuggestionService.hasSearched()) {
      return null;
    }
    const hoursDueReachedAt = this.computeHoursDueReachedAt();
    if (!hoursDueReachedAt) {
      return null;
    }
    return this._trainSuggestionService.getSuggestedDeparture(hoursDueReachedAt);
  }

  /** Momento in cui, sommando progressivamente gli intervalli, si raggiungono hoursDue ore. */
  private computeHoursDueReachedAt(): Date | null {
    let cumulativeHours = 0;
    for (let i = 0; i < this.intervals.length; i += 2) {
      const start = this.intervals[i];
      const end = this.intervals[i + 1];
      const pairHours = (end.getTime() - start.getTime()) / 3600000;
      if (cumulativeHours + pairHours >= this.hoursDue) {
        const remainingHours = this.hoursDue - cumulativeHours;
        return new Date(start.getTime() + remainingHours * 3600000);
      }
      cumulativeHours += pairHours;
    }
    return null;
  }

}
