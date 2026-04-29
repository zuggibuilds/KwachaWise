# KwachaWise MVP

KwachaWise is a mobile-first personal finance web app for the Zambian market.

## Stack

- Frontend: Vite + React + TypeScript + Tailwind CSS + Chart.js
- Backend: Node.js + Express + TypeScript
- Database: SQLite
- Auth: JWT (access token)

## Important Data Rules

- Money values are stored as integer ngwee (`amount_ngwee`).
- Transaction dates are stored as `YYYY-MM-DD` text.
- Budget months are stored as `YYYY-MM` text.
- User scoping is enforced by `user_id` filters for all user-owned records.

## Project Layout

- `server/` API, DB, migrations, seed
- `client/` mobile-first React app
- `README.md` setup and API docs

## Setup

1. Install dependencies from repo root:

```bash
npm install
```

2. Configure server environment variables (PowerShell example):

```powershell
$env:SERVER_PORT="4000"
$env:DATABASE_PATH="./data/kwachawise.sqlite"
$env:JWT_SECRET="replace-with-strong-secret"
$env:CLIENT_ORIGIN="http://localhost:5173"
```

Or create a `server/.env` file:

```env
SERVER_PORT=4000
DATABASE_PATH=./data/kwachawise.sqlite
JWT_SECRET=replace-with-strong-secret
CLIENT_ORIGIN=http://localhost:5173
```

3. Run migrations and seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Start both apps:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`

## Scripts

- Root:
  - `npm run dev` run client + server
  - `npm run build` build client + server
  - `npm run db:migrate` run DB migrations
  - `npm run db:seed` run seed data
- Server:
  - `npm --prefix server run dev`
  - `npm --prefix server run build`
  - `npm --prefix server run db:migrate`
  - `npm --prefix server run db:seed`
- Client:
  - `npm --prefix client run dev`
  - `npm --prefix client run build`

## API Summary

### Auth

- `POST /api/auth/register` body: `{ email, password }` -> `{ token }`
- `POST /api/auth/login` body: `{ email, password }` -> `{ token }`
- `GET /api/me` auth required

### Categories

- `GET /api/categories` auth required
- `POST /api/categories` body: `{ name }` auth required

### Transactions

- `GET /api/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&type=&categoryId=` auth required
- `POST /api/transactions` auth required
- `PATCH /api/transactions/:id` auth required
- `DELETE /api/transactions/:id` auth required

### Budgets

- `GET /api/budgets?month=YYYY-MM` auth required
- `POST /api/budgets` auth required
- `PATCH /api/budgets/:id` auth required
- `DELETE /api/budgets/:id` auth required

### Goals

- `GET /api/goals` auth required
- `POST /api/goals` auth required
- `PATCH /api/goals/:id` auth required

### Reports

- `GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` auth required

### PAYE

- `POST /api/paye/calculate` body: `{ gross_monthly_ngwee, effective_date? }`

### Chilimba

- `GET /api/chilimba` auth required
- `POST /api/chilimba` auth required
- `POST /api/chilimba/:id/members` auth required
- `PATCH /api/chilimba/:id/members/reorder` auth required
- `POST /api/chilimba/:id/start` auth required
- `GET /api/chilimba/:id` auth required
- `PATCH /api/chilimba/:id/rounds/:roundId/payments/:memberId` auth required
- `POST /api/chilimba/:id/rounds/:roundId/complete` auth required

## Standard Error Format

All errors are returned as:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message"
  }
}
```

## Security Note

For MVP speed, JWT is stored in `localStorage` on the client. This is vulnerable to token theft via XSS. For production hardening, move to secure HttpOnly cookies + CSRF protections.

## Manual Test Checklist

- [ ] Register a new account, then log in and confirm `/api/me` works.
- [ ] Add custom category and verify category list includes defaults + custom.
- [ ] Add income and expense transactions; edit and delete one transaction.
- [ ] Create month/category budget and confirm progress changes when expense transactions are added.
- [ ] Open dashboard and reports pages; confirm charts load and values match transactions.
- [ ] Create and update a savings goal.
- [ ] Run PAYE calculation with a sample monthly gross amount.
- [ ] Create chilimba draft, add members, start group.
- [ ] Toggle round payments paid/unpaid and verify paid gate logic.
- [ ] Complete round only when all paid; verify next round auto-creates with continuous payout order.
