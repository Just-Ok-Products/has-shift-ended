import { Injectable } from '@angular/core';
import { WorkInterval } from '../models/work-interval.model';

@Injectable({
  providedIn: 'root'
})
export class MealVoucherService {

  private readonly MORNING_MIN_MINUTES = 210;
  private readonly LUNCH_MIN_MINUTES = 30;
  private readonly AFTERNOON_MIN_MINUTES = 120;
  private readonly TOTAL_MIN_MINUTES = 420;
  private readonly LUNCH_WINDOW_START = '12:30';
  private readonly LUNCH_WINDOW_END = '14:30';

  public isMealVoucherEarned(intervals: Date[]): boolean {
    const workIntervals = this.toWorkIntervals(intervals);

    const lunchGapIndex = this.findLunchGapIndex(workIntervals);
    if (lunchGapIndex === -1) {
      return false;
    }

    const morning = this.sumMinutes(workIntervals.slice(0, lunchGapIndex + 1));
    const afternoon = this.sumMinutes(workIntervals.slice(lunchGapIndex + 1));
    const lunch = this.minutesBetween(workIntervals[lunchGapIndex].end, workIntervals[lunchGapIndex + 1].start);
    const total = this.sumMinutes(workIntervals);

    return morning >= this.MORNING_MIN_MINUTES
      && lunch >= this.LUNCH_MIN_MINUTES
      && afternoon >= this.AFTERNOON_MIN_MINUTES
      && total >= this.TOTAL_MIN_MINUTES;
  }

  private toWorkIntervals(intervals: Date[]): WorkInterval[] {
    const result: WorkInterval[] = [];
    for (let i = 0; i + 1 < intervals.length; i += 2) {
      result.push({ start: intervals[i], end: intervals[i + 1] });
    }
    return result;
  }

  // Trova il primo gap (in ordine cronologico) interamente contenuto nella finestra
  // pausa pranzo e di durata >= LUNCH_MIN_MINUTES. -1 se nessuno la soddisfa.
  private findLunchGapIndex(workIntervals: WorkInterval[]): number {
    const windowStart = this.parseMinutes(this.LUNCH_WINDOW_START);
    const windowEnd = this.parseMinutes(this.LUNCH_WINDOW_END);

    for (let i = 0; i < workIntervals.length - 1; i++) {
      const gapStart = workIntervals[i].end;
      const gapEnd = workIntervals[i + 1].start;
      const gapMinutes = this.minutesBetween(gapStart, gapEnd);

      if (gapMinutes >= this.LUNCH_MIN_MINUTES
        && this.minutesSinceMidnight(gapStart) >= windowStart
        && this.minutesSinceMidnight(gapEnd) <= windowEnd) {
        return i;
      }
    }

    return -1;
  }

  private sumMinutes(workIntervals: WorkInterval[]): number {
    return workIntervals.reduce((sum, interval) => sum + this.minutesBetween(interval.start, interval.end), 0);
  }

  private minutesBetween(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }

  private minutesSinceMidnight(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  private parseMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

}
