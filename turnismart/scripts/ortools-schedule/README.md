# OR-Tools Scheduling Solver

Solver CP-SAT di Google OR-Tools per la generazione automatica degli orari.

## Requisiti

- Python 3.9+
- [OR-Tools](https://developers.google.com/optimization) (`pip install ortools`)

## Installazione

```bash
pip install -r scripts/ortools-schedule/requirements.txt
```

## Utilizzo

Il solver viene invocato automaticamente da `generateScheduleWithAIAction` quando `USE_ORTOOLS` è abilitato (default). Per disabilitare OR-Tools e usare solo AI:

```
USE_ORTOOLS=false
```

## Flusso

1. **OR-Tools** (primary): ottimizzazione vincoli, massima copertura
2. **AI** (fallback): se OR-Tools fallisce o non è configurato
3. **fillUncoveredSlots**: riempie eventuali slot residui

## Test manuale

```bash
echo '{"weekStart":"2025-02-10","slots":[{"locationId":"loc1","roleId":"role1","dayOfWeek":0,"period":"morning","required":1}],"employees":[{"id":"emp1","roleIds":["role1"],"maxHours":40}]}' | python scripts/ortools-schedule/solver.py
```

## Docker locale

Per testare in locale come in produzione con l'API HTTP:

```bash
cd scripts/ortools-schedule
docker compose up --build
```

L'API sarà disponibile su `http://localhost:8000`. Aggiungi in `.env.local` (nella root del progetto turnismart):

```
ORTOOLS_SERVICE_URL=http://localhost:8000
```

Poi l'app Next.js invocherà il solver via HTTP invece del subprocess Python.

## Deploy su Railway

1. Vai su [railway.app](https://railway.app) - New Project - Deploy from GitHub
2. Seleziona il repo e configura:
   - **Root Directory**: `scripts/ortools-schedule` (oppure imposta `RAILWAY_DOCKERFILE_PATH=scripts/ortools-schedule/Dockerfile` se la root è la repo)
3. Railway rileva il Dockerfile e avvia il build
4. Settings - **Generate Domain** - copia l'URL (es. `https://xxx-production.up.railway.app`)
5. Nella app Next.js (Vercel o altro): aggiungi variabile d'ambiente:
   - `ORTOOLS_SERVICE_URL` = URL Railway (es. `https://xxx-production.up.railway.app`)

Railway inietta automaticamente `PORT`; il servizio risponde su `/solve` (POST) e `/health` (GET).

## Variabili d'ambiente

| Variabile | Dove | Descrizione |
|-----------|------|-------------|
| `USE_ORTOOLS` | Next.js | `true` (default) per abilitare OR-Tools |
| `ORTOOLS_SERVICE_URL` | Next.js | URL del servizio solver (Docker/Railway). Se assente, usa subprocess Python locale |

## Deploy (alternativa senza Docker)

Su Vercel/serverless: Python non è disponibile di default.

1. **Con ORTOOLS_SERVICE_URL**: deploy del solver su Railway (vedi sopra)
2. **Senza**: `USE_ORTOOLS=false` - usa solo AI
