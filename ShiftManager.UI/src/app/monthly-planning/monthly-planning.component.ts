import { DatePipe } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';

@Component({
  selector: 'app-monthly-planning',
  templateUrl: './monthly-planning.component.html',
  styleUrls: ['./monthly-planning.component.css']
})
export class MonthlyPlanningComponent implements OnInit {

  private now = new Date();

  public months: string[] = [];
  public currentMonth: string = this.getMonthName(this.now)

  public days: number = 31;
  public rows: any[] | undefined;
  public cols: string[] = ['Days', 'Movements']

  constructor(
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  private initMonths() {
    const date = new Date(2000, 0, 1); // Start from January 2000
    
    for (let i = 0; i < 12; i++) {
      date.setMonth(i);
      const monthName = this.getMonthName(date);
      this.months.push(monthName);
    }
  }

  ngOnInit() {
    this.initMonths();
    this.updateRows(this.currentMonth)
  }

  public updateRows(month: string) {
    let data = []
    this.days = new Date(this.now.getFullYear(), this.months.indexOf(month) + 1, 0).getDate()

    for (let i = 0; i < this.days; i++) {
      data.push(
        {Days: i + 1, E: '', U: ''}
      )
    }

    this.rows = data
  }

  private getMonthName(date: Date) {
    const monthName = this.datePipe.transform(date, 'LLLL', undefined, this.locale);
    return monthName ? monthName.toUpperCase() : 'Error loading month';
  }

}
