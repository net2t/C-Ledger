# C‑Ledger (Case Management + Payment Ledger)

A lightweight React + SQLite case management and payment ledger system for small teams. **TM Number is the primary key** for cases.

## Tech

- Frontend: React (Vite)
- API: Express
- Database: SQLite (`better-sqlite3`)

## Folder structure

```text
.
├─ server/
│  ├─ index.js
│  ├─ schema.sql
│  └─ lib/
│     ├─ db.js
│     └─ backup.js
├─ src/
│  ├─ App.jsx
│  └─ lib/
│     ├─ api.js
│     └─ useDebounce.js
└─ data/           # created on first run (SQLite .db lives here)
```

## Database schema (summary)

- `cases`
  - `tm_number` (UNIQUE)
  - `client_name`, `case_type` (X/Y/B), `phase` (1-4)
  - `assigned_to`, `deadline_date`, `remarks`
  - phase date fields: `submitted_date`, `acknowledged_date`, `published_date`, `completed_date`
- `payments`
  - linked by `case_id`, also stores `tm_number`
  - `direction`: `in` or `out`

## Run (development)

Open **two terminals**:

1) API server (creates `data/c-ledger.db` automatically)

```bash
npm run dev:api
```

1) React app

```bash
npm run dev
```

The React dev server proxies `/api/*` to `http://localhost:5174` via `vite.config.js`.

## TM auto-fetch (important behavior)

On the Payments screen, when you type a TM number, the UI automatically calls:

`GET /api/cases/by-tm/:tmNumber`

It shows:

- Client Name
- Current Phase
- Previous Payments count

If not found, it shows: **"Case not found"**.

## SQLite auto-backup (local folder)

Backups are implemented in `server/lib/backup.js` and will copy the `.db` file to a backup folder on an interval.

Environment variables (optional):

- `DATA_DIR` (default: `data`)
- `SQLITE_FILE` (default: `c-ledger.db`)
- `BACKUP_DIR` (default: `backups`)
- `BACKUP_ENABLED` (default: `1`)
- `BACKUP_EVERY_MINUTES` (default: `60`)
- `BACKUP_KEEP_DAYS` (default: `30`)

### Google Drive sync (silent backup)

Point `BACKUP_DIR` to a folder that is already synced by Google Drive for Desktop (or sync the `backups/` folder). No code change required.
