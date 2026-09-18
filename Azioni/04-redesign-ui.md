# Feature: Redesign UI/UX

## Stato implementazione: ✅ completata (2026-09-18)

Tutte le fasi (0-8) implementate in un'unica sessione. File principali creati: `Services/theme.service.ts`, `home/services/day-calculator.service.ts` (+ spec, 6 casi), `home/Components/day-hero/*`, `home/Components/day-scene/*` (SVG da `assets/scena.svg` con binding su `[attr.opacity]`/`[attr.transform]`). Riscritti senza Material/Bootstrap: `styles.scss`, `index.html`, `app.module.ts`, `app-routing.module.ts`, `app.component.*`, `home.component.*`, `timespan-row.component.*`, `trains.module.ts`, `trains.component.*`, `train-card.component.*`, `station-search.component.*`. Cancellati come da piano: `styles.css`, `app.config.ts`, `app.routes.ts`, `app.component.css`, e `snackbar.service.ts` (diventato inutilizzabile: il ricalcolo continuo elimina l'unico chiamante). `tsconfig.app.json`/`tsconfig.spec.json` escludono `monthly-planning/**`. `@angular/material`, `@angular/cdk`, `bootstrap` rimossi da `package.json` (55 pacchetti npm in meno).

Build produzione e 29 test (headless Chromium) verificati OK, verifica manuale nel browser di tutti e 5 gli stati dell'hero, delle quattro pose della gallina, tema chiaro/scuro con persistenza in `localStorage`, dettaglio buono pasto espandibile, e dei due breakpoint responsive (900px, 600px).

**Confronto bundle (produzione, come richiesto dal punto 3 della Fase 8):**

| | Raw | Transfer |
|---|---|---|
| Prima (master, con Material/Bootstrap/Font Awesome) | 1000.66 kB | 184.84 kB |
| Dopo (questo redesign) | 328.16 kB | 88.33 kB |

**Deviazioni dal piano, da tenere presenti:**
- **Scena in stato incoerente**: il piano specifica solo che la posa della gallina resta l'ultima valida durante lo stato 0. In pratica, congelare la sola posa e lasciare `progress`/`overtimeMinutes` live faceva scattare indietro il sole (e la ciotola) a ogni modifica intermedia mentre si corregge un orario — un movimento discontinuo che il piano voleva evitare altrove ("nessuna animazione... che catturi l'occhio"). Ho esteso il congelamento a tutta la scena (sole, riflesso, cielo, ciotola), non solo alla gallina: durante `incoherent` la scena è un fermo immagine dell'ultimo stato coerente.
- **Spec pre-esistenti rotte**: oltre ai 7 fallimenti già segnalati in `01-buono-pasto.md` (moduli Material mancanti nei `TestBed`), il redesign li risolve perché quei componenti sono stati riscritti; ho anche dovuto correggere `locale.service.spec.ts` (import deprecato `async` da `@angular/core/testing`, non più esportato in Angular 17) e cancellare due spec di `monthly-planning` (`movement-chip`, `monthly-planning.component`) perché il builder Karma li scopre per glob del filesystem indipendentemente dall'`exclude` di `tsconfig.spec.json`, causando un errore di build test — il codice della feature resta intatto su disco, solo i test sono spariti.
- **Ambiente di sviluppo**: nessun Chrome preinstallato per Karma; i test sono stati eseguiti con `CHROME_BIN=/usr/bin/chromium`.
- Il badge ritardo treni e l'hosting del backend restano nello stato già documentato in `02-treni.md`/`CLAUDE.md`: non toccati da questo redesign.

Questo file resta comunque autonomo come riferimento di design: contiene tutte le decisioni prese, il razionale, e i passaggi eseguiti in ordine. Presupponeva che le tre feature `01`-`03` fossero già implementate (lo erano).

---

## 1. Decisioni di design (tutte confermate dall'utente)

### Contesto d'uso

- **Desktop**, tab tenuta aperta per tutta la giornata lavorativa. Mobile non è un obiettivo (ma vedi "responsive" più sotto: la pagina deve reggere una finestra a metà schermo).
- **Nessuna persistenza dei dati utente**, coerente con `CLAUDE.md`: nessun `sessionStorage`, nessun `localStorage` per timbrature, ore dovute o stazioni. Un ricaricamento della pagina azzera la giornata.
  - **Unica eccezione approvata**: la preferenza di tema (`"dark"` / `"light"`) in `localStorage`. Non è un dato utente, è una preferenza di visualizzazione.
- **Nessuna segnalazione a tab non attiva**: niente titolo dinamico, niente favicon dinamica, niente notifiche di sistema, **niente `beforeunload`**. L'app comunica solo mentre la si guarda. Conseguenza nota e accettata: un `Ctrl+W` distratto cancella la giornata senza chiedere nulla.
- **Lingua dell'interfaccia: italiano**, ovunque. Nessun i18n, nessuna stringa inglese residua ("Insert hours due", "Start", "Stop", "CALC", "REMOVE", "ADD" spariscono tutte).

### Struttura

- **Applicazione a pagina unica.** La rotta `/trains` viene fusa in home; la rotta `/monthly` viene rimossa dal routing (il codice resta su disco, è parte di una feature ancora da definire). Sparisce l'header di navigazione.
- **Layout a due colonne** su schermo largo:
  - **Colonna sinistra (si legge)**: hero + scena illustrata. Mai scrollata via.
  - **Colonna destra (si agisce)**: bottone "Aggiungi timbratura", lista timbrature, blocco treni.
- **Niente barra superiore.** L'interruttore del tema è una piccola icona flottante in un angolo.

### Hero — quattro stati

Il numero grande cambia significato secondo lo stato. Precedenza, dalla più alta:

| # | Stato | Condizione | Numero grande | Riga secondaria |
|---|---|---|---|---|
| 0 | **Incoerente** | una coppia ha uscita < ingresso, o due coppie si sovrappongono | `Dati incoerenti` | "controlla le righe evidenziate" |
| 1 | **Vuoto** | nessuna timbratura | — (al suo posto il bottone "Aggiungi timbratura" in grande) | — |
| 2 | **Completato** | minuti lavorati ≥ minuti dovuti | `PUOI USCIRE` | "8h 24m fatte · **+24m**" |
| 3 | **In corso** | numero dispari di timbrature (sei dentro) | orario di uscita previsto, es. `17:12` | "3h 42m fatte · mancano 4h 18m" |
| 4 | **In pausa** | numero pari > 0 di timbrature, obiettivo non raggiunto | `mancano 4h 18m` | "riprendi per vedere l'orario di uscita" |

Razionale dello stato 4: mostrare un orario di uscita mentre l'orologio è fermo sarebbe una bugia (scorrerebbe in avanti da solo, minuto per minuto). È lo stato in cui ci si trova ogni giorno a pranzo e che l'app attuale non sa raccontare.

Sotto il numero grande, riga cliccabile **"su 8h 00m dovute"**: al click il valore diventa un input modificabile. Sostituisce l'attuale campo "Insert hours due" sempre visibile.

### Ricalcolo

- **Continuo**: ogni modifica a una timbratura aggiorna istantaneamente hero, scena e buono pasto.
- **Spariscono il bottone CALC e lo snackbar dei risultati.** Sparisce anche lo stato "CALC disabilitato con timbrature dispari": quello diventa semplicemente lo stato 3 (in corso).
- **Tick da 60 secondi** allineato al cambio di minuto, attivo **solo nello stato 3 (in corso)**: serve perché "ore fatte finora" e il passaggio automatico a `PUOI USCIRE` dipendono dall'ora corrente. L'orario di uscita previsto invece è deterministico (dipende solo dalle timbrature e dalle ore dovute) e non richiede il tick. Nessun tick negli altri stati.

### Timbrature

- **Zero righe all'avvio.** La lista parte vuota.
- **Bottone "AGGIUNGI TIMBRATURA"** fisso in cima alla colonna destra, sempre alla stessa altezza, sempre visibile. Nello stato vuoto è anche l'elemento grande dell'hero.
- Al click registra **l'ora esatta al minuto** (nessun arrotondamento) e **dà il focus al campo appena creato con il testo selezionato**, così si corregge da tastiera senza toccare il mouse.
- **Un solo `<input type="time">` per timbratura**, al posto degli attuali due input numerici ora/minuti + bottone orologio.
- **Rimozione: solo l'ultima riga** (un bottone, come oggi). Le righe in mezzo si correggono modificandole.
- **Orario fuori ordine: si segnala, non si blocca e non si riordina.** La riga si colora di negativo e l'hero passa allo stato 0. Razionale: mentre si digita `19:00`, dopo il primo carattere il valore è `1:00` ed è quasi sempre incoerente — bloccare impedirebbe di finire di scrivere, riordinare sposterebbe la riga sotto il cursore.

### Buono pasto

- **Badge nell'hero**, compatto: icona + "Buono pasto ✔ / ✘".
- **Al click si espande** mostrando i quattro criteri con spunta individuale: mattina ≥ 3h30, pausa ≥ 30 min dentro 12:30-14:30, pomeriggio ≥ 2h, totale ≥ 7h. Serve a rispondere alla sola domanda che ci si pone quando è ✘: *cosa mi manca, faccio ancora in tempo?*
- Richiede di estendere `MealVoucherService`: oltre a `isMealVoucherEarned()` serve un metodo che ritorni il dettaglio per criterio (vedi Fase 5).

### Treni

- Blocco in fondo alla colonna destra. Le impostazioni (stazioni, minuti per raggiungere la stazione) restano in un `<details>` richiudibile, com'è già oggi.
- **Nessuna chiamata di rete al caricamento della pagina.** Va rimossa la `this.search()` in `ngOnInit`. Si cerca solo su richiesta esplicita.
- **Degradazione discreta**: l'hero mostra la riga treno **solo** se una ricerca è già andata a buon fine; altrimenti mostra un invito sobrio "cerca i treni →" che porta al blocco. Nessun errore rosso permanente. Questo copre sia il caso "non hai ancora cercato" sia il caso attuale in cui il backend di produzione non esiste (`environment.prod.ts` punta a `https://TODO-backend-host-non-ancora-deciso`).
- **Stazioni**: partenza con default **visibile** su Udine; **arrivo vuoto**, da selezionare con l'autocomplete già esistente. Nessuna persistenza: si ricompila a ogni caricamento. Razionale: la coppia "dove lavoro / dove abito" non finisce committata in un repository pubblico.

### Stile visivo

- **Direzione**: lo-fi caldo per l'interfaccia + **un solo** elemento illustrato low poly (la scena). Nessuna decorazione altrove.
- **Palette "blu notte"**, scuro di default. L'interfaccia è fredda proprio perché la scena è calda: se i pannelli fossero ambra come il tramonto, il tramonto smetterebbe di essere l'elemento che cattura l'occhio.

```
/* scuro (default) */          /* chiaro */
--bg:            #131a22        #f4efe7
--surface:       #1c2530        #fffaf3
--surface-alt:   #243040        #efe7db
--text:          #dce6ee        #2a2420
--text-muted:    #8d9bab        #6b6058
--border:        #2c3846        #ded2c2
--accent:        #f0913c        #c26f1e
--positive:      #6f9b8a        #4a7566
--negative:      #c4614f        #a8412f
```

- **Tipografia: solo font di sistema.** `ui-sans-serif` per l'interfaccia, `ui-monospace` per tutte le cifre (orari, totali, hero), a peso alto e crenatura larga. Nessun webfont, nessuna richiesta di rete. Il monospaziato evita anche che il numero grande "balli" a ogni minuto che passa.
- **Movimento: transizioni sobrie, ~400ms**, solo quando i dati cambiano (sole e riflesso si spostano, la gallina cambia posa in dissolvenza). **Nessuna animazione in loop** — una tab aperta otto ore non deve tenere un `requestAnimationFrame` perenne né muoversi nel campo visivo periferico. `prefers-reduced-motion: reduce` azzera tutte le transizioni.
- **Tema**: scuro di default, interruttore manuale flottante, preferenza in `localStorage`. Non si segue `prefers-color-scheme` (la scelta esplicita ha la precedenza, e il default è scuro).

### La scena

Soggetto: **lago all'orizzonte, con una gallina sulla riva.** Codifica due informazioni su due oggetti distinti, che non si pestano i piedi:

**1. Il sole = il progresso quantitativo.** Con `p = clamp(minutiLavorati / minutiDovuti, 0, 1)`, il disco solare scende verso l'acqua e **tocca l'orizzonte esattamente quando `p = 1`**. La scia di riflesso sull'acqua si allunga con `p`, dando una lettura fine dell'ultima ora. Oltre l'obiettivo (straordinario) il sole affonda sotto l'orizzonte, il cielo vira al notturno e le stelle compaiono in dissolvenza (saturazione a +2h di straordinario).

Razionale: è l'unica lettura in cui "obiettivo raggiunto" ha un momento visivo netto e non arbitrario, invece di un riempimento da stimare a occhio. Un livello d'acqua che sale, l'alternativa scartata, avrebbe anche annegato la gallina.

**2. La gallina = lo stato qualitativo.** Quattro pose, una per stato dell'hero, in cross-fade da 400ms:

| Stato | Posa |
|---|---|
| Vuoto | accovacciata, occhi chiusi |
| In corso | in piedi, che becca |
| In pausa | seduta |
| Completato | ali spiegate |

**3. La ciotola = il buono pasto.** Oggetto separato accanto alla gallina: **piena** se il buono pasto è conseguito, **vuota** altrimenti. Deliberatamente non è la gallina stessa: due informazioni sullo stesso oggetto avrebbero richiesto una regola di precedenza da ricordare.

Lo stato 0 (incoerente) non ha una rappresentazione dedicata nella scena: resta l'ultima posa valida, il messaggio è nell'hero.

---

## 2. Vincoli tecnici

- **Via Angular Material, Bootstrap e Font Awesome.** CSS puro con custom properties, griglia in `display: grid` nativo, l'unica icona come `<svg>` inline. Quello che Material fornisce qui sono input, bottoni e card: in CSS puro costano meno righe di quante ne servirebbero per ri-tematizzarlo, e la sua estetica (elevation, ripple, label flottanti) combatte frontalmente la direzione scelta.
- **Portata del refactor: interfaccia + il minimo di logica che il ricalcolo continuo richiede.** In particolare: calcolo in minuti interi al posto del parsing su stringa di `calcTimeSpent()`, eliminazione del bus a eventi `onSetTimes`, stato in un unico posto. **Niente conversione a signals** — è il modo giusto ma è un cambio che tocca ogni componente e si fa bene da solo, dopo, non insieme al redesign.
- **Nessuna nuova dipendenza npm.** Il saldo netto è di tre dipendenze in meno.
- **Giornata singola**: nessun turno che scavalca la mezzanotte.

---

## 3. Fasi

### Fase 0 — La scena, prima del codice

**Stato: disegnata.** Sorgente in [assets/scena.svg](assets/scena.svg) (variante `p = 0`, stato *vuoto*). Il file contiene tutti i gruppi delle cinque varianti; è già la base del template del componente Angular — vanno solo sostituiti gli attributi calcolati con i binding.

#### Struttura dell'SVG

`viewBox="0 0 480 300"`, nessuna dimensione fissa. Orizzonte a `y = 170`, acqua `170-254`, riva `254-300`. Tutte le superfici sono `<polygon>` a faccette piatte. Ordine dei livelli (dal fondo):

| # | `id` | Ruolo |
|---|---|---|
| 1 | `sky-day` | cielo diurno, 4 bande + 2 faccette |
| 2 | `sky-dusk` | stessa geometria, palette tramonto |
| 3 | `sky-night` | stessa geometria, palette notturna |
| 4 | `stars` | 11 losanghe nella parte alta |
| 5 | `sun` | ottagono a due faccette. **Sta sotto l'acqua e sotto i monti**: affondando sparisce davvero |
| 6 | `ridge` | crinale lontano, due strati. Lascia **libero il centro `196-392`**, la fascia dove tramonta il sole |
| 7 | `water` | 4 bande, **più chiare della riva** perché il lago si legga |
| 8 | `water-night` | velo notturno sull'acqua |
| 9 | `reflection` | scia, 5 trapezi, ancorata a `y = 171` |
| 10 | `shore` | riva in primo piano + 3 canne |
| 11 | `bowl-full` / `bowl-empty` | ciotola, a `translate(196,280)` |
| 12 | `hen-idle` / `hen-pecking` / `hen-sitting` / `hen-wings` | le quattro pose, a `translate(96,286)` |

#### Mappatura (i binding del componente)

```
pc = clamp(workedMinutes / dueMinutes, 0, 1)
ov = clamp(overtimeMinutes / 120, 0, 1)

#sun          transform = translate(230 + 70*pc, 44 + 108*pc + 48*ov)
#reflection   transform = translate(sunX, 171) scale(1, pc)
              opacity   = (0.25 + 0.75*pc) * (1 - 0.85*ov)
#sky-dusk     opacity   = pc ** 0.8
#sky-night    opacity   = ov
#water-night  opacity   = 0.85 * ov
#stars        opacity   = ov
#hen-*        opacity   = 1 sulla posa dello stato corrente, 0 sulle altre
#bowl-full    opacity   = mealVoucherEarned ? 1 : 0   (#bowl-empty l'inverso)
```

A `pc = 1` il bordo inferiore del sole è tangente all'acqua: il momento "puoi uscire" è una **tangenza**, non un riempimento da stimare a occhio. Le uniche proprietà toccate sono `transform` e `opacity` — nessun colore animato, nessun loop, nessun `requestAnimationFrame`, `transition: .4s ease` su `[data-anim]`.

#### Pose della gallina

| Stato | `id` | Posa |
|---|---|---|
| Vuoto | `hen-idle` | accovacciata (`translate(0,9)`), testa infilata nel corpo, occhio chiuso (un trattino) |
| In corso | `hen-pecking` | in piedi, zampe visibili, collo e testa ruotati verso terra, becco a filo del suolo |
| In pausa | `hen-sitting` | seduta (`translate(0,7)`), zampe nascoste, testa alta, occhio aperto |
| Completato | `hen-wings` | in piedi, due ali aperte (una dietro e una davanti al corpo), testa alta |

#### Tre correzioni emerse disegnando, da non reintrodurre

1. **La scia non deve essere segmentata troppo**: con segmenti corti e distanziati legge come una scalinata invece che come un riflesso. Cinque trapezi con gap di 4px e colore caldo acceso (`#ffcf8e`) è la soglia oltre la quale funziona.
2. **La gallina non deve pesare più del sole.** Alla prima stesura era alta ~60px e larga ~115: catturava l'occhio prima del dato principale, invertendo la gerarchia. Ridimensionata a ~59×85 e spostata in basso a sinistra.
3. **L'acqua deve essere più chiara della riva.** Con acqua scura e riva verde media il lago spariva e la scena leggeva come "montagne più un campo". Ora la banda d'acqua all'orizzonte è `#4a5a70` e la riva parte da `#232a1c`.

#### Palette della scena

Indipendente dal tema dell'interfaccia (il tramonto è caldo in entrambi); solo la cornice attorno alla scena usa i token.

```
cielo giorno    #3f5d78  #5a7b92  #81a0ab  #aec0bb
cielo tramonto  #2a2f52  #5b4270  #a8546a  #e58a43
cielo notte     #0d1019  #131829  #1b2238  #26304a
sole            #f0913c / #f8cf8e        scia  #ffcf8e / #fff2d8
crinale         #233043 / #1a2532
acqua           #4a5a70  #2d4258  #24374c  #1c2c3e
riva            #232a1c  #2b3323  #1d2317  #313a27
gallina         #e8ddd0 corpo · #cdbfae ombra · #f6efe4 ala
                #c4614f cresta e bargigli · #f0913c becco e zampe · #1b2530 occhio
ciotola         #6b5a4a scodella · #8d7b69 bordo · #f0c07a mangime
```

### Fase 1 — Fondamenta CSS e pulizia dipendenze

1. Riscrivere `ShiftManager.UI/src/styles.scss`: rimuovere i due `@import` (tema Material prebuilt + Bootstrap) e sostituirli con i token del paragrafo "Stile visivo" su `:root` più `[data-theme="light"]`, un reset minimo, gli stili di base di `input`, `button`, `details`, e la scala tipografica.
2. `ShiftManager.UI/src/index.html`: rimuovere il `<link>` a Font Awesome, `lang="en"` → `lang="it"`, titolo → qualcosa di sensato.
3. Disinstallare `@angular/material`, `@angular/cdk`, `bootstrap`; rimuovere ogni `Mat*Module` da `app.module.ts` e da `trains/trains.module.ts`; rimuovere `BrowserAnimationsModule` se non serve più.
4. Cancellare i file morti confermati: `ShiftManager.UI/src/styles.css` (vuoto e non referenziato), `src/app/app.config.ts` e `src/app/app.routes.ts` (residui standalone di `ng new`, mai importati), `src/app/app.component.css` (il componente usa `.scss`).
5. `ShiftManager.UI/src/proxy.conf.js` e `ShiftManager.API/WeatherForecastController.cs` + `WeatherForecast.cs` sono residui del template Visual Studio: **fuori scope di questo piano**, ma vanno segnalati.

> ⚠️ **Trappola da gestire in questa fase.** `monthly-planning` usa `MatTableModule`/`MatSelectModule`. Togliendo la rotta ma lasciando i file su disco, TypeScript continua a compilarli (sono dentro `include` di `tsconfig.app.json`) e la build si rompe appena Material è disinstallato. Soluzione: aggiungere `"exclude": ["app/monthly-planning/**"]` a `tsconfig.app.json` e rimuovere l'import di `MonthlyPlanningModule` da `app.module.ts`. I file restano leggibili come traccia della feature futura, ma non entrano in compilazione. Vale anche per `movement-chip`, che è dentro quella cartella.

### Fase 2 — Shell a pagina unica

1. `app-routing.module.ts`: restano `{path: 'home'}` e `{path: '**', redirectTo: 'home'}`. Rimuovere le rotte `monthly` e `trains`.
2. `app.component.html`: via l'header con i tre bottoni, via il footer vuoto. Resta il `<router-outlet>` più l'interruttore del tema flottante.
3. `app.component.scss`: via `height: 90vh` e i margini fissi da 50px. La pagina usa il flusso normale, con `max-width` sul contenitore e centratura.
4. Creare `src/app/Services/theme.service.ts`: legge `localStorage.getItem('theme')`, default `"dark"`, scrive su `documentElement.dataset.theme`, espone un `toggle()`. Wrappare lettura e scrittura in `try/catch` (il `localStorage` può lanciare in modalità restrittive).

### Fase 3 — Il motore di calcolo

Creare `src/app/home/services/day-calculator.service.ts`, stateless, che da `intervals: Date[]` e `hoursDue` produce un unico oggetto di stato consumato da hero, scena e badge:

```ts
interface DayState {
  status: 'empty' | 'incoherent' | 'working' | 'onBreak' | 'done';
  workedMinutes: number;         // interi, mai parsing di stringhe
  dueMinutes: number;
  remainingMinutes: number;      // 0 se done
  overtimeMinutes: number;       // 0 se non done
  expectedExitTime: Date | null; // valorizzato solo in 'working'
  progress: number;              // workedMinutes / dueMinutes, non limitato a 1
  invalidIndexes: number[];      // righe da evidenziare in 'incoherent'
}
```

Regole: tutti i calcoli in minuti interi con `Math.round((end - start) / 60000)`; nello stato `working` l'intervallo aperto conta fino a `now`; la precedenza degli stati è quella della tabella dell'hero (incoerente prima di tutto, poi completato, poi in corso, poi in pausa, poi vuoto).

Questo servizio sostituisce il corpo di `calcTimeSpent()` e riusa la logica già corretta di `computeHoursDueReachedAt()`. **Lasciare un test**: `day-calculator.service.spec.ts` con un caso per stato più il caso incoerente — è la sola logica non banale del redesign.

### Fase 4 — Hero e scena (colonna sinistra)

1. Creare `src/app/home/Components/day-hero/` — consuma `DayState`, rende i cinque casi della tabella, la riga "su 8h 00m dovute" cliccabile-in-input, il badge buono pasto espandibile e la riga treno/invito.
2. Creare `src/app/home/Components/day-scene/` — l'SVG approvato in Fase 0, con i binding su `progress` e `status`. Nessun `requestAnimationFrame`: solo transizioni CSS.
3. Il tick da 60s vive in `HomeComponent`: `setInterval` avviato solo in stato `working`, fermato in `ngOnDestroy` e a ogni cambio di stato.

### Fase 5 — Timbrature (colonna destra)

1. Riscrivere `timespan-row.component.*`: un `<input type="time">`, l'etichetta "Ingresso"/"Uscita" secondo la parità dell'indice, nessun bottone orologio per riga, classe di errore se l'indice è in `invalidIndexes`.
2. **Eliminare il bus a eventi**: via `@Input() onSetTime: EventEmitter`, via `onSetTimes.emit()`, via `setValues()`. La riga emette il nuovo valore a ogni `change`, `HomeComponent` è l'unica fonte di verità.
   - Questo chiude anche il bug per cui `ngOndestroy()` (minuscola errata, `timespan-row.component.ts:31`) non è mai stata invocata da Angular: il metodo sparisce con la sottoscrizione.
3. **Correggere il bug della data** (`timespan-row.component.ts:38`): `new Date().getDay()` ritorna il giorno della settimana (0-6) e viene passato dove serve il giorno del mese. Rientra nel "minimo di logica" approvato ed è prerequisito di qualunque confronto fra orari.
4. `home.component.html`: layout a due colonne in `display: grid`, bottone "AGGIUNGI TIMBRATURA" fisso in cima alla colonna destra con focus automatico sul campo creato, bottone di rimozione dell'ultima riga, via il bottone CALC.
5. Estendere `meal-voucher.service.ts` con un metodo che ritorna il dettaglio per criterio (`{ morning, lunch, afternoon, total, earned }`) senza rompere `isMealVoucherEarned()` né i suoi 8 test esistenti.

### Fase 6 — Treni nella colonna destra

1. `trains.component.ts`: rimuovere la `search()` da `ngOnInit`; default di partenza su Udine visibile nel campo, arrivo vuoto (rimuovere `DEFAULT_ARRIVAL_LOCATION_ID` dall'inizializzazione e renderlo obbligatorio prima della ricerca).
2. `trains.component.html` e `train-card`, `station-search`: riscrivere senza Material, con i token. Lo spinner da 200px diventa un indicatore inline discreto.
3. `TrainsComponent` viene usato come componente figlio dentro `home.component.html`, non più come pagina. `TrainsModule` va esportato e importato di conseguenza.
4. L'hero legge da `TrainSuggestionService` (già condiviso, già in memoria per la sola sessione): se `hasSearched()` è falso, mostra l'invito invece della riga treno.

### Fase 7 — Responsive e rifiniture

1. Due sole `@media` (oggi in tutto `src/` non ce n'è nemmeno una):
   - sotto **~900px**: le due colonne collassano in una, hero e scena in cima;
   - sotto **~600px**: la scena sparisce (`display: none`), resta l'hero testuale. È deliberatamente l'elemento non essenziale, quindi è il primo a cedere.
2. `@media (prefers-reduced-motion: reduce)`: azzerare tutte le `transition`.
3. Verificare il contrasto dei token in entrambi i temi (testo su `--surface` ≥ 4.5:1) e che ogni controllo sia raggiungibile da tastiera con un `:focus-visible` visibile — l'accessibilità di base non è tra le cose da tagliare.

### Fase 8 — Verifica

1. `ng build --configuration production` deve passare senza Material/Bootstrap in `package.json`.
2. `ng test`: i test di `meal-voucher.service` (8) e `train-suggestion.service` (7) devono continuare a passare, più i nuovi di `day-calculator.service`. Nota: **7 fallimenti preesistenti** su `AppComponent` ecc. sono causati proprio dai moduli Material mancanti nei `TestBed` — questo piano li risolve o li rende irrilevanti, ma vanno ricontrollati uno a uno, non dati per sistemati.
3. Confronto della dimensione del bundle prima/dopo: è la misura più onesta dell'effetto di togliere tre dipendenze.
4. Controllo manuale dei cinque stati dell'hero e delle quattro pose della gallina, in tema scuro e chiaro, a larghezza piena / 800px / 500px.

---

## 4. Riepilogo dei file

**Creati**
- `src/app/Services/theme.service.ts`
- `src/app/home/services/day-calculator.service.ts` (+ `.spec.ts`)
- `src/app/home/Components/day-hero/` (ts/html/css)
- `src/app/home/Components/day-scene/` (ts/html/css)

**Riscritti**
- `src/styles.scss` · `src/index.html` · `src/app/app.component.{html,scss}` · `src/app/app.module.ts` · `src/app/app-routing.module.ts`
- `src/app/home/home.component.{ts,html,css}`
- `src/app/home/Components/timespan-row/*`
- `src/app/trains/trains.component.{ts,html,css}` · `trains.module.ts` · `Components/train-card/*` · `Components/station-search/*`

**Estesi**
- `src/app/home/services/meal-voucher.service.ts` (dettaglio per criterio)

**Cancellati**
- `src/styles.css` · `src/app/app.config.ts` · `src/app/app.routes.ts` · `src/app/app.component.css`

**Esclusi dalla compilazione, lasciati su disco**
- `src/app/monthly-planning/**` (feature ancora da definire), via `tsconfig.app.json`

**Dipendenze rimosse**
- `@angular/material` · `@angular/cdk` · `bootstrap` · Font Awesome da CDN

---

## 5. Fuori scope, segnalato

- **Hosting del backend**: `environment.prod.ts` punta a `https://TODO-backend-host-non-ancora-deciso`, quindi la ricerca treni sul sito pubblicato non funziona. Il redesign degrada in modo pulito (Fase 6, punto 4) ma non risolve il problema.
- **Ritardi dei treni**: come già documentato in `02-treni.md`, l'API di lefrecce.it non li espone; il badge esiste ma non si attiva mai.
- **Vista mensile**: nascosta, non cancellata. Prima di riprenderla va deciso cosa significhi una vista mensile in un'app che per design non ricorda nulla tra una sessione e l'altra.
- **Conversione a signals**: rimandata, deliberatamente.
- **Residui del template Visual Studio**: `proxy.conf.js` non agganciato ad `angular.json`, `WeatherForecast*` nell'API.
