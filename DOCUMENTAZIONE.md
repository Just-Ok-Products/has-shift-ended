# Has Shift Ended — Documentazione di progetto

## 1. Obiettivo

Applicazione web per registrare le timbrature di ingresso/uscita e calcolare il saldo
orario giornaliero (ore lavorate vs ore dovute), con moduli accessori per la
pianificazione mensile e la ricerca treni.

## 2. Architettura

Soluzione .NET + Angular in tre progetti (`HasShifEnded.sln`):

| Progetto | Ruolo | Stack |
|---|---|---|
| [ShiftManager.API](ShiftManager.API) | Web API | ASP.NET Core, EF Core, AutoMapper, Swagger |
| [ShiftManager.Core](ShiftManager.Core) | Dominio + accesso dati | EF Core `DbContext`, Migrations, Model/DTO |
| [ShiftManager.UI](ShiftManager.UI) | Frontend | Angular, Angular Material |

Persistenza su MySQL (`options.UseMySQL`, [Program.cs:17](ShiftManager.API/Program.cs:17)),
connection string in `appsettings.json`.

### Modello dati ([ShiftManager.Core/Model](ShiftManager.Core/Model))

- `User`: `Id`, `Username`, `Email`, `Password`, `DateCreated`, `LastLogin`.
- `Movement`: `Time` (PK), `Type` (`MovementType`: `Entrance` / `Exit` / `Undefined`), `Actor` (`User`).
- DTO paralleli (`UserDTO` con `Token`, `MovementDTO`) mappati via AutoMapper.

Una timbratura è quindi una singola riga (utente, istante, tipo entrata/uscita); il
saldo giornaliero è calcolato aggregando le coppie Entrance/Exit di un utente in un
giorno — questa aggregazione **non è ancora implementata lato server**.

### Stato dell'implementazione (rilevante per le feature richieste)

- `MovementController` ([ShiftManager.API/Controllers/MovementController.cs](ShiftManager.API/Controllers/MovementController.cs)):
  `GET` liste/singolo presenti ma `Post`/`Put`/`Delete` sono ancora vuoti (nessuna
  persistenza reale delle timbrature), e il filtro per intervallo ha un bug
  (`x.Time >= start && x.Time >= end` dovrebbe essere `<= end`).
- Frontend `home.component.ts` ([ShiftManager.UI/src/app/home/home.component.ts](ShiftManager.UI/src/app/home/home.component.ts)):
  calcolo ore lavorate interamente client-side, a partire da un array di `Date`
  inseriti manualmente a coppie (start/stop), confrontato con `hoursDue` fisso a 8;
  nessuna chiamata API, nessuna persistenza.
- `monthly-planning`: solo scheletro tabella, non collegato al backend.
- `trains`: modulo già abbozzato (vedi §3) ma non integrato con home/saldo giornaliero.

Questo è il contesto su cui si innestano le due feature richieste.

## 3. Feature: treno successivo verso una destinazione (con ritardo)

### Cosa esiste già

Il modulo [ShiftManager.UI/src/app/trains](ShiftManager.UI/src/app/trains) è un
prototipo funzionante ma "quick and dirty":

- [trains.component.ts](ShiftManager.UI/src/app/trains/trains.component.ts) chiama
  **direttamente dal browser** l'endpoint privato del sito Lefrecce/Trenitalia
  (`https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions`),
  con stazioni ed data hardcoded (Udine → Codroipo, `new Date()`).
- Restituisce solo *soluzioni di viaggio* (orari, prezzo) — **nessun dato di
  ritardo/stato in tempo reale**.
- `TrenitaliaPayload`/`TrenitaliaResponse` mappano già la risposta di quel BFF.

Punti critici di questo approccio: non è un'API pubblica documentata (può cambiare
senza preavviso), chiamarla da browser espone l'endpoint e va soggetta a CORS/ToS,
e non fornisce comunque il ritardo del treno.

### Come implementarla correttamente

**Fonte dati per il ritardo**: il BFF di Lefrecce dà solo l'orario *programmato*.
Per lo stato in tempo reale (ritardo, treno in stazione, cancellazioni) serve una
seconda fonte: l'API non ufficiale **ViaggiaTreno** (RFI), che espone
`andamentoTreno/{codOrigine}/{numeroTreno}/{timestampPartenza}` e restituisce
minuti di ritardo, ultimo rilevamento, eventuale soppressione. È il servizio dietro
l'app "ViaggiaTreno" ed è quello comunemente usato dai progetti open source italiani
per questo scopo — anche questa è non ufficiale/non garantita, quindi va isolata
dietro un'interfaccia.

**Flusso proposto**:

1. **Backend, non frontend**, deve fare le chiamate esterne — evita di esporre
   l'endpoint nel bundle JS, permette caching/rate-limiting server-side, ed è
   l'unico posto sensato per unire due fonti dati (solutions + andamentoTreno).
2. Nuovo controller `TrainController` in `ShiftManager.API`:
   - `GET /api/train/next?destinationStationId=...` → cerca la prossima partenza
     utile (riusa la logica già scritta in `trains.component.ts`, spostata in un
     servizio backend) e per il treno trovato interroga ViaggiaTreno per il ritardo.
   - Risposta: `{ departureTime, platform, trainNumber, delayMinutes, status }`.
3. Stazione di partenza/arrivo: oggi hardcoded in `TrenitaliaPayload`. Da associare
   all'utente (nuovo campo su `User`, es. `DefaultDepartureStationId`/
   `DefaultArrivalStationId`) così la home può mostrare "prossimo treno" senza che
   l'utente lo richieda ogni volta.
4. **Cache breve** (`IMemoryCache`, TTL 30–60s) sulle chiamate a ViaggiaTreno: sono
   endpoint non ufficiali, condivisi con l'app pubblica, e martellarli ad ogni
   refresh della home è sia inutile (il ritardo non cambia ogni secondo) sia a
   rischio di rate-limiting/ban IP.
5. Isolare l'integrazione dietro un'interfaccia (`ITrainInfoProvider`) — dato che
   sono API non ufficiali, un domani potrebbero rompersi o essere sostituite senza
   che il resto dell'app debba cambiare.
6. UI: estendere `train-card.component.html` (già esiste, mostra solo
   orario/prezzo) con un badge ritardo, es. "In orario" / "+7 min", riusando
   `dataFromTrenitalia` ma con i nuovi campi popolati dal backend.

**Non serve**: autenticazione OAuth verso Trenitalia (non esiste per queste API),
un job schedulato lato server (basta chiamare on-demand con cache), una libreria
esterna dedicata (una `HttpClient` + due DTO bastano).

## 4. Feature: verifica requisiti buono pasto

### Regola da implementare

> 3h30 la mattina + pausa pranzo ≥ 30 min + 2h il pomeriggio → totale giornaliero
> ≥ 7h lavorate.

Quindi non basta sommare le ore totali (già fatto in `calcTimeSpent()`): occorre
anche verificare la *distribuzione* mattina/pausa/pomeriggio, non solo il totale.

### Dove calcolarlo

Oggi il calcolo del tempo lavorato vive solo lato client
([home.component.ts:42-72](ShiftManager.UI/src/app/home/home.component.ts:42)), su
un array di `Date` in memoria, mai inviato al backend. È una regola di business
(condizione per un buono pasto) quindi **andrebbe calcolata lato server** a partire
dalle `Movement` effettivamente salvate (una volta che `Post` sul
`MovementController` sarà implementato), non riaffidata al client — altrimenti un
utente potrebbe alterare il risultato modificando il JS in console.

Struttura proposta in `ShiftManager.Core`:

```csharp
public record DailyBalance(
    TimeSpan MorningWorked,
    TimeSpan LunchBreak,
    TimeSpan AfternoonWorked,
    TimeSpan TotalWorked,
    bool MealVoucherEligible);

public static class DailyBalanceCalculator
{
    public static DailyBalance Calculate(IEnumerable<Movement> dayMovements) { ... }
}
```

Input: le `Movement` di un utente per un singolo giorno, ordinate per `Time`.
Logica: accoppiare `Entrance`/`Exit` consecutivi in segmenti lavorati; il primo
segmento (o i segmenti prima della pausa più lunga) è la mattina, l'ultimo è il
pomeriggio, il gap fra i due è la pausa pranzo. Poi:

```
eligible = MorningWorked >= 3.5h
        && LunchBreak   >= 30min
        && AfternoonWorked >= 2h
        && TotalWorked  >= 7h
```

Casi limite da gestire esplicitamente (non ignorare): giornata con una sola coppia
Entrance/Exit (nessuna pausa → non eleggibile anche se il totale supera 7h, dato che
manca la pausa pranzo richiesta), più di due segmenti (pause multiple — la pausa
pranzo è quella intorno a mezzogiorno, non necessariamente la prima), timbratura
`Undefined` o dispari (dato incompleto → segnalare come "non calcolabile", non
lanciare un'eccezione).

### Esposizione ed uso

- Endpoint: estendere `MovementController` (che già ha `Get(start, end)`, da
  correggere) con `GET /api/movement/daily-balance?date=yyyy-MM-dd` che restituisce
  il `DailyBalance` per l'utente autenticato (il controller è già `[Authorize]`).
- Frontend: `home.component.ts` chiama questo endpoint al posto del calcolo locale
  in `calcTimeSpent()`, e mostra un badge "Buono pasto maturato / non maturato" con
  il dettaglio mattina/pausa/pomeriggio, riusando lo `SnackbarService` già presente
  per i messaggi di errore/riepilogo.
- `monthly-planning` può poi mostrare, per ogni giorno del mese, se il buono pasto è
  stato maturato — stesso `DailyBalanceCalculator`, nessuna logica duplicata.

**Non serve**: un motore a regole configurabile (drools-like) per una regola fissa
e nota; basta una funzione pura testata con qualche caso (mattina corta, pausa
corta, giorno senza pausa, giorno esatto a 7h).
