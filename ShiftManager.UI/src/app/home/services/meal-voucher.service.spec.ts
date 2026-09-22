import { TestBed } from '@angular/core/testing';
import { MealVoucherService } from './meal-voucher.service';

function d(hours: number, minutes: number): Date {
  return new Date(2024, 0, 1, hours, minutes, 0, 0);
}

describe('Service: MealVoucher', () => {
  let service: MealVoucherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MealVoucherService]
    });
    service = TestBed.inject(MealVoucherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('giornata che soddisfa tutti i criteri -> true', () => {
    // mattina 8:00-12:30 (4h30), pausa 12:30-13:30 (1h), pomeriggio 13:30-17:00 (3h30), totale 8h
    const intervals = [d(8, 0), d(12, 30), d(13, 30), d(17, 0)];
    expect(service.isMealVoucherEarned(intervals)).toBeTrue();
  });

  it('nessuna pausa pranzo (2 sole timbrature, un solo intervallo) -> false', () => {
    const intervals = [d(8, 0), d(17, 0)];
    expect(service.isMealVoucherEarned(intervals)).toBeFalse();
  });

  it('pausa pranzo presente ma < 30 minuti -> false', () => {
    // pausa 13:00-13:15 (15 min)
    const intervals = [d(8, 0), d(13, 0), d(13, 15), d(17, 0)];
    expect(service.isMealVoucherEarned(intervals)).toBeFalse();
  });

  it('pausa pranzo >= 30 minuti ma parzialmente fuori dalla finestra 12:30-14:30 -> false', () => {
    // pausa 12:15-13:00 (45 min, ma inizia prima delle 12:30)
    const intervals = [d(8, 0), d(12, 15), d(13, 0), d(17, 0)];
    expect(service.isMealVoucherEarned(intervals)).toBeFalse();
  });

  it('pausa pranzo valida ma fascia mattutina sotto soglia -> false', () => {
    // mattina 10:00-12:30 (2h30 < 3h30)
    const intervals = [d(10, 0), d(12, 30), d(13, 0), d(19, 0)];
    expect(service.isMealVoucherEarned(intervals)).toBeFalse();
  });

  it('pausa pranzo valida ma fascia pomeridiana sotto soglia -> false', () => {
    // pomeriggio 13:00-14:00 (1h < 2h)
    const intervals = [d(8, 0), d(12, 30), d(13, 0), d(14, 0)];
    expect(service.isMealVoucherEarned(intervals)).toBeFalse();
  });

  it('totale giornaliero sotto le 7h anche con le altre 3 condizioni soddisfatte -> false', () => {
    // mattina 3h30 (10:00-13:30), pausa 30 min (13:30-14:00), pomeriggio 2h (14:00-16:00), totale 6h
    const intervals = [d(10, 0), d(13, 30), d(14, 0), d(16, 0)];
    expect(service.isMealVoucherEarned(intervals)).toBeFalse();
  });

  it('timbrature incomplete (solo mattina, pausa non ancora fatta) -> mattina già soddisfatta, resto no di default', () => {
    // 8:00-12:30 (4h30 >= 3h30): il turno non è ancora finito, non c'è ancora una pausa da valutare
    const intervals = [d(8, 0), d(12, 30)];
    const detail = service.getDetail(intervals);
    expect(detail.morning).toBeTrue();
    expect(detail.lunch).toBeFalse();
    expect(detail.afternoon).toBeFalse();
    expect(detail.earned).toBeFalse();
  });

  it('timbrature incomplete (mattina sotto soglia) -> nessun requisito ancora soddisfatto', () => {
    // 8:00-9:00 (1h < 3h30)
    const intervals = [d(8, 0), d(9, 0)];
    const detail = service.getDetail(intervals);
    expect(detail.morning).toBeFalse();
    expect(detail.lunch).toBeFalse();
    expect(detail.afternoon).toBeFalse();
    expect(detail.earned).toBeFalse();
  });
});
