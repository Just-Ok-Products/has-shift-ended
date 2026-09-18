# Piano di sviluppo

Indice dei piani dettagliati: le 3 feature mancanti indicate in `CLAUDE.md` (punti 1-3) più il redesign dell'interfaccia (punto 4). Tutte e 4 completate.

**Stato feature 1-3**: implementate il 2026-09-18, in ordine sequenziale per via delle dipendenze condivise (stesse righe di `home.component.ts`, Dockerfile prerequisito del workflow CI/CD), committate in `ea54b70`. **Feature 4 (redesign)**: implementata lo stesso giorno, in una sessione successiva, non ancora committata.

1. [Buono pasto](01-buono-pasto.md) — ✅ completata. Calcolo del conseguimento del buono pasto in base alle timbrature.
2. [Treni](02-treni.md) — ✅ completata, con alcune deviazioni segnalate nel file (vedi sezione "Stato implementazione").
3. [CI/CD](03-cicd.md) — ✅ completata. Restano 2 setup manuali una tantum su GitHub (vedi sezione "Stato implementazione").
4. [Redesign UI/UX](04-redesign-ui.md) — ✅ completata (2026-09-18). Riprogettazione completa dell'interfaccia (pagina unica, hero a stati, scena low poly, rimozione di Material/Bootstrap/Font Awesome).

Ogni file è pensato per essere eseguito in ordine e in modo autonomo (una feature = un file), ma **Treni** ha una dipendenza tecnica dalla parte "backend proxy" descritta al suo interno, che va completata per prima all'interno dello stesso file.

## Decisioni architetturali di fondo (valide per tutto il piano)

- **Nessuna persistenza dati utente**: tutto lo stato (timbrature, ore minime, stazioni/scarto treni) resta in memoria per la sessione del browser, coerente con la sezione "Sicurezza" di `CLAUDE.md`. Nessuna nuova feature deve introdurre storage lato server o cookie/localStorage persistenti.
  - **Unica eccezione approvata** (2026-09-18, vedi [04-redesign-ui.md](04-redesign-ui.md)): la preferenza di tema chiaro/scuro in `localStorage`. Non è un dato utente, è una preferenza di visualizzazione, e non rivela nulla della giornata lavorativa.
- **Backend `.NET` (`ShiftManager.API`/`ShiftManager.Core`)**: resta fuori scope come logica applicativa (nessun uso del DB `Movement`/`User` già esistente), ma viene riattivato con un ruolo minimo e specifico: **proxy CORS** verso le API di lefrecce.it, necessario perché quelle API non espongono header CORS e quindi non sono chiamabili direttamente da un frontend statico su GitHub Pages. Dettagli in [02-treni.md](02-treni.md).
- **Il backend deve essere Docker-deployabile** (Dockerfile + documentazione), ma la scelta di *dove* eseguirlo in produzione (Azure, Fly.io, Render, VPS, ecc.) è rimandata a dopo aver visto il risultato della build — non è parte di questo piano, che si ferma alla pubblicazione automatica dell'immagine su GitHub Container Registry (GHCR).
- **Nessuna nuova dipendenza npm/NuGet** oltre a quanto già presente, se non strettamente necessario (es. `docker/build-push-action` e `peaceiris/actions-gh-pages` sono azioni GitHub, non dipendenze del progetto).

## Stato di partenza (per riferimento rapido)

- Angular 17.0.6 in `ShiftManager.UI/`, routing con `HashLocationStrategy`, nessun NgRx/signal — solo proprietà di classe + `@Input`/`@Output`.
- Timbrature modellate come `intervals: Date[]` in `ShiftManager.UI/src/app/home/home.component.ts`, calcolo totale ore in `calcTimeSpent()`.
- Modulo treni già abbozzato in `ShiftManager.UI/src/app/trains/` (chiama realmente `lefrecce.it`, stazioni hardcoded Udine→Codroipo), route `/trains` già registrata.
- Deploy frontend già configurato ma manuale (`ng deploy` via `angular-cli-ghpages`, target `deploy` in `angular.json`).
- Nessuna cartella `.github/workflows` esistente.
