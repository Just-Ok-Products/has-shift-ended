# ShiftManager.API

Backend .NET 7. Ruolo attuale: **proxy CORS passthrough** verso le API di lefrecce.it per la
feature treni (`GET /api/trains/stations`, `POST /api/trains/solutions`), dato che lefrecce.it
non espone header CORS e non è chiamabile direttamente da un frontend statico su GitHub Pages.
Nessuna logica applicativa o persistenza in queste rotte.

## Build immagine Docker

Il progetto ha una `ProjectReference` verso `../ShiftManager.Core`, quindi il contesto di build
deve essere la **root del repo**, non la cartella `ShiftManager.API/`:

```bash
docker build -f ShiftManager.API/Dockerfile -t shiftmanager-api .
```

## Run

```bash
docker run -p 5200:8080 shiftmanager-api
```

L'app ascolta sulla porta 8080 all'interno del container (default immagine `aspnet:7.0`); il
comando sopra la espone in locale su `5200`, coerente con `apiBaseUrl` di sviluppo del frontend
(`ShiftManager.UI/src/environments/environment.ts`).

## Variabili d'ambiente

- `ConnectionStrings__ShiftManager` — stringa di connessione MySQL. **Non richiesta** per gli
  endpoint proxy treni (`/api/trains/*`): l'app si avvia comunque senza DB configurato, la
  connessione verrebbe aperta solo dalle rotte che usano `ShiftManagerContext` (es.
  `MovementController`).
- `ASPNETCORE_ENVIRONMENT` — `Development` per abilitare Swagger.

## Hosting di produzione

**Non ancora deciso.** La pipeline CI/CD (vedi `Azioni/03-cicd.md`) si limita a pubblicare
l'immagine su GitHub Container Registry (GHCR) ad ogni push su `master`; non esiste deploy
automatico in nessun ambiente di produzione.
