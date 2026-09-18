import { TestBed } from '@angular/core/testing';
import { DayCalculatorService } from './day-calculator.service';

function d(hours: number, minutes: number): Date {
  return new Date(2024, 0, 1, hours, minutes, 0, 0);
}

describe('Service: DayCalculator', () => {
  let service: DayCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DayCalculatorService] });
    service = TestBed.inject(DayCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('empty: nessuna timbratura', () => {
    const state = service.compute([], 8);
    expect(state.status).toBe('empty');
    expect(state.workedMinutes).toBe(0);
  });

  it('working: numero dispari, intervallo aperto conta fino a now', () => {
    const state = service.compute([d(9, 0)], 8, d(10, 30));
    expect(state.status).toBe('working');
    expect(state.workedMinutes).toBe(90);
    // 8h dovute, iniziato alle 9:00 -> uscita prevista alle 17:00, indipendente da "now"
    expect(state.expectedExitTime).toEqual(d(17, 0));
  });

  it('onBreak: numero pari, obiettivo non raggiunto', () => {
    const state = service.compute([d(9, 0), d(12, 0)], 8);
    expect(state.status).toBe('onBreak');
    expect(state.workedMinutes).toBe(180);
    expect(state.expectedExitTime).toBeNull();
  });

  it('done: minuti lavorati >= minuti dovuti, ha precedenza su working', () => {
    const state = service.compute([d(9, 0)], 1, d(10, 30));
    expect(state.status).toBe('done');
    expect(state.overtimeMinutes).toBe(30);
  });

  it('incoherent: una coppia ha uscita < ingresso', () => {
    const state = service.compute([d(9, 0), d(8, 0)], 8);
    expect(state.status).toBe('incoherent');
    expect(state.invalidIndexes).toEqual([0, 1]);
  });

  it('incoherent: due coppie si sovrappongono, ha precedenza su tutto il resto', () => {
    const state = service.compute([d(9, 0), d(13, 0), d(12, 0), d(17, 0)], 8);
    expect(state.status).toBe('incoherent');
    expect(state.invalidIndexes).toEqual([1, 2]);
  });
});
