import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DayState } from '../../services/day-calculator.service';
import { MealVoucherDetail } from '../../services/meal-voucher.service';

export interface TrainSuggestionView {
  hasSearched: boolean;
  suggestedExitTime: Date | null;
}

@Component({
  selector: 'app-day-hero',
  templateUrl: './day-hero.component.html',
  styleUrls: ['./day-hero.component.css']
})
export class DayHeroComponent {

  @Input() state!: DayState;
  @Input() hoursDue = 8;
  @Input() mealVoucherDetail: MealVoucherDetail | null = null;
  @Input() trainSuggestion: TrainSuggestionView = { hasSearched: false, suggestedExitTime: null };

  @Output() hoursDueChange = new EventEmitter<number>();
  @Output() addTimbratura = new EventEmitter<void>();

  @ViewChild('hoursInput') hoursInputEl?: ElementRef<HTMLInputElement>;

  public editingHoursDue = false;
  public mealVoucherExpanded = false;

  public startEditingHoursDue(): void {
    this.editingHoursDue = true;
    setTimeout(() => {
      this.hoursInputEl?.nativeElement.focus();
      this.hoursInputEl?.nativeElement.select();
    });
  }

  public commitHoursDue(rawValue: string): void {
    const parsed = parseFloat(rawValue);
    if (!isNaN(parsed) && parsed > 0) {
      this.hoursDueChange.emit(parsed);
    }
    this.editingHoursDue = false;
  }

  public toggleMealVoucherDetail(): void {
    this.mealVoucherExpanded = !this.mealVoucherExpanded;
  }

  public formatHM(totalMinutes: number): string {
    const minutes = Math.max(0, Math.round(totalMinutes));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  public formatTime(date: Date | null): string {
    if (!date) {
      return '';
    }
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}
