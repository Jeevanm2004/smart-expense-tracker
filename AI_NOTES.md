# AI Usage & Software Engineering Decision Log

This document discloses how I utilized AI tools (Gemini / Antigravity Agent) as code-generation assistants under my direct architectural leadership and engineering oversight to develop the **Smart Expense Tracker** project.

---

## 1. My Architectural Decisions (Brainstormed & Researched)

I designed the system architecture, established the quality constraints, and directed the AI to implement the following key decisions:

### Full-Stack TypeScript Migration
- **Rationale**: I decided to migrate the initial JavaScript backend to TypeScript (`.ts`) to match the React client, eliminate type mismatch bugs at compile-time, and establish a unified data contract across the entire codebase.

---

## 2. AI Code Generation & Implementation Assistance

I utilized the AI tool to accelerate implementation by generating syntax patterns and code scaffolding based on my specifications.

---

## 3. Validation & Auditing (My Actions)

I reviewed, validated, and optimized the AI's generated code to resolve bugs and runtime limitations:

1. **Test Runner File Isolation**:
   - *My Audit*: Detected that integration tests were overwriting `src/data/expenses.json` and causing test-state leakage.
   - *My Fix*: Configured a memory-only fallback flag (`useFileStorage`) to run test suites in pure memory mode while keeping production writes intact.

### Type-Safe Enums & Constants Pattern
- **Rationale**: To eliminate code smell and magic strings, I designed a centralized constants repository (`src/constants/index.ts`), organizing HTTP status codes, error messages, and network configurations into strictly typed enums (`HttpStatus`, `ErrorResponse`, `NodeEnv`, `CorsMethod`).

### Code Quality, Linting & Formatting Guidelines
- **Rationale**: I established strict code quality policies by introducing a project-wide Prettier formatter configuration (`.prettierrc`) and an ESLint ruleset (`eslint.config.js`). This ensures a consistent code style across both backend and frontend layers (semi-colons, single quotes, 2-space tab widths) and automatically checks for dead code or unused variables.
