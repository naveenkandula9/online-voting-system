# Distributed Online Voting System - Backend

Node.js, Express, and MongoDB Atlas backend for the MERN-based distributed online voting system.

## Step 1 Scope

This step sets up:

- Express API server
- MongoDB Atlas connection with Mongoose
- Environment variable management
- Security middleware baseline
- Health check endpoint
- Production-friendly folder structure

## Folder Structure

```text
backend/
  src/
    config/
      db.js
      env.js
    controllers/
      health.controller.js
    middleware/
      error.middleware.js
    models/
    routes/
      health.routes.js
    utils/
    app.js
    server.js
  .env.example
  .gitignore
  package.json
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a free or dedicated cluster.
3. Create a database user with a strong password.
4. Add your current IP address to Network Access.
5. Copy the connection string from Atlas.
6. Replace `<username>`, `<password>`, and database name in the URI.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/online_voting_system?retryWrites=true&w=majority
```

## Local Environment

Create a `.env` file inside `backend/` using `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_a_long_random_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
OTP_TTL_MINUTES=5
```

## Run Backend

```bash
npm install
npm run dev
```

Health check:

```text
GET http://localhost:5000/api/health
```

Expected response includes API uptime and MongoDB connection status.
