# 💰 FairShare

FairShare is a full-stack web application designed to effortlessly split expenses, manage group balances, and track shared transactions among friends, roommates, or travel companions. 🚀

## ✨ Features

* **🔐 User Authentication:** Secure signup and login functionality utilizing JSON Web Tokens (JWT) and cookie-based authentication, alongside Google OAuth support.
* **👥 Group Management:** Create and manage shared groups for trips, households, or events.
* **💸 Expense Tracking:** Add, edit, and categorize shared expenses with clear breakdown calculations.
* **⚖️ Balance Calculation:** Automatically compute who owes whom to simplify debt settlement.
* **💓 Health Check API:** Built-in monitoring endpoint for system uptime checks.

## 🛠️ Tech Stack

* **🎨 Frontend:** React, Vite, Tailwind CSS
* **⚙️ Backend:** Node.js, Express.js
* **🍃 Database:** MongoDB, Mongoose

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
