# PC Marketplace

A PC component marketplace, implemented twice: a Python console app and an independent React/TypeScript SPA.

## Two implementations

Both implement the same domain — components (GPU/CPU/RAM/etc.) with stock, and orders that reserve stock "all or nothing" (an order only commits if every item has enough stock; canceling an order returns the stock) — but they're separate, standalone codebases, not a shared backend with two frontends.

- **`app.py` / `marketplace.py`** — a Spanish-language console app. The `Marketplace` class holds components and orders in memory (no disk, no database; data is lost on exit).
- **`frontend/`** — a React 19 + TypeScript + Vite single-page app that reimplements the same domain logic from scratch in TypeScript (`src/domain/marketplace.ts`), with its own UI: catalog view, a create/edit drawer, order placement, order history with cancellation, a stock gauge, and toast notifications. It persists to `localStorage` (`src/domain/persistence.ts`) instead of memory, but does not call the Python app or any backend.

## Stack

- Python 3 (standard library only — `dataclasses`)
- React 19, TypeScript, Vite

## Running it

### Console app

No dependencies beyond the standard library, so no venv or `pip install` needed:

```bash
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
