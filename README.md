# 🚀 CaseFlow

CaseFlow is a **Full Stack Case Assignment and Workforce Management System** built using **React, TypeScript, Vite, Supabase, and PostgreSQL**. It streamlines the process of assigning support cases to engineers while providing real-time availability tracking, fair workload distribution, and region-based access control.

## 🌐 Live Demo

https://caseflow-web-coral.vercel.app/

## 💻 GitHub Repository

https://github.com/Vishnu200399/Caseflow_Web

---

# ✨ Features

### 👨‍💻 Engineer
- Secure login
- View assigned cases
- Update case processing status
- Change availability status
- AUX1 & AUX4 support with timers
- Request Temporary Assigner access
- View live team availability

### 📋 Assigner
- Fair case assignment
- Automatic engineer recommendation
- Manual override assignment
- Live engineer overview
- Excel-style assignment view
- Temporary Assigner approval
- Daily CSV reports
- Case processing statistics

### 👨‍💼 Admin
- User management
- Role management
- Region management
- Account approval and activation

---

# 🌍 Supported Regions

- EMEA
- APAC
- AMS

Each region operates independently with its own engineers, assigners, workloads, and reports.

---

# 🛠 Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

### Backend
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Realtime
- PostgreSQL RPC Functions

### Deployment
- Frontend: Vercel
- Backend: Supabase

---

# 📂 Project Structure

```
CaseFlow/
│
├── public/
├── src/
│   ├── components/
│   ├── screens/
│   ├── lib/
│   ├── assets/
│   └── App.tsx
│
├── supabase/
├── package.json
├── vite.config.ts
└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/Vishnu200399/Caseflow_Web.git
```

Move into the project

```bash
cd Caseflow_Web
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Run locally

```bash
npm run dev
```

Build for production

```bash
npm run build
```

---

# 🔑 Demo Credentials

### Engineer

**Email:** `ali@gmail.com`

**Password:** `123456789`

### Assigner

**Email:** `mothi@gmail.com`

**Password:** `123456789`

---

# 🔄 Workflow

1. User logs in.
2. Engineers update their availability.
3. Assigner receives the next recommended engineer.
4. Cases are assigned using fair workload distribution.
5. Engineers update processing status.
6. Dashboards refresh in real time.
7. Daily reports can be exported as CSV.

---

# 📸 Screenshots



---

# 👨‍💻 Author

**Vishnu Vardhan**

GitHub: https://github.com/Vishnu200399

---

If you found this project useful, consider giving the repository a ⭐.
