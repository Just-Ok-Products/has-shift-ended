import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TimespanRowData } from './Components/timespan-row/timespan-row.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from '../snackbar.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private _snackBar: SnackbarService
  ) { }

  public intervals: Date[] = []
  public numberOfIntervals: number = 0;
  public hoursDue: number = 8;
  public onSetTimes: EventEmitter<null> = new EventEmitter();

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
    if (timeSpent >= this.hoursDue) {
      this._snackBar.openSnackbar(`Done with ${Math.floor((timeSpent - this.hoursDue) * 60)} minutes to spare`);
    } else {
      let splittedTime = (timeSpent + '').split('.');
      if (splittedTime.length != 2) {
        splittedTime.push('0');
      }
      let minutesMissing = (1 - parseFloat('0.' + splittedTime[1])) * 60;
      if (minutesMissing == 60) {
        this._snackBar.openSnackbar(`Missing ${this.hoursDue - Number(splittedTime[0])} hours`);
      } else {
        this._snackBar.openSnackbar(`Missing ${this.hoursDue - Number(splittedTime[0]) - 1} ${this.hoursDue - Number(splittedTime[0]) - 1 == 1 ? 'hour' : 'hours'} 
          and ${Math.round(minutesMissing)} minutes`);
      }
    }
  }

}
