# Distributed Online Voting System - Frontend

React frontend for the MERN-based distributed online voting system.

## Step 1 Scope

This step sets up:

- React app using Create React App
- Bootstrap UI foundation
- React Router routing
- Axios API client
- JWT token attachment from `localStorage`
- Protected route wrapper
- Placeholder pages for the main voting workflows

## Folder Structure

```text
frontend/
  src/
    components/
      Navbar.js
      ProtectedRoute.js
    pages/
      AdminDashboard.js
      Home.js
      Login.js
      NotFound.js
      Register.js
      Results.js
      Vote.js
    services/
      api.js
    App.js
```

## API Configuration

Create a `.env` file in `frontend/`:

```env
PORT=3000
REACT_APP_API_BASE_URL=http://localhost:5000
```

The axios client in `src/services/api.js` automatically sends the JWT token from:

```text
localStorage.votingToken
```

## Routes

```text
/           Home
/register   Register
/login      Login
/results    Results
/vote       Protected voting page
/admin      Protected admin dashboard
```

## Run

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

The frontend runs on:

```text
http://localhost:3000
```
