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
