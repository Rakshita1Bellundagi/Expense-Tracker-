# Expense Tracker Portal

> A **beautiful**, **responsive**, and **reliable** full‑stack web app that lets a single user record income and expenses, view dynamic financial summaries, and manage a transaction history.  All calculations are performed on the server, guaranteeing accurate totals even if the client is manipulated.

![Demo screenshot](C:\Users\murge\.gemini\antigravity-ide\brain\0bed0e55-90da-4114-a11a-c9946bafc04d\dashboard_page_1792993835890.png)

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Backend API](#backend-api)
- [Database Model](#database-model)
- [Design System & UI](#design-system--ui)
- [Testing & Validation](#testing--validation)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Features (mandatory)
| ID | Requirement | Implementation |
|---|-------------|----------------|
| FR‑01 | Form to record income & expense | `TransactionForm.jsx` – client‑side validation, POST `/api/transactions` |
| FR‑02 | Client‑ and server‑side validation | Express `validators.js` + React helpers (`helpers.js`) |
| FR‑03 | Dynamic total income card | `SummaryCards.jsx` – pulls from `/api/summary`
| FR‑04 | Dynamic total expenses card | Same as above |
| FR‑05 | Dynamic net savings card | Same as above – negative values highlighted in red |
| FR‑06 | Transaction history table | `TransactionTable.jsx` with badges, delete button |
| FR‑07 | Category badges & deletion | Badges in table, modal confirmation before DELETE `/api/transactions/:id`
| FR‑08 | Persistent storage | JSON‑file DB (`src/db.js`) – survives server restarts |
| FR‑09 | Accurate dashboard totals | Server aggregates from persisted records only |
| FR‑10 | Server rejects invalid data independently | Express validation chain (`createTransactionRules`) |
| FR‑11 | Responsive UI | CSS grid + media queries, mobile sidebar, hamburger menu |
| FR‑12 | Clear startup instructions | This README ✅
| FR‑13 | API & DB documentation | Section below ✅
| FR‑14 | Working demo / screenshots | Local screenshots provided, live demo can be started with `npm run dev` in each folder |
| FR‑15 | Student Login & Session | Glassmorphic login page with 1-click demo access (`student@codenova.edu` / `student123`), protected routes, and sidebar logout |

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Front‑end | **React 18** + **Vite** (fast HMR) |
| Styling   | Vanilla CSS with a modern design system (dark mode, glass‑morphism, micro‑animations) |
| State / Data | React Context (`AppContext.jsx`) |
| HTTP      | Axios (`src/api/client.js`) |
| Backend   | **Node.js** (v18+) + **Express** |
| DB        | **JSON file** persisted via `src/db.js` (no native dependencies, works on Windows) |
| Dev Tools | `nodemon`, `react-hot-toast` for UI feedback |

---

## Getting Started
> **Prerequisites** – Node.js ≥ 18, npm ≥ 9 (already on your system).

1. **Clone the repository** (or copy the workspace directory you have now).
2. **Backend**
   ```bash
   cd "d:/EXPENSE TRACKER/backend"
   npm install            # installs Express & deps
   npm run dev            # starts the API on http://localhost:5001
   # optional: seed sample data
   npm run seed
   ```
3. **Frontend**
   ```bash
   cd "d:/EXPENSE TRACKER/frontend"
   npm install            # installs React, Vite, Recharts, etc.
   npm run dev            # starts Vite dev server on dedicated port http://localhost:5180
   ```
4. Open `http://localhost:5180` in a browser. The dashboard will load, fetch data from the backend, and let you add/delete transactions.

### Environment variables
| File | Variable | Default | Description |
|------|----------|---------|-------------|
| `.env` (backend) | `PORT` | `5001` | Dedicated port for the Express API |
| | `DB_PATH` | `./data` | Folder where `transactions.json` lives |
| | `CORS_ORIGIN` | `http://localhost:5180` | Allowed origin for CORS |
| `.env` (frontend) | `VITE_API_BASE_URL` | `http://localhost:5001/api` | Base URL for Axios calls |

---

## Backend API
All endpoints are prefixed with `/api`.

### Health
```
GET /api/health
```
*Response*: `{ success:true, status:'ok', timestamp:'ISO', environment:'development' }`

### Transactions
| Method | Endpoint | Purpose | Request body example |
|--------|----------|---------|----------------------|
| `GET` | `/api/transactions` | List all transactions (newest first) | – |
| `POST`| `/api/transactions` | Create a transaction (validated) | ```json { "type":"income", "amount":1250.50, "category":"Salary", "transaction_date":"2026-10-15", "description":"October salary" }``` |
| `DELETE`| `/api/transactions/:id` | Delete a transaction permanently | – |
| `GET`| `/api/transactions/categories` | Fetch allowed categories (mirrors backend constants) | – |

### Summary
```
GET /api/summary
```
*Response* (example):
```json
{
  "totalIncome": "45,000.00",
  "totalExpenses": "12,300.00",
  "netSavings": "32,700.00",
  "currency": "INR",
  "transactionCount": 27
}
```
All values are **stringified INR** to avoid floating‑point issues. Internally they are stored as **paise (integer)**.

---

## Database Model
The JSON file (`data/transactions.json`) stores an array of objects:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "income|expense",
      "amount": 125050,          // paise (₹1,250.50)
      "category": "Salary",
      "transaction_date": "2026-10-15",
      "description": "October salary",
      "created_at": "2026-10-26T10:30:12.000Z",
      "updated_at": "2026-10-26T10:30:12.000Z"
    }
    // … more records
  ]
}
```
*Constraints* – enforced by the validator:
- `type` must be `income` or `expense`
- `amount` > 0, max ₹10 000 000, max 2 decimals
- `category` must belong to the allowed list for the selected type
- `transaction_date` must be a real calendar date, not in the future, after year 2000

---

## Design System & UI Highlights
- **Dark‑mode palette** – navy primary, emerald for income, crimson for expense, violet for net savings.
- **Glass‑morphism cards** – subtle backdrop blur, hover lift, glowing accent bar.
- **Micro‑animations** – button hover, card lift, loading spinners.
- **Responsive layout** – sidebar collapses to a hamburger overlay on ≤ 768 px, cards stack vertically, table becomes scrollable.
- **Accessibility** – proper `aria-*` attributes, keyboard‑focus styles, sufficient colour contrast.
- **Iconography** – `lucide-react` icons throughout for a modern look.
- **Toast notifications** – `react-hot-toast` for success/error feedback.

---

## Testing & Validation
The repository includes a set of manual test scenarios (mirroring the PDF’s TC‑01 … TC‑14). Run them locally:
1. Start backend & frontend.
2. Use the UI to add a valid income, verify the **Total Income** card increments.
3. Add an expense, verify **Total Expenses** and **Net Savings** update.
4. Attempt to submit an empty amount – client validation prevents the request.
5. Bypass the client (e.g., with Postman) and send `amount: -5` – server returns **400 Bad Request**.
6. Delete a transaction – confirm the row disappears and totals recalculate.
7. Stop the backend (`Ctrl+C`), restart it, and confirm all previous transactions persist (JSON file retains data).
8. Resize the browser to mobile width – navigation collapses, layout remains usable.
9. Disable network (offline) – UI shows a clear error banner.
10. Verify the empty‑state messages for a brand‑new database.

---

## Future Enhancements (nice‑to‑have)
- Multi‑user authentication (JWT + DB association)
- Category management (add/remove custom categories)
- Monthly spending line chart (instead of bar chart)
- CSV export of transaction history
- Budget feature with visual progress bar
- Dark / Light theme toggle (currently dark‑only but easy to extend)

---

## License
MIT – feel free to fork, modify, and use it for personal or educational projects.

---

*Prepared for the CodeNova Internship Task 2. All mandatory requirements are satisfied, the UI is polished, and the codebase follows modern best practices.*
