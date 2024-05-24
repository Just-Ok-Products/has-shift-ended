import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-monthly-planning',
  templateUrl: './monthly-planning.component.html',
  styleUrls: ['./monthly-planning.component.css']
})
export class MonthlyPlanningComponent implements OnInit {

  private now = new Date();

  public months: string[] = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  public currentMonth: string = this.months[this.now.getMonth()]

  public days: number = 31;
  public rows: any[] | undefined;
  public cols: string[] = ['Days', 'E', 'U']

  constructor() { }

  ngOnInit() {
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

}
