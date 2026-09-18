import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

@Component({
  selector: 'app-timespan-row',
  templateUrl: './timespan-row.component.html',
  styleUrls: ['./timespan-row.component.css']
})
export class TimespanRowComponent {

  @Input() index = 0;
  @Input() value!: Date;
  @Input() invalid = false;
  @Output() valueChange = new EventEmitter<Date>();

  @ViewChild('timeInput') private timeInputRef?: ElementRef<HTMLInputElement>;

  public get label(): string {
    return this.index % 2 === 0 ? 'Ingresso' : 'Uscita';
  }

  public get timeValue(): string {
    return this.value ? `${pad(this.value.getHours())}:${pad(this.value.getMinutes())}` : '';
  }

  public onTimeChange(raw: string): void {
    if (!raw) {
      return;
    }
    const [hours, minutes] = raw.split(':').map(Number);
    // Preserva la data (anno/mese/giorno) della timbratura esistente, o oggi se non ancora impostata.
    const base = this.value ?? new Date();
    this.valueChange.emit(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0, 0));
  }

  public focus(): void {
    this.timeInputRef?.nativeElement.focus();
    this.timeInputRef?.nativeElement.select();
  }
}
