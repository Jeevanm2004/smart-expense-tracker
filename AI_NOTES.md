# AI_NOTES.md — AI Usage & Senior Decision Disclosure

This document discloses how AI tools (Gemini / Antigravity Agent) were utilized during the design, development, testing, and senior full-stack refactoring of the **Smart Expense Tracker** project.

---

## 1. AI-Generated vs. Custom Written Components

### AI-Assisted Scaffolding & Code Generation
- **OpenAPI 3.0 Schema (`src/swagger.json`)**: Endpoint definition structure generated with AI assistance.
- **FinSet UI Component Scaffolding (`client/src/components/`)**: Visual layout structure for Header, Navbar, StatCards, MoneyFlowChart, and CategoryDonutChart.

### Custom Logic & Senior Engineering Refactoring
- **Atomic Dual-Mode Data Store (`src/store/expensesStore.js`)**: Engineered file I/O operations (`src/data/expenses.json`) using atomic write-and-rename (`fs.renameSync`) to eliminate file corruption race conditions under high concurrent traffic.
- **Integer Cents Financial Arithmetic**: Refactored total calculation and monthly summary logic to sum integer cents (`Math.round(val * 100)`), preventing IEEE 754 floating-point rounding drift.
- **Monthly Summary Aggregations (`getMonthlySummary`)**: Custom grouping logic aggregating expenses by YYYY-MM and determining top category per month.
- **Strict Input Character Bounds**: Implemented validation bounds (150 chars max for `title`, 50 chars max for `category`) to prevent storage/payload amplification attacks.
- **Live React State & Sliding Nav System (`client/src/App.tsx` & `Navbar.tsx`)**: Orchestrated live state synchronization between table actions, API fetches, modal edit flows, and animated sliding tab navigation.

---

## 2. Validation, Testing & Modifications Made to AI Output

1. **Test Runner File Isolation**:
   - *Issue Identified*: Writing tests that write to `src/data/expenses.json` causes test state leaks between test runs.
   - *Modification*: Added `enableFile` boolean flag in `expensesStore.reset()`. Unit tests execute in pure memory mode while production runs use persistent JSON file sync.

2. **Strict Date Format Validation & Rollover Guard**:
   - *Issue Identified*: Loose `new Date(string)` parsing accepts malformed dates or calendar rollovers.
   - *Modification*: Enforced regex matching (`/^\d{4}-\d{2}-\d{2}$/`) in controller handlers before checking UTC date parts (blocking impossible dates like `2026-02-30`).

3. **Atomic File Write Concurrency Fix**:
   - *Issue Identified*: Async `fs.writeFile` under high request concurrency can result in partial file overwrites.
   - *Modification*: Switched to atomic write-and-rename (`writeFileSync` to `.tmp` file then `renameSync`).

4. **Port Collision with macOS Control Center**:
   - *Issue Identified*: Default port 5000 is reserved by macOS AirPlay Receiver, causing 403 Forbidden errors in Chrome.
   - *Modification*: Rebound server listener to port 5001.

---

## 3. Rejected AI Suggestions & Rationale

1. **Rejected Heavy Database Dependencies (Prisma / MongoDB / SQLite)**:
   - *Rationale*: Submission instructions required simple local persistence without external database setup. Adopted native JSON file I/O (`src/data/expenses.json`).

2. **Rejected Complex Redux Boilerplate**:
   - *Rationale*: Kept state clean and reactive with React custom hooks and typed API clients.

---

## 4. Verification Record

- **Automated Tests**: **22/22** Jest + Supertest test cases passing (`npm test`).
- **Production Build**: Clean TypeScript compilation (`npm run build` in `client/`).
- **Interactive Testing**: Verified Swagger UI (`http://localhost:5001/api-docs`) and live Smart Expense Tracker React UI (`http://localhost:5001`).
