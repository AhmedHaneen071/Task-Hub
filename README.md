# TaskHub | Developer's Guide

TaskHub is a full-stack project management platform built with Angular 18 and ASP.NET Core 8. It provides secure role-based authentication, project and task management, activity tracking, and a modern glassmorphism-inspired user interface.

---

## ✨ Features

- 🔐 JWT Authentication
- 👥 Role-Based Access Control (Admin/User)
- 📁 Project Management
- ✅ Task Management & Tracking
- 📊 Dashboard Overview
- 📝 Activity Tracking
- 🌙 Modern Dark Glassmorphism UI
- 📱 Fully Responsive Design
- 📚 Swagger API Documentation
- 🗄 SQLite Database (Zero Installation Required)

---

## 🚀 Technology Stack

### Frontend
- Angular 18
- TypeScript
- RxJS
- Reactive Forms

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core

### Database
- SQLite

### Security
- JWT (JSON Web Tokens)
- Role-Based Authorization

---

## 🛠 Prerequisites

Ensure the following tools are installed on your machine:

1. **.NET 8 SDK**  
   https://dotnet.microsoft.com/download/dotnet/8.0

2. **Node.js (LTS Version)**  
   https://nodejs.org

3. **Git**  
   https://git-scm.com

---

## 💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AhmedHaneen071/Task-Hub.git
cd Task-Hub
```

---

### 2. Backend Setup

The backend automatically creates and seeds the SQLite database during the first run.

```bash
cd backend
dotnet restore
dotnet dev-certs https --trust
dotnet run
```

#### Backend Information

| Item | Value |
|--------|--------|
| API URL | https://localhost:7162 |
| Swagger UI | https://localhost:7162/swagger |
| Database | SQLite |
| Database File | backend/TaskHub.db |

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

#### Frontend Information

| Item | Value |
|--------|--------|
| Application URL | http://localhost:4200 |

---

## 🔧 Configuration

The Angular application communicates with the ASP.NET Core API running on:

```text
https://localhost:7162
```

If the backend URL or port changes, update the API configuration in the Angular environment files.

---

## 🔐 Authentication & Demo Accounts

The application is seeded with test accounts for development purposes.

| Role | Email | Password |
|--------|--------|--------|
| Administrator | admin@taskhub.local | Admin123! |
| Standard User | maya@taskhub.local | User123! |

---

## 🎨 User Interface

TaskHub uses a modern glassmorphism-inspired design system featuring:

- Frosted glass components
- Soft transparency effects
- Layered depth and shadows
- Responsive layouts
- Dark theme optimized for productivity
- Consistent typography and spacing

---

## 📂 Project Structure

```text
Task-Hub/
│
├── backend/
│   ├── Controllers/        # API Endpoints
│   ├── Data/               # DbContext & Seeder
│   ├── Models/             # Database Entities
│   ├── Services/           # Business Logic
│   ├── Program.cs
│   └── appsettings.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Services, Guards, Interceptors
│   │   │   ├── pages/      # Application Pages
│   │   │   ├── shared/     # Shared Components
│   │   │   └── models/     # Interfaces & Models
│   │   └── styles.css
│   │
│   └── package.json
│
└── README.md
```

---

## 📚 API Documentation

After starting the backend, Swagger documentation is available at:

```text
https://localhost:7162/swagger
```

Swagger provides:

- Endpoint testing
- Request/response schemas
- Authentication support
- API documentation

---

## 🚀 Production Build

### Backend

```bash
dotnet publish -c Release
```

Published files will be generated in:

```text
backend/bin/Release/
```

### Frontend

```bash
npm run build
```

Production build output:

```text
frontend/dist/
```

---

## ⚠️ Troubleshooting

### API Server Is Not Reachable

- Ensure the backend application is running.
- Verify that `https://localhost:7162/swagger` opens successfully.
- Accept the HTTPS development certificate if prompted.

### Database Issues

To reset the database:

1. Stop the backend server.
2. Delete:

```text
backend/TaskHub.db
```

3. Restart the backend.

A fresh database will be created automatically.

### Frontend Cannot Connect to API

Verify:

- Backend is running.
- API URL configuration is correct.
- Browser console contains no CORS-related errors.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

## 📄 License

This project is intended for educational and portfolio purposes.

---

**TaskHub** — A modern project management platform built with Angular and ASP.NET Core.
