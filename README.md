# 💸 FairShare — Modern Group Expense Splitting

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://www.fairshare.buzz)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-teal.svg)](https://www.fairshare.buzz)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/bibhab2005/FairShare)

**FairShare** is a full-stack, mobile-first Progressive Web App (PWA) designed to effortlessly split expenses, track shared balances, and settle debts among friends, roommates, and travel groups. 

Built with modern glassmorphism aesthetics, buttery-smooth micro-animations, integer-precision balance calculations, and seamless Google OAuth integration.

🌐 **Live URL:** [https://www.fairshare.buzz](https://www.fairshare.buzz)  
👨‍💻 **Developer:** [Bibhab Talukdar](https://portfolio-bi-bhab-personal.vercel.app/about)

---

## 🌟 Features Overview

### 👤 Unique Usernames & Onboarding
* **Custom Handles:** Every user can choose an `@username` (alphanumeric, dots, dashes, underscores).
* **Frictionless Member Invites:** Add group members by typing their short `@username` or their email address.
* **Instant Availability Check:** Real-time debounced checks on registration and handle selection.
* **Google OAuth Interception:** Any user signing up via Google is routed through a dedicated onboarding screen (`/set-username`) to pick their unique handle before accessing the dashboard.

### 📱 Progressive Web App (PWA)
* **Installable on Any Device:** Installable natively on iOS (Safari *Add to Home Screen*), Android (Chrome install prompt), and Desktop (Chrome / Edge).
* **Standalone Experience:** Runs borderless without browser address bars, complete with standalone app icons, splash screen, and offline service worker precaching via `vite-plugin-pwa` and Workbox.

### 🔐 Authentication & Profile Security
* **Dual Auth Providers:** Email/Password authentication (with `bcryptjs` hashing) and Google OAuth 2.0 (via `passport-google-oauth20`).
* **Secure Cookie Storage:** Authentication tokens (JWT) are stored in secure, `httpOnly`, `SameSite: Lax` cookies to safeguard against XSS and enable smooth redirects.
* **Profile Management:** Fully featured profile settings modal allowing users to instantly update their display name, `@username`, and **UPI ID** for easy payments.
* **Route Protection:** Protected routes with state synchronization (`ProtectedRoute` and `PublicRoute`).
* **Permanent Account Deletion (Kill Button):** Complete self-service account deletion accessible from the profile dropdown. Cleans up group memberships and permanently removes user data with custom confirmation modals.

### ⚖️ Smart Debt Simplification Engine
* **Greedy Graph Minimization:** Automatically simplifies multipartite debt graphs to minimize the total transactions required to settle balances across a group.
* **Integer Arithmetic:** All amounts are stored internally in **paise** (integers) to prevent floating-point rounding errors and ensure financial accuracy.
* **Settlement Workflows:** Record peer-to-peer settlement payments with dedicated settlement flags (`isSettlement`).

### 👥 Groups & Expense Management
* **Group Collaboration:** Create groups for trips, apartments, or events. Any member can add, view, or manage shared transactions.
* **Flexible Splits:** Supports equal splitting across group members as well as custom split distributions.
* **Permanent 1-to-1 Settlement History:** Users have a dedicated global Settlement History dashboard tracking all payments they've made or received. These records act as immutable receipts and are preserved permanently even if the underlying group is deleted!
* **Visual Breakdown:** Spending visualizations and doughnut charts powered by **Recharts** highlighting top spenders.
* **Safe Actions:** Destructive operations (removing a member, deleting a group, deleting an account) are guarded by animated, portal-mounted confirmation modals.

### 💬 Direct Developer Feedback
* **In-App Feedback Modal:** Integrated feedback modal accessible from the profile dropdown and home footer, providing a 1-click `mailto:` launch and copyable email button to reach the developer directly.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React, React Hot Toast |
| **PWA** | `vite-plugin-pwa`, Workbox, Web App Manifest |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Authentication** | Passport.js, Google OAuth 2.0, JSON Web Tokens (JWT), `bcryptjs`, `cookie-parser` |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Analytics & Hosting** | Vercel Serverless Functions, Vercel Web Analytics, Vercel Speed Insights |
    
*Note: Requires MongoDB replica set (Atlas default, or `mongod --replSet` locally) — transactions will fail on standalone instances.*

---

## 📂 Project Architecture

```text
fairshare/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection, Passport strategy setup
│   │   ├── controllers/     # Auth, group, expense, balance route handlers
│   │   ├── middleware/      # JWT verification middleware (protect)
│   │   ├── models/          # Mongoose schemas (User, Group, Expense)
│   │   ├── routes/          # Express route definitions
│   │   ├── utils/           # Balance calculation & debt simplification algorithm
│   │   └── server.js        # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── public/              # Manifest, PWA icons, assets
│   ├── src/
│   │   ├── core/            # Global components (Navbar, Modals, Particles)
│   │   ├── features/        # Feature modules (auth, groups, expenses)
│   │   ├── pages/           # Route views (Home, Dashboard, GroupDetails, Login, Register, SetUsername)
│   │   ├── App.jsx          # App root, React Router configuration, route guards
│   │   └── main.jsx         # React DOM root & service worker registration
│   ├── vite.config.js       # Vite configuration with PWA integration
│   └── package.json
│
└── vercel.json              # Monorepo deployment and rewrite routing rules
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user (`name`, `username`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/logout` | Clear token cookie and log out | Yes |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session | Yes |
| `GET` | `/api/auth/check-username` | Check if username is available (`?username=...`) | No |
| `PUT` | `/api/auth/username` | Set username for user without one | Yes |
| `PUT` | `/api/auth/profile` | Update profile settings (Name, Username, UPI ID) | Yes |
| `DELETE` | `/api/auth/account` | Permanently delete account and remove from all groups | Yes |
| `GET` | `/api/auth/google` | Initiate Google OAuth 2.0 flow | No |
| `GET` | `/api/auth/google/callback` | Google OAuth callback handler | No |

### Groups (`/api/groups`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/groups` | Fetch all groups the logged-in user belongs to | Yes |
| `POST` | `/api/groups` | Create a new group (`name`, `description`) | Yes |
| `GET` | `/api/groups/:id` | Get details and members of a specific group | Yes |
| `POST` | `/api/groups/:id/members` | Add a member to group by `emailOrUsername` | Yes |
| `DELETE` | `/api/groups/:id/members/:memberId` | Remove a member from the group | Yes |
| `DELETE` | `/api/groups/:id` | Delete group and all its expenses | Yes |

### Expenses & Balances
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/expenses/group/:groupId` | Get all expenses recorded in a group | Yes |
| `POST` | `/api/expenses` | Create a new expense or settlement payment | Yes |
| `DELETE` | `/api/expenses/:id` | Delete an expense | Yes |
| `GET` | `/api/expenses/settlements/my` | Get peer-to-peer settlement receipts across all groups | Yes |
| `GET` | `/api/balances/:groupId` | Compute simplified debts and net balances | Yes |

---

## 💻 Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
* [Google Cloud Console Project](https://console.cloud.google.com/) (Optional, for Google Login)

### 1. Clone Repository
```bash
git clone https://github.com/bibhab2005/FairShare.git
cd FairShare
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fairshare
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **`http://localhost:5173`**.

---

## 🌐 Google OAuth Configuration

To test or deploy Google OAuth:
1. Navigate to **[Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)**.
2. Select or create an **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized JavaScript origins**, add:
   * `http://localhost:5173` *(Local frontend)*
   * `http://localhost:5000` *(Local backend)*
   * `https://www.fairshare.buzz` *(Production domain)*
4. Under **Authorized redirect URIs**, add:
   * `http://localhost:5000/api/auth/google/callback` *(Local)*
   * `https://www.fairshare.buzz/api/auth/google/callback` *(Production)*

---

## 🚀 Deployment

The repository is configured for effortless deployment on **Vercel** via `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/backend/src/server.js"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/dist/$1"
    }
  ]
}
```

Environment variables required on Vercel:
* `MONGODB_URI`
* `JWT_SECRET`
* `FRONTEND_URL` (e.g. `https://www.fairshare.buzz`)
* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`

---

## 🤝 Feedback & Contributions

Contributions, bug reports, and feature requests are very welcome!
* Submit an issue or PR on [GitHub](https://github.com/bibhab2005/FairShare).
* Reach out directly via the in-app **Feedback & Ideas** modal or email at: `bibhabtalukdar2005@gmail.com`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
