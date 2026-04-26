# Deployment Guide: Vercel Frontend + Render Backend

## Summary of Changes Made

### Backend (Node.js on Render)
✅ **Fixed CORS Configuration**
- Updated `src/app.js` to use dynamic `config.clientOrigins` instead of hardcoded localhost
- CORS now respects the `CLIENT_ORIGIN` environment variable
- Credentials enabled for auth tokens

✅ **Port Configuration**
- Already configured to use `process.env.PORT || 5000` (dynamic port)

✅ **Environment Variables Updated**
- `backend/.env` now includes placeholder for production Vercel URL
- `backend/.env.example` updated with production instructions

### Frontend (React on Vercel)
✅ **Fixed API Base URL Variable**
- Changed from `REACT_APP_API_URL` to `REACT_APP_API_BASE_URL` (matches code expectations)
- Added enhanced error logging for debugging API issues

✅ **Environment Variables Updated**
- `frontend/.env` corrected with proper variable name
- `frontend/.env.example` updated with production instructions

---

## Deployment Steps

### Step 1: Get Your URLs
Before deploying, you need:
- **Vercel Frontend URL**: `https://your-vercel-app.vercel.app` (or your custom domain)
- **Render Backend URL**: `https://your-render-backend.onrender.com` (or your custom domain)

### Step 2: Backend Deployment (Render)

#### 2.1 Update Backend Environment Variables
1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Go to **Settings** → **Environment**
4. Update `CLIENT_ORIGIN` with your Vercel URL:
   ```
   CLIENT_ORIGIN=https://your-vercel-app.vercel.app
   ```
   (Keep localhost for development if needed: `http://localhost:3000,https://your-vercel-app.vercel.app`)

5. Ensure these are set:
   - `PORT` (should be empty or auto-assigned by Render)
   - `NODE_ENV=production`
   - All JWT, MongoDB, and Email variables

#### 2.2 Push Backend Changes to GitHub
```bash
cd backend
git add -A
git commit -m "Fix CORS for production deployment with Vercel frontend"
git push origin main
```

#### 2.3 Render Auto-Deploy
- Render will automatically redeploy your backend when you push
- Check the **Deployment** section for status
- Wait for deployment to complete successfully

### Step 3: Frontend Deployment (Vercel)

#### 3.1 Update Frontend Environment Variables
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Update `REACT_APP_API_BASE_URL` with your Render backend URL:
   ```
   REACT_APP_API_BASE_URL=https://your-render-backend.onrender.com
   ```

5. Ensure these are set:
   - `NODE_ENV=production` (Vercel sets this automatically)

#### 3.2 Push Frontend Changes to GitHub
```bash
cd frontend
git add -A
git commit -m "Fix API base URL variable name and add error logging"
git push origin main
```

#### 3.3 Vercel Auto-Deploy
- Vercel will automatically redeploy when you push
- Check the **Deployments** section for status
- Wait for build and deployment to complete

---

## Testing the Connection

### After both deployments complete:

1. **Open your Vercel frontend**: https://your-vercel-app.vercel.app

2. **Test Login/Register**:
   - Go to Login or Register page
   - Try creating an account
   - Check browser DevTools (F12) → Console for error messages

3. **Debug if Network Error occurs**:
   - Check the [API Error] logs in Console
   - Verify `REACT_APP_API_BASE_URL` is set correctly in Vercel
   - Verify `CLIENT_ORIGIN` is set correctly in Render
   - Both URLs must be HTTPS (not HTTP) for production

### Check Backend Logs (Render)
1. Go to your Render service dashboard
2. Click **Logs** tab
3. Look for:
   - CORS errors (if origin not whitelisted)
   - Connection errors (if MongoDB URI is wrong)
   - Any unhandled exceptions

---

## API Routes Reference

All backend routes are prefixed with `/api/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/send-otp` | POST | Send OTP for verification |
| `/api/auth/verify-otp` | POST | Verify OTP |
| `/api/vote` | POST/GET | Vote operations |
| `/api/candidates` | GET | Get candidates list |
| `/api/results` | GET | Get voting results |
| `/api/complaints` | POST/GET | Raise/view complaints |
| `/api/admin` | Various | Admin operations (protected) |

---

## Common Issues & Solutions

### Issue: "Network Error" on login/register

**Solution 1: Check CORS**
```bash
# In backend .env, verify CLIENT_ORIGIN includes your Vercel URL
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

**Solution 2: Check API Base URL**
```bash
# In Vercel environment variables
REACT_APP_API_BASE_URL=https://your-render-backend.onrender.com
```

**Solution 3: HTTPS Required**
- Both URLs must use `https://` (not `http://`)
- Vercel uses HTTPS by default
- Render provides free HTTPS for onrender.com domains

---

### Issue: "CORS error" in browser console

**Symptoms**: 
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
1. Check backend `CLIENT_ORIGIN` environment variable in Render
2. Ensure exact URL match (case-sensitive, trailing slash matters)
3. Restart Render service after changing env variables

---

### Issue: Backend returns 500 errors

**Solution**:
1. Check Render **Logs** for error details
2. Verify MongoDB connection string is correct
3. Verify all required env variables are set:
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `MONGODB_URI`
   - `EMAIL_USER` and `EMAIL_PASS`

---

### Issue: Frontend shows "Something went wrong"

**Solution**:
1. Check browser Console (F12) for `[API Error]` logs
2. Check status code and error message
3. Check backend logs in Render dashboard
4. Verify all routes are correctly implemented

---

## Verification Checklist

- [ ] Backend env variables set in Render (CLIENT_ORIGIN, JWT secrets, MongoDB URI)
- [ ] Frontend env variables set in Vercel (REACT_APP_API_BASE_URL)
- [ ] Backend code pushed to GitHub with CORS fix
- [ ] Frontend code pushed to GitHub with API URL fix
- [ ] Both apps redeployed (check deployment status)
- [ ] Backend logs show no errors
- [ ] Frontend can reach backend (test with login/register)
- [ ] Console shows detailed error logs if issues occur
- [ ] All API responses include success/error messages

---

## Production Best Practices

1. **Never commit `.env` files** - they contain secrets
2. **Use `process.env` variables** - set in deployment platform
3. **Enable HTTPS** everywhere - both frontend and backend
4. **Monitor logs regularly** - check Render and Vercel logs
5. **Test thoroughly** before production - test all auth flows
6. **Use rate limiting** - already configured in backend
7. **Implement logging** - enhanced error logging added
8. **Database backups** - configure in MongoDB Atlas

---

## Need Help?

### Check Logs:
- **Render Backend Logs**: Dashboard → Logs tab
- **Vercel Frontend Logs**: Dashboard → Deployments → Logs
- **Browser Console**: F12 → Console tab (shows [API Error] logs)

### Common Commands:
```bash
# Test if backend is accessible
curl https://your-render-backend.onrender.com/api/auth/login

# Check if frontend can reach backend
curl -X POST https://your-render-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json"
```

