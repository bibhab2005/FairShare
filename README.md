# 💰 FairShare 2.0

FairShare is a modern, beautifully designed full-stack web application built to effortlessly split expenses, manage group balances, and track shared transactions among friends, roommates, or travel companions. 🚀

## ✨ Key Features

* **📱 Mobile-First Responsive UI:** A premium, glassmorphism-inspired design with buttery-smooth micro-animations that looks and feels like a native app on any screen size.
* **🔐 Secure Authentication:** Seamless signup and login functionality utilizing JSON Web Tokens (JWT), HTTP-only cookies, and Google OAuth support.
* **👥 Dynamic Group Management:** Easily create groups, invite members, and seamlessly remove members with elegant, non-intrusive custom confirmation modals.
* **💸 Advanced Expense Tracking:** Add, edit, or remove shared expenses. Any member can manage expenses, giving flexibility to your group. Features support for equal and custom splits!
* **⚖️ Smart Balance Engine:** Automatically calculates and simplifies who owes whom, minimizing the total number of transactions needed to settle debts.
* **🤝 Detailed Settlement Tracking:** See comprehensive dropdown records of your settlement payments and peer-to-peer debts at a glance.
* **📊 Visual Spending Insights:** Interactive, animated doughnut charts (built with Recharts) breaking down spending by member.
* **📈 Vercel Web Analytics:** Built-in performance and visitor analytics to track app usage.

## 🛠️ Tech Stack

* **🎨 Frontend:** React (Vite), Tailwind CSS, Framer Motion (Animations), Recharts, Lucide Icons
* **⚙️ Backend:** Node.js, Express.js
* **🍃 Database:** MongoDB, Mongoose
* **☁️ Deployment:** Vercel (Frontend & Serverless API)

## 📂 Project Structure

```text
fairshare/
├── backend/          # Express API server, routes, models, and config
└── frontend/         # React single-page application UI
```

## 🚀 Getting Started Locally

### Prerequisites

* Node.js installed on your machine 💻
* MongoDB database instance (Local or MongoDB Atlas) 🗄️

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/bibhab2005/FairShare.git
cd FairShare
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Run the backend development server:

```bash
npm run dev
```

### 3️⃣ Setup Frontend

Open a separate terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Your app will be running at `http://localhost:5173`! 🎉
