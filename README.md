# TaskHub | Developer's Guide

TaskHub is a premium, full-stack project management platform built for high-performance teams. It features an elite dark glassmorphism UI, real-time activity tracking, and a zero-configuration backend.

## 🚀 Technology Stack

- **Frontend:** Angular 18 (TypeScript), RxJS, Reactive Forms.
- **Backend:** ASP.NET Core 8 Web API, Entity Framework Core.
- **Database:** SQLite (Zero-install, file-based).
- **Security:** JWT (JSON Web Tokens) with Role-Based Access Control (Admin/User).

---

## 🛠 Prerequisites

Ensure you have the following installed on your development machine:
1. **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **Node.js (LTS)** - [Download](https://nodejs.org/)
3. **Git** - [Download](https://git-scm.com/)

---

## 💻 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd TaskHub
```

### 2. Backend Setup (API)
The backend handles the data logic and security. It is configured to automatically create and seed the SQLite database on the first run.

```bash
cd backend
dotnet restore
dotnet dev-certs https --trust
dotnet run
```
- **Listening on:** `https://localhost:7162`
- **Database File:** `backend/TaskHub.db` (auto-generated)
- **API Documentation:** [https://localhost:7162/swagger](https://localhost:7162/swagger)

### 3. Frontend Setup (Web UI)
The frontend provides the premium dark glassy interface.

```bash
cd frontend
npm install
npm start
```
- **URL:** [http://localhost:4200](http://localhost:4200)

---

## 🔐 Authentication & Demo Data

The system is pre-seeded with the following accounts for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@taskhub.local` | `Admin123!` |
| **Standard User** | `maya@taskhub.local` | `User123!` |

---

## 🎨 UI Architecture

The UI has been completely rebuilt with a **Premium Dark Glassmorphism** aesthetic:
- **Glass Engine:** Uses `backdrop-filter: blur(24px)` and multi-layered semi-transparent surfaces.
- **Atmosphere:** Fixed-position radial glows (`accent` and `violet`) provide depth.
- **Typography:** Optimized Inter-stack with refined letter-spacing.
- **Responsiveness:** Fully fluid layout for mobile, tablet, and desktop.

---

## 📂 Project Structure

```text
/
├── backend/            # ASP.NET Core Web API
│   ├── Controllers/    # API Endpoints (Auth, Projects, Tasks, etc.)
│   ├── Data/           # EF Core Context & Automated Seeder
│   ├── Models/         # Database Entities
│   └── appsettings.json # Database and JWT Configuration
├── frontend/           # Angular Application
│   ├── src/app/pages/  # View Components (Dashboard, Admin, Auth, etc.)
│   ├── src/app/core/   # Services, Guards, and API Interceptors
│   └── src/styles.css  # Global Glassmorphism Engine
└── TaskHub.db          # Local SQLite database (created after first run)
```

---

## ⚠️ Troubleshooting

**1. "API server is not reachable"**
- Ensure the backend terminal is still running.
- Visit `https://localhost:7162/swagger` in your browser. If you see a privacy warning, click **Advanced -> Proceed to localhost**. This trusts the development certificate.

**2. Database Issues**
- If you need to reset the data, simply delete the `backend/TaskHub.db` file and restart the backend. It will recreate a fresh database.

---

*TaskHub - Precision Project Management.*
