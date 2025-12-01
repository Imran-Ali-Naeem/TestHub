# THEX - Test Automation Platform

A comprehensive test automation platform with JWT authentication, Google OAuth, and role-based access control.

---

## 🎯 **Quick Start Guide for New Developers**

### **Prerequisites** (Install these FIRST!)

Before cloning this project, make sure you have:

1. **Docker** (version 20.10+)
   - Download: https://docs.docker.com/get-docker/
   - Verify: `docker --version`

2. **Docker Compose** (version 2.0+)
   - Usually comes with Docker Desktop
   - Verify: `docker-compose --version`

3. **Node.js** (version 18+)
   - Download: https://nodejs.org/
   - Verify: `node --version`

4. **npm** (version 9+)
   - Comes with Node.js
   - Verify: `npm --version`

5. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

---

## 🚀 **Setup Instructions (6 Commands)**

### **Step 1: Clone the Repository**

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd THEX
```

### **Step 2: Start Database**

```bash
cd database-microservice
./start-db.sh
cd ..
```

**Wait 10-15 seconds** for MongoDB to initialize!

### **Step 3: Build Backend**

```bash
cd backend
docker-compose build
cd ..
```

### **Step 4: Start Backend**

```bash
cd backend
./start-backend.sh
cd ..
```

**Wait 5-10 seconds** for backend to connect to database!

### **Step 5: Install Frontend Dependencies**

```bash
cd Frontend
npm install
```

This might take 2-3 minutes depending on your internet speed.

### **Step 6: Start Frontend**

```bash
npm run dev
```

---

## ✅ **Verify Everything is Running**

After all 6 commands, you should see:

1. **Backend**: Running on **http://localhost:8080**
   - Test: Open http://localhost:8080 in browser (should see "Test Automation Backend API")

2. **Frontend**: Running on **http://localhost:3456**
   - Test: Open http://localhost:3456 in browser (should see landing page)

3. **MongoDB**: Running on **localhost:27017**

4. **Mongo Express** (Database UI): Running on **http://localhost:8081**
   - Login: username `admin`, password `pass`

---

## 🔐 **Authentication Features**

This platform has **4 independent authentication flows**:

### 1. **Email/Password Signup**
- User creates account with email and password
- Shows success message
- User must login manually after signup

### 2. **Email/Password Login**
- Existing users login with credentials
- Receives JWT token valid for 24 hours

### 3. **Google OAuth Signup** ⚠️
- New users can signup with Google
- Must set password after first login
- **IMPORTANT**: Google OAuth will NOT work without configuration (see below)

### 4. **Google OAuth Login** ⚠️
- Existing users can login with Google
- Must verify password for security
- **IMPORTANT**: Google OAuth will NOT work without configuration (see below)

---

## ⚠️ **IMPORTANT: Google OAuth Configuration**

**Google "Sign in with Google" will NOT work out of the box!**

You need to configure your own Google OAuth Client ID:

### **Steps to Enable Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing one

3. Enable **Google+ API**

4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**

5. Configure OAuth consent screen:
   - App name: "THEX Test Automation"
   - Authorized domains: `localhost`

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3456`
   - Authorized redirect URIs: `http://localhost:3456`

7. Copy the **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

8. Update `Frontend/src/main.tsx`:
   ```typescript
   <GoogleOAuthProvider clientId="YOUR_CLIENT_ID_HERE">
   ```

9. Restart frontend: Stop (`Ctrl+C`) and run `npm run dev` again

**Without this configuration**: Email/password authentication will work perfectly, but Google OAuth buttons will show errors.

---

## 📁 **Project Structure**

```
THEX/
├── Frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/         # Auth, Dashboard, Profile pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Auth contexts (JWT + User)
│   │   └── hooks/         # Custom React hooks
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # Go backend API
│   ├── cmd/api/          # Main entry point
│   ├── internal/
│   │   ├── handlers/     # HTTP request handlers
│   │   ├── services/     # Business logic (JWT, Auth)
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Data models
│   │   └── repository/   # Database layer
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── database-microservice/ # MongoDB setup
│   ├── docker-compose.yml
│   ├── .env              # DB credentials
│   ├── start-db.sh
│   └── stop-db.sh
│
└── shared/               # Shared TypeScript types
    └── schema.ts
```

---

## 🔑 **Default Credentials**

### **MongoDB:**
- Username: `admin`
- Password: `admin123`
- Database: `testops`

### **Mongo Express (Database UI):**
- Username: `admin`
- Password: `pass`

### **Test User Account** (Create manually after setup):
- Email: `test@example.com`
- Password: `Test123!`
- Role: `Tester`

### **Admin Account** (Create manually after setup):
- Email: `admin@thex.com`
- Password: `Admin123!`
- Role: `Admin`

---

## 🛑 **Stopping the Application**

### **Stop Frontend:**
Press `Ctrl+C` in the Frontend terminal

### **Stop Backend:**
```bash
cd backend
./stop-backend.sh
```

### **Stop Database:**
```bash
cd database-microservice
./stop-db.sh
```

---

## 🔧 **Troubleshooting**

### **Problem: Backend fails to start**

**Error**: `Error connecting to MongoDB`

**Solution**:
```bash
# Make sure database is running first
cd database-microservice
./start-db.sh

# Wait 10-15 seconds, then start backend
cd ../backend
./start-backend.sh
```

---

### **Problem: Frontend shows "Network Error"**

**Cause**: Backend not running

**Solution**:
```bash
# Check if backend is running
docker ps

# Should see container named "testops-backend"
# If not, start it:
cd backend
./start-backend.sh
```

---

### **Problem: "Port already in use"**

**Ports used by this project**:
- `3456` - Frontend
- `8080` - Backend
- `27017` - MongoDB
- `8081` - Mongo Express

**Solution**:
```bash
# Check what's using the port
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or change port in configuration
```

---

### **Problem: Google OAuth shows error**

**Error**: `Invalid client ID` or `redirect_uri_mismatch`

**Cause**: Google OAuth not configured (expected!)

**Solution**: Follow "Google OAuth Configuration" section above OR use email/password authentication instead.

---

### **Problem: Database doesn't show users**

**Cause**: Mongo Express UI refresh issue

**Solution**:
```bash
# Verify users exist via command line
docker exec -it testops-db mongosh -u admin -p admin123

# In mongosh:
use testops
db.users.find().pretty()
exit

# Refresh Mongo Express browser page
```

---

### **Problem: "npm install" fails**

**Error**: `ERESOLVE unable to resolve dependency tree`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps
```

---

## 🧪 **Testing the Setup**

### **1. Test Backend API:**

```bash
# Health check
curl http://localhost:8080

# Should return: "Test Automation Backend API"
```

### **2. Test Authentication:**

```bash
# Signup
curl -X POST http://localhost:8080/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!","role":"Tester"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Should return JWT token
```

### **3. Test Protected Endpoint:**

```bash
# Get current user (requires token from login)
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 📊 **Database Access**

### **Option 1: Mongo Express (GUI)**

1. Open http://localhost:8081
2. Login: `admin` / `pass`
3. Navigate to `testops` database → `users` collection
4. **Note**: May need page refresh to see new users

### **Option 2: MongoDB Shell (CLI)**

```bash
# Connect to MongoDB
docker exec -it testops-db mongosh -u admin -p admin123

# Switch to testops database
use testops

# Show all users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({email: "test@example.com"})

# Exit
exit
```

---

## 🏗️ **Tech Stack**

### **Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Wouter (routing)
- @react-oauth/google (Google Sign-In)
- Tailwind CSS
- shadcn/ui components

### **Backend:**
- Go 1.24
- Gorilla Mux (routing)
- JWT (github.com/golang-jwt/jwt/v5)
- MongoDB driver
- Docker + Docker Compose

### **Database:**
- MongoDB 8.0
- Mongo Express (web UI)

---

## 🔐 **Security Notes**

### **⚠️ DEVELOPMENT ONLY - NOT FOR PRODUCTION**

This setup includes:
- ✅ JWT tokens with 24-hour expiration
- ✅ Password validation before Google OAuth login
- ✅ Email uniqueness checks
- ✅ Protected routes with authentication middleware
- ⚠️ **PLAIN TEXT PASSWORDS** in database (no hashing!)
- ⚠️ **HARDCODED** database credentials in .env
- ⚠️ **NO HTTPS** (uses http://)

**Before production deployment, you MUST**:
1. Add password hashing (bcrypt)
2. Use environment-specific .env files (NOT committed to Git)
3. Enable HTTPS with SSL certificates
4. Use strong, unique passwords
5. Configure CORS properly
6. Add rate limiting
7. Set up proper secret key rotation

---

## 📚 **API Endpoints**

### **Public Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/signup` | Email/password signup |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google/signup` | Google OAuth signup (new users) |
| POST | `/api/auth/google/login` | Google OAuth login (existing users) |
| POST | `/api/auth/google/verify-password` | Verify password for Google login |
| POST | `/api/users/set-password` | Set password for Google OAuth users |

### **Protected Endpoints (Require JWT):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/users` | Get all users (Admin only) |

---

## 🤝 **Contributing**

1. Create a new branch for your feature
2. Make changes
3. Test locally with all 6 commands
4. Commit with clear message
5. Push and create Pull Request

---

## 📝 **Changelog**

### **Version 1.0.0** (December 2025)
- ✅ JWT authentication with 24-hour tokens
- ✅ Four independent auth flows (email signup, Google signup, email login, Google login)
- ✅ Fixed logout bug (dual-context clearing)
- ✅ Fixed Google OAuth security vulnerability (email validation)
- ✅ Email signup shows success message before login
- ✅ Role-based access control (Admin/Tester)
- ✅ Protected routes with automatic redirects
- ✅ MongoDB integration with Mongo Express UI
- ✅ Dockerized backend and database
- ✅ React frontend with TypeScript

---

## 📧 **Support**

If you encounter issues:

1. Check **Troubleshooting** section above
2. Verify all prerequisites are installed
3. Make sure all 6 commands were run in order
4. Check Docker containers are running: `docker ps`
5. Check backend logs: `cd backend && docker-compose logs`
6. Check frontend terminal for errors

---

## 📄 **License**

[Add your license here]

---

## 👥 **Team**

Developed by [Your Team Name]

---

**Happy Testing! 🚀**
