# Timbrature ancorate al giorno corrente (issue #4)

Issue: https://github.com/Just-Ok-Products/has-shift-ended/issues/4

## Problema

Ogni timbratura è un `Date` completo. La data viene fissata alla creazione della riga
(`HomeComponent.addInterval()` → `new Date()`) e poi **preservata** a ogni modifica
(`TimespanRowComponent.onTimeChange()` usa `this.value` come base per anno/mese/giorno).

Con la tab aperta oltre la mezzanotte, una riga creata ieri resta datata ieri:
ingresso 07:37 (ieri) + uscita 08:02 (oggi) = 24h25m invece di 25m.

## Decisione

Una timbratura è **solo un orario della giornata corrente**. La data non ha significato
(l'app non gestisce più giorni, e non persiste nulla). Quindi:

1. **`HomeComponent.recompute()`**: prima di qualunque calcolo, riporta ogni timbratura
   allo stesso orario (ore/minuti) sulla data di `now`. È l'unico punto da cui passano
   modifiche, aggiunte, rimozioni e il tick da 60s, quindi copre anche le righe mai
   toccate dopo la mezzanotte. Riassegnare l'array solo se qualcosa cambia davvero
   (evita di ricreare gli input: c'è già `trackByIndex`, ma non serve sporcare il change detection).
2. **`TimespanRowComponent.onTimeChange()`**: usare sempre `new Date()` come base invece di
   `this.value`; aggiornare il commento. Il punto 1 basterebbe da solo, ma così la riga
   non emette mai una data diversa da oggi.

Fuori scope (non farlo): reset automatico della giornata a mezzanotte, persistenza,
modifiche a `DayCalculatorService` / `MealVoucherService` (ricevono già date coerenti).

## Test

- `home.component.spec.ts`: timbrature ieri 07:37 + oggi 08:02 → `dayState` riporta 25 minuti.
  Usare `jasmine.clock().mockDate(...)` per fissare `now`.
- `timespan-row.component.spec.ts`: con `value` datato ieri, `onTimeChange('08:02')` emette
  un `Date` con la data di oggi.
- `npm test` (headless) verde.

## Fatto quando

- I due test sopra passano, nessuna regressione negli spec esistenti.
- PR verso `master` che chiude #4 (`Closes #4` nella descrizione).
