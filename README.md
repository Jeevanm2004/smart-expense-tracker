# DilliCents — Smart Expense Tracker

Production-grade, full-stack personal expense tracking solution. Features a robust REST API, atomic JSON file storage, interactive Swagger documentation, 22 passing automated integration tests, and a high-fidelity React + TypeScript + Tailwind CSS dashboard.

---

## Quick Start Instructions

Follow these exact commands to install dependencies, start the server, and run the test suite on a clean checkout:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
*Executes all 22 Jest + Supertest unit & API endpoint integration tests in pure test-isolated memory mode.*

### 3. Start Server
```bash
npm start
```
- **DilliCents Dashboard Web UI**: `http://localhost:5001`
- **Interactive Swagger Docs**: `http://localhost:5001/api-docs`
- **REST API Server**: `http://localhost:5001`

### 4. Run with Docker
```bash
docker compose up --build
```
- **DilliCents Dashboard Web UI**: `http://localhost:5001`
- **Interactive Swagger Docs**: `http://localhost:5001/api-docs`
- **REST API Server**: `http://localhost:5001`
- *Spins up both services inside a multi-stage production container with a persistent database file volume mounted at `./src/data`.*

---

## Environment Variables & Configuration

The application can be configured via environment variables or runs out-of-the-box with sane production defaults:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5001` | Server listening port |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5001` | Comma-separated CORS origin whitelist |
| `NODE_ENV` | `development` | Application execution environment (`development`, `production`, `test`) |

---

## REST API Specifications & Documentation

| Method | Endpoint | Purpose | Query / Body Parameters | Status Codes |
|---|---|---|---|---|
| `POST` | `/expenses` | Add a new expense | Body: `{ "title": "Groceries", "amount": 45.50, "category": "Food", "date": "2026-07-30" }` | `201 Created`, `400 Bad Request` |
| `GET` | `/expenses` | View expenses | Optional Query: `category`, `search`, `startDate`, `endDate`, `page`, `limit` | `200 OK`, `400 Bad Request` |
| `GET` | `/expenses/:id` | Fetch single expense by ID | Path Param: `:id` | `200 OK`, `404 Not Found` |
| `GET` | `/expenses/total` | Calculate overall + category totals | — | `200 OK` |
| `GET` | `/expenses/monthly-summary` | Monthly spending breakdown & top category (Bonus) | — | `200 OK` |
| `GET` | `/expenses/export/csv` | Download transactions as CSV file | — | `200 OK` |
| `PUT` | `/expenses/:id` | Update expense by ID | Path Param: `:id`, Body: partial or full fields | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/expenses/:id` | Delete expense by ID | Path Param: `:id` | `200 OK`, `404 Not Found` |

### Input Validation & Bounds Rules
- `title`: Required, non-empty string, **max 150 characters**.
- `amount`: Required, positive JSON number (`> 0`).
- `category`: Required, non-empty string, **max 50 characters**.
- `date`: Required, valid date in `YYYY-MM-DD` format (guarded against calendar rollover like `2026-02-30`).

---

## Example `curl` Commands

#### 1. Add an Expense (`POST /expenses`)
```bash
curl -X POST http://localhost:5001/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Supermarket Shopping",
    "amount": 45.50,
    "category": "Food",
    "date": "2026-07-30"
  }'
```

#### 2. Fetch Single Expense (`GET /expenses/:id`)
```bash
curl -X GET http://localhost:5001/expenses/exp-101
```

#### 3. Update an Expense (`PUT /expenses/:id`)
```bash
curl -X PUT http://localhost:5001/expenses/exp-101 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Supermarket Shopping (Updated)",
    "amount": 55.00
  }'
```

#### 4. Get All Expenses (`GET /expenses`)
```bash
curl -X GET http://localhost:5001/expenses
```

#### 5. Filter Expenses by Category (`GET /expenses?category=Food`)
```bash
curl -X GET "http://localhost:5001/expenses?category=Food"
```

#### 6. Filter Expenses by Date Range (`GET /expenses?startDate=...&endDate=...`)
```bash
curl -X GET "http://localhost:5001/expenses?startDate=2026-07-01&endDate=2026-07-31"
```

#### 7. Get Total Expenses (`GET /expenses/total`)
```bash
curl -X GET http://localhost:5001/expenses/total
```

#### 8. Get Monthly Summary (`GET /expenses/monthly-summary`)
```bash
curl -X GET http://localhost:5001/expenses/monthly-summary
```

#### 9. Export CSV File (`GET /expenses/export/csv`)
```bash
curl -X GET http://localhost:5001/expenses/export/csv -o expenses-export.csv
```

#### 10. Delete an Expense (`DELETE /expenses/:id`)
```bash
curl -X DELETE http://localhost:5001/expenses/exp-101
```

---

## Standardized Error Response Contract

All error responses from the API return structured JSON objects with HTTP status codes:

```json
{
  "error": "Validation Failed",
  "message": "title is required and must be a non-empty string."
}
```

- `400 Bad Request`: Payload validation failures or invalid query parameters.
- `404 Not Found`: Resource or endpoint does not exist.
- `500 Internal Server Error`: Unhandled server exception (logged silently on server).

---

## Repository Structure

```
smart-expense-tracker/
├── README.md               # Quick start, API contracts, environment & curl examples
├── AI_NOTES.md             # Required AI usage disclosure & technical decision log
├── package.json            # Root configuration with Express, Jest & Supertest
├── src/                    # Graded Core REST API
│   ├── app.js              # Express app setup, CORS & middleware
│   ├── server.js           # Server entry point & port listener (5001)
│   ├── routes/
│   │   └── expenses.js     # Route definitions (POST, GET, PUT, DELETE, Export)
│   ├── controllers/
│   │   └── expensesController.js # Input validation & controller logic handlers
│   ├── store/
│   │   └── expensesStore.js# Atomic file storage & fallback data store
│   ├── data/
│   │   └── expenses.json   # Persistent JSON data store
│   └── swagger.json        # OpenAPI 3.0 specification file
├── tests/                  # Test Suite
│   └── expenses.test.js    # Jest + Supertest integration tests (22 tests)
└── client/                 # React Dashboard
    ├── src/                # React, TypeScript, Tailwind components
    ├── dist/               # Production static build
    └── package.json
```

---

## Key Technical Architecture Features
- **Atomic File Storage (`fs.renameSync`)**: Writes data to a temporary file before renaming, eliminating race conditions or file corruption during high concurrency.
- **Integer Cents Precision**: Accumulates financial totals using integer arithmetic to eliminate JavaScript floating-point drift.
- **Dynamic Live React UI**: Connected bar charts and donut rings directly to live API data.
- **Transaction Editing**: Full inline modal editing for existing expenses (`PUT /expenses/:id`).
- **Column Sorting & CSV Export**: Instant table sorting (date, amount, title, category) and one-click CSV file download with CSV Formula Injection protection.
- **OpenAPI / Swagger UI (`/api-docs`)**: Interactive documentation.
