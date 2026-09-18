import { Injectable } from '@angular/core';

export type DayStatus = 'empty' | 'incoherent' | 'working' | 'onBreak' | 'done';

export interface DayState {
  status: DayStatus;
  workedMinutes: number;
  dueMinutes: number;
  remainingMinutes: number;
  overtimeMinutes: number;
  expectedExitTime: Date | null;
  progress: number;
  invalidIndexes: number[];
}

/**
 * Stateless: da `intervals` (start/stop alternati) e `hoursDue` produce lo stato unico
 * consumato da hero, scena e badge. Tutti i calcoli in minuti interi, mai parsing di stringhe.
 */
@Injectable({
  providedIn: 'root'
})
export class DayCalculatorService {

  public compute(intervals: Date[], hoursDue: number, now: Date = new Date()): DayState {
    const dueMinutes = Math.round(hoursDue * 60);
    const invalidIndexes = this.findInvalidIndexes(intervals);

    if (invalidIndexes.length > 0) {
      return this.stateFor('incoherent', 0, dueMinutes, null, invalidIndexes);
    }

    if (intervals.length === 0) {
      return this.stateFor('empty', 0, dueMinutes, null, []);
    }

    const pairsCount = Math.floor(intervals.length / 2);
    let closedMinutes = 0;
    for (let i = 0; i < pairsCount; i++) {
      closedMinutes += this.minutesBetween(intervals[i * 2], intervals[i * 2 + 1]);
    }

    const isOpen = intervals.length % 2 === 1;
    const openStart = isOpen ? intervals[intervals.length - 1] : null;
    const openMinutes = isOpen ? Math.max(0, this.minutesBetween(openStart!, now)) : 0;
    const workedMinutes = closedMinutes + openMinutes;

    if (workedMinutes >= dueMinutes) {
      return this.stateFor('done', workedMinutes, dueMinutes, null, []);
    }

    if (isOpen) {
      const remainingAtOpenStart = dueMinutes - closedMinutes;
      const expectedExitTime = new Date(openStart!.getTime() + remainingAtOpenStart * 60000);
      return this.stateFor('working', workedMinutes, dueMinutes, expectedExitTime, []);
    }

    return this.stateFor('onBreak', workedMinutes, dueMinutes, null, []);
  }

  private stateFor(
    status: DayStatus,
    workedMinutes: number,
    dueMinutes: number,
    expectedExitTime: Date | null,
    invalidIndexes: number[]
  ): DayState {
    return {
      status,
      workedMinutes,
      dueMinutes,
      remainingMinutes: Math.max(0, dueMinutes - workedMinutes),
      overtimeMinutes: Math.max(0, workedMinutes - dueMinutes),
      expectedExitTime,
      progress: dueMinutes > 0 ? workedMinutes / dueMinutes : 0,
      invalidIndexes
    };
  }

  // Una coppia con uscita < ingresso, o due timbrature consecutive fuori ordine cronologico
  // (che coincide col caso "due coppie si sovrappongono"): l'intero array deve essere
  // non-decrescente e ogni coppia deve avere fine >= inizio.
  private findInvalidIndexes(intervals: Date[]): number[] {
    const invalid = new Set<number>();

    const pairsCount = Math.floor(intervals.length / 2);
    for (let i = 0; i < pairsCount; i++) {
      const start = intervals[i * 2];
      const end = intervals[i * 2 + 1];
      if (end.getTime() < start.getTime()) {
        invalid.add(i * 2);
        invalid.add(i * 2 + 1);
      }
    }

    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i].getTime() < intervals[i - 1].getTime()) {
        invalid.add(i - 1);
        invalid.add(i);
      }
    }

    return Array.from(invalid).sort((a, b) => a - b);
  }

  private minutesBetween(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }
}
