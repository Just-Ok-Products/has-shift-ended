# Feature: CI/CD automatica

## Stato implementazione: ✅ completata (2026-09-18)

Creati `.github/workflows/deploy-frontend.yml` e `.github/workflows/build-backend.yml` con i trigger/path-filter esatti del piano; YAML validato con parser Python. Verificata via build reale che l'output Angular 17 (builder `application`/esbuild) finisce in `ShiftManager.UI/dist/has-shift-ended/browser` (sottocartella `browser` aggiunta automaticamente, non `dist/has-shift-ended/` come si potrebbe assumere) — `publish_dir` del workflow punta lì. Il `build-backend.yml` usa contesto Docker `.` (root) con `file: ShiftManager.API/Dockerfile`, coerente con la nota su `ShiftManager.Core` in `02-treni.md`.

**Restano da fare i 2 setup manuali una tantum del punto 4-5 (solo l'utente può farli su GitHub):**
1. Settings → Actions → General → Workflow permissions → **Read and write permissions**.
2. Settings → Pages → Source → verificare che sia branch `gh-pages` (probabilmente già corretto).

La verifica end-to-end del punto 6-7 (aprire PR di prova, controllare tab Actions/Packages, sito gh-pages aggiornato) non è stata ancora eseguita — richiede push/PR reali sul repo remoto.

Oggi il deploy del frontend è già configurato (`angular-cli-ghpages`, target `deploy` in `ShiftManager.UI/angular.json`, `baseHref: /has-shift-ended/`) ma va lanciato manualmente (`ng deploy`). Il backend non ha nessuna pipeline. Obiettivo: automatizzare entrambi, senza deploy manuali.

## Passaggi

1. Creare la cartella `.github/workflows/` nella root del repo.

### Frontend → GitHub Pages

2. Creare `.github/workflows/deploy-frontend.yml`:
   - Trigger: `on: push: branches: [master], paths: ['ShiftManager.UI/**']` (evita build inutili quando cambia solo il backend).
   - Job: checkout → `actions/setup-node` → `npm ci` (in `ShiftManager.UI/`) → `npm run build -- --configuration production` (verificare nome esatto dello script/configurazione in `package.json`/`angular.json`) → deploy della cartella di output (`dist/...`) su branch `gh-pages` tramite `peaceiris/actions-gh-pages@v4` (più semplice e affidabile in CI rispetto a invocare `ng deploy`, non richiede configurare credenziali git manualmente).
   - `permissions: contents: write` sul job, per permettere il push automatico al branch `gh-pages` con il `GITHUB_TOKEN` di default (nessun secret aggiuntivo da configurare).

### Backend → immagine Docker su GHCR

3. Creare `.github/workflows/build-backend.yml`:
   - Trigger: `on: push: branches: [master], paths: ['ShiftManager.API/**', 'ShiftManager.Core/**']`.
   - Job: checkout → login su GitHub Container Registry (`docker/login-action`, con `GITHUB_TOKEN`) → build immagine da `ShiftManager.API/Dockerfile` (`docker/build-push-action`) → push su `ghcr.io/<owner>/<repo>-api` con tag `latest` + tag `${{ github.sha }}`.
   - Nessun deploy automatico del container in produzione: il workflow si ferma alla pubblicazione dell'immagine (l'hosting finale è una decisione successiva, vedi [00-indice.md](00-indice.md)).
   - `permissions: packages: write` sul job per poter pubblicare su GHCR.

### Setup una tantum (manuale, solo l'utente può farlo)

4. GitHub → repo Settings → Actions → General → "Workflow permissions" impostato su **Read and write permissions** (necessario perché i workflow possano pushare su `gh-pages` e su GHCR usando il `GITHUB_TOKEN` di default).
5. GitHub → repo Settings → Pages → Source = branch `gh-pages` (verificare che sia già così, dato che il deploy manuale funziona già oggi; non dovrebbe servire modificarlo).

## Verifica

6. Aprire una PR di prova che tocca solo `ShiftManager.UI/`, verificare che solo `deploy-frontend.yml` si attivi; una PR che tocca solo `ShiftManager.API/` deve attivare solo `build-backend.yml`.
7. Fare merge su `master` e controllare: tab "Actions" del repo (entrambi i workflow completati con successo), sito `gh-pages` aggiornato, tab "Packages" del repo con la nuova immagine Docker pubblicata.
