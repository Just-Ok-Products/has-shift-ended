# Feature: Treni

Riferimento regole: `rules/api-trenitalia.md`.

## Stato implementazione: ✅ completata (2026-09-18)

Tutte le parti A-H implementate. File principali creati/modificati: `ShiftManager.API/Controllers/TrainsProxyController.cs`, `ShiftManager.API/Dockerfile` + `.dockerignore` + `README.md`, `ShiftManager.API/Program.cs` (HttpClient + CORS), `ShiftManager.UI/src/environments/`, `Services/httprequests.service.ts`, `Models/TrenitaliaPayload.ts`, `Components/station-search/` (nuovo), `Components/train-card/*` (badge ritardo), `shared/services/train-suggestion.service.ts` (+ spec, 7 test passati), `home.component.ts/.html/.css` (riga suggerita), `trains.component.ts/.html`. Build produzione Angular verificata OK.

**Deviazioni dal piano, da tenere presenti:**
- **Contesto build Docker**: il comando del punto 6 (`docker build -t shiftmanager-api ./ShiftManager.API`) non funziona perché `ShiftManager.API.csproj` referenzia `../ShiftManager.Core`, fuori dal contesto. Comando corretto: `docker build -f ShiftManager.API/Dockerfile -t shiftmanager-api .` dalla **root** del repo (il workflow CI/CD in `03-cicd.md` usa già questo contesto).
- **`docker-compose.yml` (punto 8) omesso**: l'app non si connette al DB all'avvio, quindi non serve per testare il proxy in locale — condizione già prevista come possibile esito dal piano stesso.
- **Badge ritardo (Parte E)**: verificato con una chiamata reale che `POST .../website/ticket/solutions` restituisce `status`/`messages` relativi a disponibilità/regole di acquisto biglietto, **non** a ritardi effettivi del treno. La logica del badge è implementata come da spec ma **non si attiverà mai** con l'API attuale; per ritardi reali servirebbe un'altra fonte dati (fuori scope).
- **Origine CORS**: impostata su `https://just-ok-products.github.io` (dedotta dal remote `Just-Ok-Products/has-shift-ended`) — verificare che corrisponda al Pages effettivo se l'org/owner cambia.
- Docker e .NET SDK non erano disponibili nell'ambiente di sviluppo dell'agente: build Docker e `dotnet build` non sono state eseguite direttamente, solo revisionate manualmente (API standard ASP.NET Core, nessuna dipendenza nuova).

## Vincolo tecnico scoperto in analisi (da leggere prima di tutto)

Le API di lefrecce.it (sia quella già usata per la ricerca treni, `POST .../website/ticket/solutions`, sia quella nuova per l'autocomplete stazioni, `GET .../website/locations/search?name=...`) **non espongono header CORS**. Un'app statica su GitHub Pages (dominio diverso) non può chiamarle direttamente: il browser blocca la richiesta. Questo vale anche per la feature treni già presente nel codice, che quindi va corretta insieme alla nuova.

Soluzione scelta: usare il backend `.NET` già presente in solution (`ShiftManager.API`) come **semplice proxy passthrough**, senza persistenza né logica applicativa.

## Parte A — Backend proxy

1. In `ShiftManager.API`, aggiungere un controller (es. `Controllers/TrainsProxyController.cs`) con due endpoint:
   - `GET /api/trains/stations?name={query}` → inoltra a `GET https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name={query}` e ritorna la risposta così com'è.
   - `POST /api/trains/solutions` → inoltra il body ricevuto a `POST https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions` e ritorna la risposta così com'è.
2. Registrare un `HttpClient` per lefrecce.it in `Program.cs` (`builder.Services.AddHttpClient(...)`), da iniettare nel controller.
3. Configurare CORS in `Program.cs` per accettare richieste dall'origine GitHub Pages del progetto (es. `https://<owner>.github.io`) solo su questi due endpoint (o su tutto il controller, dato che non richiede altro).
4. Verificare la configurazione di `[Authorize]` esistente sui controller: questi due endpoint non richiedono autenticazione (l'app non ha login) — escluderli esplicitamente se l'auth è applicata globalmente.
5. Nessun uso di `ShiftManagerContext`/EF Core per questi endpoint: puro passthrough HTTP.

## Parte B — Dockerizzazione backend

6. Creare `ShiftManager.API/Dockerfile` (multi-stage: stage `build` con SDK .NET per `dotnet publish`, stage finale con immagine runtime `aspnet`).
7. Creare `ShiftManager.API/.dockerignore` (escludere `bin/`, `obj/`, ecc.).
8. (Facoltativo, utile per test locali) `docker-compose.yml` nella root del repo con servizi `api` (build dal Dockerfile) + `mysql` (immagine ufficiale), per poter testare il proxy in locale senza installare MySQL manualmente — necessario solo se `ShiftManagerContext` richiede una connessione attiva all'avvio; se il proxy può girare senza DB configurato, il servizio `mysql` può essere omesso.
9. Aggiornare/creare `README.md` (root o `ShiftManager.API/README.md`) con: comando di build (`docker build -t shiftmanager-api ./ShiftManager.API`), comando di run, variabili d'ambiente richieste, e nota esplicita che l'hosting di produzione non è ancora deciso — l'immagine viene solo pubblicata su GHCR (vedi [03-cicd.md](03-cicd.md)), non deployata automaticamente.

## Parte C — Frontend: configurazione URL backend

10. Verificare/creare `ShiftManager.UI/src/environments/environment.ts` e `environment.prod.ts` con una proprietà `apiBaseUrl` (dev: `http://localhost:5200` o porta effettiva del container locale; prod: placeholder da aggiornare quando l'hosting sarà scelto).
11. Aggiornare `ShiftManager.UI/src/app/trains/Services/httprequests.service.ts` (o il servizio usato in `trains.component.ts`) per puntare a `${environment.apiBaseUrl}/api/trains/stations` e `${environment.apiBaseUrl}/api/trains/solutions` invece che direttamente a `lefrecce.it`.

## Parte D — Autocomplete stazioni (nascosto di default)

12. Creare componente `ShiftManager.UI/src/app/trains/Components/station-search/station-search.component.ts` (+ html): input testo con debounce (es. `setTimeout`/RxJS `debounceTime` su `rxjs`, già disponibile) che chiama `GET /api/trains/stations?name=...` e mostra una lista di risultati cliccabili (`{id, name}`), emettendo l'id scelto al genitore.
13. In `trains.component.html`, avvolgere la selezione stazioni (due istanze di `station-search`, partenza e arrivo) in un elemento `<details>` HTML nativo, chiuso di default (zero dipendenze aggiuntive per il collassabile). Se l'utente non lo apre, si usano i default hardcoded attuali (Udine `830003026` → Codroipo `830002831`).
14. Rimuovere l'hardcoding fisso in `ShiftManager.UI/src/app/trains/Models/TrenitaliaPayload.ts`: i due id (partenza/arrivo) diventano parametri, con quei due valori come default iniziali del componente.

## Parte E — Segnalazione ritardi

15. Durante lo sviluppo, ispezionare una risposta reale di `/website/ticket/solutions` (tramite il proxy) per capire il formato esatto dei campi `status`/`messages` già presenti in `ShiftManager.UI/src/app/trains/Models/TrenitaliaResponse.ts` quando un treno è in ritardo.
16. In `ShiftManager.UI/src/app/trains/Components/train-card/train-card.component.html` (+ `.ts`), aggiungere una condizione che mostra un badge/testo (es. "In ritardo di X min") quando lo stato indica un ritardo.

## Parte F — Suggerimento automatico "orario di uscita ideale" (in home)

Algoritmo: tra i treni disponibili con partenza successiva al momento in cui `hoursDue` (ore minime impostate dall'utente per la giornata) viene raggiunto, scegliere quello con **partenza più tardiva** (massimizza la permanenza a lavoro). Orario di uscita suggerito = `orario_partenza_treno − scarto` (minuti che l'utente indica per raggiungere la stazione). Se nessun treno soddisfa la condizione, nessun suggerimento viene mostrato (nessun errore/avviso).

17. Creare un servizio condiviso a livello di app, `ShiftManager.UI/src/app/shared/services/train-suggestion.service.ts` (`providedIn: 'root'`), che mantiene in memoria (per la sessione): stazioni scelte, scarto in minuti, ultimo elenco treni ottenuto da una ricerca su `/trains`.
18. Nel servizio, un metodo `getSuggestedDeparture(hoursDueReachedAt: Date): Date | null` che filtra i treni con `partenza - scarto >= hoursDueReachedAt`, prende quello con partenza massima, e ritorna l'orario suggerito (o `null`).
19. In `trains.component.ts`, dopo ogni ricerca treni riuscita, salvare i risultati nel servizio condiviso (oltre a mostrarli come già fa oggi).
20. In `HomeComponent.calcTimeSpent()` (`home.component.ts`), calcolare il momento in cui `hoursDue` viene raggiunto (dato l'array `intervals`, sommando progressivamente), poi chiamare `trainSuggestionService.getSuggestedDeparture(...)`. Se c'è un risultato, aggiungere una riga aggiuntiva nella lista timbrature (`home.component.html`), stile grigio/disabilitato, non editabile, con l'orario suggerito.
21. Se l'utente non ha mai visitato `/trains` in questa sessione (nessun dato nel servizio condiviso), non mostrare nessuna riga.

## Parte G — "Vedi treno raggiungibile ora" (solo su `/trains`)

Funzione separata, on-demand, indipendente da `hoursDue`.

22. In `trains.component.html`, aggiungere un pulsante/toggle (es. "Mostra treno raggiungibile ora").
23. Al click, calcolare (stesso servizio condiviso o funzione pura riusata) il treno con partenza più vicina tale che `partenza - scarto >= adesso`, ed evidenziarlo nella lista `train-card` esistente (es. bordo/etichetta dedicata), senza considerare `hoursDue`.

## Parte H — Test

24. Test unitari per `train-suggestion.service.ts`: nessun treno disponibile → `null`; un solo treno esattamente al limite → quello; più treni disponibili → il più tardivo tra quelli validi; caso "treno raggiungibile ora" con lista vuota/con risultati.
25. Verifica manuale end-to-end: avviare backend (`docker compose up` o `dotnet run`) + frontend (`npm start`), aprire `/trains`, testare autocomplete stazioni, ricerca treni, eventuale badge ritardo, pulsante "raggiungibile ora"; poi tornare in home e verificare la riga suggerita nella lista timbrature.
