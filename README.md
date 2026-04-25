# Distributed Online Voting System

Production-ready MERN voting system foundation with OTP registration, JWT login, candidate management, one-user-one-vote enforcement, results, election control, and audit logs.

## Completed Features

- React frontend with routing, protected pages, Bootstrap UI, axios integration
- Register flow with phone OTP and Aadhaar validation
- Login flow with JWT stored in `localStorage`
- Candidate listing and admin candidate CRUD
- Protected voting API with duplicate vote prevention
- Candidate/state matching during voting
- Election start/stop control
- Dynamic results API and Recharts result charts
- Admin dashboard for candidates, election control, users, analytics, and logs
- Activity logs for registration, voting, and admin actions

## Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

Important `.env` values:

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=your_long_access_secret
JWT_REFRESH_SECRET=your_long_refresh_secret
CLIENT_ORIGIN=http://localhost:3000
```

Create first admin:

```bash
cd backend
npm run seed:admin
```

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Main API Routes

```text
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/register
POST /api/auth/login

GET  /api/candidates
POST /api/admin/candidate
PUT  /api/admin/candidate/:id
DELETE /api/admin/candidate/:id

POST /api/vote
GET  /api/results

GET  /api/admin/election
POST /api/admin/election/start
POST /api/admin/election/stop
GET  /api/admin/users
GET  /api/admin/logs
```

## Deployment

Backend on Render:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `backend/.env.example`
- Set `CLIENT_ORIGIN` to your Vercel frontend URL

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `build`
- Add `REACT_APP_API_BASE_URL` with your Render backend URL

## Full Flow

```text
Register -> Send OTP -> Verify OTP -> Complete registration -> Login -> Admin starts election -> User votes -> Results update
```
