import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-timespan-row',
  templateUrl: './timespan-row.component.html',
  styleUrls: ['./timespan-row.component.css']
})
export class TimespanRowComponent implements OnInit {

  @Input() index: number = 0;
  @Input() intervals: Date[] = [];
  @Output() onGetData: EventEmitter<TimespanRowData> = new EventEmitter();
  @Input() onSetTime: EventEmitter<null> | undefined;

  public hours: number = 0;
  public minutes: number = 0;

  private eventSubscription: Subscription | undefined

  constructor() { }

  ngOnInit() {
    this.eventSubscription = this.onSetTime?.subscribe(_ => {
      this.setValues();
    });
  }

  ngOndestroy() {
    this.eventSubscription?.unsubscribe();
  }

  public setValues() {
    const day = new Date().getDay();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const hour = this.hours;
    const minutes = this.minutes;

    this.intervals[this.index] = new Date(year, month, day, hour, minutes, 0);
  }

  public setTimeToNow() {
    const now = new Date();

    this.hours = now.getHours();
    this.minutes = now.getMinutes();
  }

}

export interface TimespanRowData {
  index: number,
  time: Date
}