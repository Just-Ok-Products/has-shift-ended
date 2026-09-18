# Feature: Buono pasto

Riferimento regole: `rules/buoni-pasto.md`.

## Stato implementazione: ✅ completata (2026-09-18)

File creati/modificati esattamente come da piano:
- `ShiftManager.UI/src/app/home/models/work-interval.model.ts`
- `ShiftManager.UI/src/app/home/services/meal-voucher.service.ts` (+ `meal-voucher.service.spec.ts`, 8 casi, tutti passati in ChromeHeadless)
- `ShiftManager.UI/src/app/home/home.component.ts` (`calcTimeSpent()` appende l'esito buono pasto allo snackbar)

Nessuna deviazione dal piano, nessuna nuova dipendenza. Nota: la suite di test completa del progetto ha 7 fallimenti preesistenti e non correlati (moduli Material/DatePipe mancanti nei TestBed di `AppComponent` ecc.), confermati anche su `master` prima di questa modifica — non riguardano il buono pasto.

## Regole da implementare

Il buono pasto è raggiunto solo se **tutti** questi criteri sono soddisfatti nella giornata:

- almeno **3h30** lavorative nella fascia mattutina (prima della pausa pranzo)
- almeno **30 minuti continui** di pausa pranzo
- almeno **2h** lavorative nella fascia pomeridiana (dopo la pausa pranzo)
- almeno **7h** lavorative totali nella giornata

Definizione di "pausa pranzo" (decisa in fase di analisi): un **singolo gap continuo** tra due timbrature (fine di un'uscita e inizio dell'ingresso successivo), di durata ≥ 30 minuti, **interamente contenuto** nella finestra oraria **12:30–14:30**. Non si sommano più pause frammentate: deve essere un unico gap che soddisfa da solo il criterio. Tutto ciò che precede questo gap conta come fascia mattutina, tutto ciò che segue come fascia pomeridiana. Se nessun gap soddisfa il criterio, il buono pasto non è raggiunto (nessun caso d'errore da gestire, è un esito normale).

Le soglie sono **costanti fisse** nel codice (non editabili dall'utente, a differenza di `hoursDue`).

## Passaggi

1. **Modello di supporto** — creare `ShiftManager.UI/src/app/home/models/work-interval.model.ts` con un tipo `WorkInterval { start: Date; end: Date }`. Non sostituisce `intervals: Date[]` (usato altrove, es. `timespan-row.component.ts`), è solo un tipo derivato usato internamente dal nuovo servizio.

2. **Servizio di calcolo** — creare `ShiftManager.UI/src/app/home/services/meal-voucher.service.ts` (`providedIn: 'root'`), con:
   - Costanti: `MORNING_MIN_MINUTES = 210`, `LUNCH_MIN_MINUTES = 30`, `AFTERNOON_MIN_MINUTES = 120`, `TOTAL_MIN_MINUTES = 420`, `LUNCH_WINDOW_START = "12:30"`, `LUNCH_WINDOW_END = "14:30"`.
   - Un metodo `isMealVoucherEarned(intervals: Date[]): boolean` che:
     1. Raggruppa `intervals` a coppie in `WorkInterval[]` (indici pari = start, dispari = end) — stessa convenzione già usata in `HomeComponent`.
     2. Calcola i gap tra un `WorkInterval.end` e il `WorkInterval.start` successivo.
     3. Trova il gap "pausa pranzo": `gap.start >= 12:30`, `gap.end <= 14:30`, `durata(gap) >= 30 min`. Se più gap soddisfano il criterio (caso raro), prendere il primo in ordine cronologico.
     4. Se nessun gap valido → `false` (nessun ulteriore calcolo necessario).
     5. Somma i minuti lavorati negli intervalli prima del gap (fascia mattutina) e dopo (fascia pomeridiana); il totale giornaliero è la somma di tutti gli intervalli (indipendentemente dal gap).
     6. Ritorna `true` solo se mattina ≥ 210, pausa ≥ 30, pomeriggio ≥ 120, totale ≥ 420.
   - Nota implementativa: fare tutti i calcoli in minuti interi (`Math.round((end.getTime() - start.getTime()) / 60000)`), evitando il parsing fragile su stringa già presente in `calcTimeSpent()` (`home.component.ts`, righe ~44-72) — non serve refactorare quella funzione, solo non replicarne la fragilità nel nuovo codice.

3. **Integrazione in `HomeComponent`** — in `calcTimeSpent()` (`ShiftManager.UI/src/app/home/home.component.ts`), dopo aver calcolato il messaggio esistente su ore lavorate/mancanti, chiamare `mealVoucherService.isMealVoucherEarned(this.intervals)` e appendere al messaggio dello `SnackbarService` (`ShiftManager.UI/src/app/snackbar.service.ts`) un'indicazione chiara, es. "Buono pasto: raggiunto ✅" / "Buono pasto: non raggiunto ❌".

4. **Test** — creare `ShiftManager.UI/src/app/home/services/meal-voucher.service.spec.ts` con almeno questi casi:
   - giornata che soddisfa tutti i criteri → `true`
   - nessuna pausa pranzo (2 sole timbrature, un solo intervallo) → `false`
   - pausa pranzo presente ma < 30 minuti → `false`
   - pausa pranzo ≥ 30 minuti ma parzialmente fuori dalla finestra 12:30–14:30 (es. 12:15–13:00) → `false`
   - pausa pranzo valida ma fascia mattutina o pomeridiana sotto soglia → `false`
   - totale giornaliero sotto le 7h anche con le altre 3 condizioni soddisfatte → `false`

5. **Verifica manuale** — avviare l'app (`npm start` in `ShiftManager.UI/`), inserire manualmente timbrature che coprano i vari casi sopra, controllare che lo snackbar mostri il messaggio corretto.
