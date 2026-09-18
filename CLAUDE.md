# Scopo
Stai sviluppando un applicazione per calcolare il saldo di tempo giornaliero passato a lavoro. Le timbrature indicano i vari ingressi ed uscite. Il calcolo delle varie timbrature dà un totale orario che indica quanto si è lavorato in quella giornata.

## Features già presenti
- l'inserimento manuale delle timbrature con il calcolo totale delle ore e minuti lavorativi fatti.
- la modifica delle ore minime richieste nella giornata
- il calcolo del conseguimento del buono pasto in base alle timbrature (regole in `rules/buoni-pasto.md`)
- la visualizzazione dei treni disponibili per il ritorno a casa (regole in `rules/api-trenitalia.md`)
- CI/CD automatica: `.github/workflows/deploy-frontend.yml` pubblica su gh-pages, `build-backend.yml` pubblica l'immagine dell'API su GHCR
- il redesign dell'interfaccia — piano in [Azioni/04-redesign-ui.md](Azioni/04-redesign-ui.md), applicato: pagina unica, hero a stati, scena low poly, nessuna libreria UI (Material/Bootstrap/Font Awesome rimossi)

## Features mancanti
- la vista mensile (`/monthly`): oggi è uno stub nascosto, la feature è ancora da definire

## Limiti noti
- **L'hosting del backend non è deciso**: `ShiftManager.UI/src/environments/environment.prod.ts` punta a `https://TODO-backend-host-non-ancora-deciso`, quindi la ricerca treni **non funziona sul sito pubblicato**. La CI pubblica l'immagine su GHCR ma non la deploya da nessuna parte.
- **I ritardi dei treni non sono disponibili**: l'API di lefrecce.it non li espone (verificato, vedi `Azioni/02-treni.md`). Il badge "In ritardo" esiste nel codice ma non si attiva mai.

# Architettura
Il programma mira ad essere principalmente se non totalmente frontend utilizzando angular. La pagina web è esposta da github pages utilizzando il branch gh-pages.

Il backend `.NET` (`ShiftManager.API` + `ShiftManager.Core`) esiste e ha **un solo ruolo**: proxy CORS verso le API di lefrecce.it, che non espongono header CORS e quindi non sono chiamabili da un sito statico. Nessuna logica applicativa, nessun uso del database `Movement`/`User` già presente in `ShiftManager.Core`. Non aggiungerne senza una ragione esplicita.

## Sicurezza
Si tratta di un applicazione che non immagazzina i dati utente e non ci sono login. La pagina web viene utilizzata per quel momento ed alla chiusura tutto viene cancellato.

Questo significa, concretamente: **nessun `localStorage`, nessun `sessionStorage`, nessun cookie** per timbrature, ore dovute o stazioni. Un ricaricamento della pagina azzera la giornata, ed è il comportamento voluto: non si aggiunge persistenza "per comodità".

**Unica eccezione approvata**: la preferenza di tema chiaro/scuro in `localStorage`. Non è un dato utente e non rivela nulla della giornata lavorativa.

# Interfaccia
Le decisioni di design sono fissate e documentate per esteso in [Azioni/04-redesign-ui.md](Azioni/04-redesign-ui.md). In sintesi, da rispettare in ogni modifica alla UI:

- **Desktop**, tab aperta tutto il giorno. Pagina unica: niente navigazione, niente rotte oltre a `home`.
- **Italiano** ovunque nei testi dell'interfaccia.
- **Nessuna libreria UI**: niente Angular Material, niente Bootstrap, niente Font Awesome. CSS puro con custom properties, griglia `display: grid` nativa, icone come SVG inline. Non reintrodurle.
- **Font di sistema** (`ui-sans-serif`, `ui-monospace` per le cifre). Nessun webfont.
- **Tema scuro di default**, palette "blu notte" fredda per l'interfaccia, con interruttore manuale.
- **Una sola illustrazione**: la scena low poly (lago, sole che scende sull'orizzonte col progresso, gallina che cambia posa secondo lo stato, ciotola per il buono pasto). Nessuna decorazione altrove.
- **Ricalcolo continuo**: niente bottoni "calcola", niente risultati dentro uno snackbar che svanisce.
- **Nessuna animazione in loop**: solo transizioni da ~400ms innescate dal cambio dei dati, e `prefers-reduced-motion` rispettato.

# Lavorare su questo repository
- I piani di lavoro stanno in `Azioni/`, uno per feature, indicizzati da `Azioni/00-indice.md`. Le regole di dominio (buoni pasto, API Trenitalia) stanno in `rules/`.
- **Nessuna nuova dipendenza npm o NuGet** senza una ragione esplicita: la direzione del progetto è di ridurle, non aggiungerle.
- La logica non banale lascia dietro di sé un test (`*.spec.ts`), come già fanno `meal-voucher.service` e `train-suggestion.service`.
