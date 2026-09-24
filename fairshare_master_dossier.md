# FairShare Engineering Report

## 1. Project Overview
FairShare is a web application that tracks shared expenses and calculates minimal settlement transactions among groups of users. It provides an interface for users to create groups, log individual or group expenses with custom splits, and record peer-to-peer payments to settle outstanding balances.

## 2. Architecture
The application is built on the MERN stack and deployed as a serverless web app.
- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js (ES Modules), Helmet, Express Rate Limit
- **Database:** MongoDB Atlas (accessed via Mongoose ODM)
- **Authentication:** Passport.js (Google OAuth 2.0), JWTs via secure `httpOnly` cookies

### Folder Structure
```text
fairshare/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment variables and Passport configuration
│   │   ├── controllers/     # Express route handlers
│   │   ├── middleware/      # JWT authentication and Zod request validation
│   │   ├── models/          # Mongoose schema definitions
│   │   ├── routes/          # Express route definitions
│   │   ├── tests/           # Integration tests
│   │   ├── utils/           # Debt simplification algorithm and unit tests
│   │   └── server.js        # Express application entrypoint
├── frontend/
│   ├── src/
│   │   ├── core/            # Global UI components
│   │   ├── features/        # Feature modules (Auth, Groups, Expenses)
│   │   ├── pages/           # High-level route views
│   │   └── App.jsx          # React Router configuration
```

## 3. Debt Simplification Algorithm
The core algorithm reduces a graph of peer-to-peer debts into the minimum number of settlement transactions. 

It calculates the net balance for each user across all expenses in a group. Users are separated into a list of creditors (positive balances) and debtors (negative balances). Both lists are sorted in descending order by absolute magnitude. The algorithm uses a greedy approach, matching the largest remaining debtor with the largest remaining creditor, settling the minimum of their two balances, and advancing the pointer of whichever user reaches a zero balance.

This greedy matching is correct and yields an upper bound of `N-1` transactions for `N` non-zero participants. Because the sum of all net balances in a closed group is exactly zero, settling the minimum of a creditor/debtor pair guarantees that at least one person's balance reaches exactly zero per transaction. Consequently, it takes at most `N-1` steps to zero out the remaining `N-1` participants. Finding an absolute global minimum below `N-1` (by identifying independent zero-sum subsets) is an NP-Hard problem; the greedy approach provides the `N-1` guarantee in `O(N log N)` time. All calculations are performed on integers (paise) to prevent floating-point precision loss.

## 4. Testing
The backend is covered by a Jest test suite (17 total tests) that was independently verified by running the suite in the terminal.
- **Algorithm Unit Tests:** Tests the `simplifyDebts` logic against circular debts, single-user groups, runtime exceptions on floating-point inputs, negative balances, and complex asymmetrical multi-party splits.
- **Integration Tests:** Tests the Auth, Groups, and Expenses controllers. Uses `supertest` to assert HTTP responses and Zod validation rejections. Includes tests that mock database write failures to verify that the controllers correctly catch and return 500-level HTTP errors.

## 5. Known Limitations and Deferred Work
- **Concurrency Load Testing:** MongoDB transactions are implemented in `createExpense` and `createSettlement` to prevent race conditions. However, concurrent load testing is deferred. The current test suite mocks Mongoose entirely (`jest.spyOn`), which resolves synchronously and cannot simulate real lock contention. Verifying this properly requires an integration test using a real or in-memory MongoDB replica set (e.g., `mongodb-memory-server` with `replSet` config) and concurrent `Promise.all` requests.
- **Database Requirements:** The backend requires a MongoDB replica set to run (Atlas default, or `mongod --replSet` locally). Transactions will throw an error on a standard standalone MongoDB instance.
- **Type Safety:** The project is written in JavaScript. Type validation relies exclusively on runtime Zod schemas rather than compile-time TypeScript.

## 6. Implementation Methodology
The implementation of this codebase was AI-assisted (Claude/Opus) under direct product and architectural direction. The author was responsible for defining the system constraints, enforcing testing decisions, mandating Zod for validation, and catching a production-breaking bug (a controller crash in `createSettlement` caused by an undefined reference) through manual code review and independent testing verification.
