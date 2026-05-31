# Demo Guide

## Demo Flow

1. Start SQL Server and run:
   - `database/schema.sql`
   - `database/seed.sql`
2. Start the backend:
   - `cd backend`
   - `dotnet restore`
   - `dotnet run`
3. Start the frontend:
   - `cd frontend`
   - `npm install`
   - `npm start`
4. Open `http://localhost:4200`.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@taskhub.local` | `Admin123!` |
| User | `maya@taskhub.local` | `User123!` |

## What To Show

1. Landing page with animated metrics.
2. Login with seeded admin account.
3. Dashboard metrics loaded from the API.
4. Project creation, filtering, editing, and deletion.
5. Project detail route with task CRUD and comments.
6. Profile page using `/profile/:id`.
7. Admin panel user/category CRUD.
8. Focus Notes widget on the dashboard, which demonstrates vanilla JavaScript DOM rendering and event listeners.
