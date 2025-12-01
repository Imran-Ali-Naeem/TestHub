# 🚀 THEX Setup Guide for Your Colleague

## 📋 **Complete Step-by-Step Instructions**

This guide will help your colleague set up THEX project from GitHub in **6 simple commands**.

---

## ⚠️ **BEFORE YOU START - READ THIS!**

### **What Works Out of the Box:**
✅ Email/Password Signup  
✅ Email/Password Login  
✅ JWT Authentication  
✅ Admin & Tester Dashboards  
✅ User Management  
✅ MongoDB Database  

### **What WILL NOT Work Without Configuration:**
❌ **Google OAuth** (Sign in with Google buttons)  
   - Requires Google Cloud Console setup
   - Your colleague needs their own Google OAuth Client ID
   - See Section 5 below for configuration steps

---

## 1️⃣ **PREREQUISITES** (Install First!)

Your colleague must have these installed on their computer:

### **Check if already installed:**

```bash
# Check Docker
docker --version
# Should show: Docker version 20.10+ or higher

# Check Docker Compose
docker-compose --version
# Should show: Docker Compose version 2.0+ or higher

# Check Node.js
node --version
# Should show: v18.0.0 or higher

# Check npm
npm --version
# Should show: 9.0.0 or higher

# Check Git
git --version
# Should show: git version 2.0+ or higher
```

### **If NOT installed, download from:**

1. **Docker Desktop**: https://docs.docker.com/get-docker/
   - For Windows: Install Docker Desktop for Windows
   - For Mac: Install Docker Desktop for Mac
   - For Linux: Install Docker Engine + Docker Compose

2. **Node.js & npm**: https://nodejs.org/
   - Download LTS (Long Term Support) version
   - npm comes bundled with Node.js

3. **Git**: https://git-scm.com/downloads

---

## 2️⃣ **CLONE THE PROJECT**

Your colleague should run:

```bash
# Clone your GitHub repository
git clone <YOUR_GITHUB_REPO_URL_HERE>

# Navigate into project
cd THEX
```

**Replace** `<YOUR_GITHUB_REPO_URL_HERE>` with your actual GitHub repository URL.

---

## 3️⃣ **RUN THE 6 SETUP COMMANDS**

### **Command 1: Start Database** ⏱️ *10-15 seconds*

```bash
cd database-microservice
./start-db.sh
cd ..
```

**What this does:**
- Starts MongoDB on port `27017`
- Starts Mongo Express (Database UI) on port `8081`
- Creates Docker network `testops-db-network`

**Wait 10-15 seconds** before next command! MongoDB needs time to initialize.

**How to verify:**
```bash
docker ps
# Should see: testops-db container running
```

---

### **Command 2: Build Backend** ⏱️ *1-2 minutes*

```bash
cd backend
docker-compose build
cd ..
```

**What this does:**
- Downloads Go dependencies
- Builds Docker image for backend
- Creates `testops-backend` image

**This takes 1-2 minutes on first run.** Subsequent builds are faster.

---

### **Command 3: Start Backend** ⏱️ *5-10 seconds*

```bash
cd backend
./start-backend.sh
cd ..
```

**What this does:**
- Starts backend API on port `8080`
- Connects to MongoDB database
- Initializes JWT authentication service

**Wait 5-10 seconds** for backend to connect to database!

**How to verify:**
```bash
curl http://localhost:8080
# Should return: "Test Automation Backend API"
```

---

### **Command 4: Install Frontend Dependencies** ⏱️ *2-3 minutes*

```bash
cd Frontend
npm install
```

**What this does:**
- Downloads all React, TypeScript, Vite packages
- Installs UI libraries (shadcn/ui, Tailwind CSS)
- Installs Google OAuth library

**This takes 2-3 minutes** depending on internet speed.

**Expected output:**
```
added 1234 packages in 2m
```

---

### **Command 5: Start Frontend** ⏱️ *3-5 seconds*

```bash
npm run dev
```

**What this does:**
- Starts Vite dev server on port `3456`
- Compiles TypeScript + React code
- Enables hot reload for development

**Keep this terminal open!** Press `Ctrl+C` to stop.

**Expected output:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:3456/
➜  Network: use --host to expose
```

---

### **✅ DONE! All 6 Commands Complete**

---

## 4️⃣ **VERIFY EVERYTHING WORKS**

### **Open these URLs in browser:**

1. **Frontend Application**: http://localhost:3456
   - Should see landing page with "Welcome to THEX"
   - Click "Get Started" → Should see Login/Signup page

2. **Backend API**: http://localhost:8080
   - Should see text: "Test Automation Backend API"

3. **Mongo Express** (Database UI): http://localhost:8081
   - Login: username `admin`, password `pass`
   - Navigate: `testops` → `users` collection

### **Test Email Authentication:**

1. Go to http://localhost:3456
2. Click "Get Started"
3. Switch to "Sign Up" tab
4. Create account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
   - Role: `Tester`
5. Click "Sign Up"
6. Should see success message
7. Click "Go to Login Page"
8. Login with:
   - Email: `test@example.com`
   - Password: `Test123!`
9. Should redirect to **Tester Dashboard**

**✅ If this works, setup is successful!**

---

## 5️⃣ **GOOGLE OAUTH SETUP** (Optional)

⚠️ **Google "Sign in with Google" buttons WILL NOT WORK without this!**

Your colleague needs their own Google OAuth Client ID:

### **Steps:**

1. Go to https://console.cloud.google.com/

2. Click "Select a Project" → "New Project"
   - Project Name: `THEX-Dev`
   - Click "Create"

3. Wait for project creation, then select it

4. In search bar, type "OAuth consent screen" → Click it

5. Configure consent screen:
   - User Type: **External**
   - Click "Create"
   - App name: `THEX Test Automation`
   - User support email: (your colleague's email)
   - Developer contact: (your colleague's email)
   - Click "Save and Continue"
   - Scopes: Click "Save and Continue" (skip)
   - Test users: Click "Save and Continue" (skip)
   - Click "Back to Dashboard"

6. In search bar, type "Credentials" → Click it

7. Click "Create Credentials" → "OAuth 2.0 Client ID"

8. Configure OAuth Client:
   - Application type: **Web application**
   - Name: `THEX Web Client`
   - Authorized JavaScript origins:
     - Click "Add URI" → Enter: `http://localhost:3456`
   - Authorized redirect URIs:
     - Click "Add URI" → Enter: `http://localhost:3456`
   - Click "Create"

9. **COPY THE CLIENT ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

10. Open file: `Frontend/src/main.tsx`

11. Find this line (around line 10):
    ```typescript
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
    ```

12. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID

13. Save the file

14. **Restart frontend**:
    - In Frontend terminal, press `Ctrl+C`
    - Run: `npm run dev`

15. **Test Google OAuth**:
    - Go to http://localhost:3456
    - Click "Get Started"
    - Click "Continue with Google" button
    - Should see Google sign-in popup
    - If it works, you're done! ✅

---

## 6️⃣ **DEFAULT CREDENTIALS**

### **MongoDB Database:**
- Host: `localhost:27017`
- Username: `admin`
- Password: `admin123`
- Database: `testops`

### **Mongo Express UI:**
- URL: http://localhost:8081
- Username: `admin`
- Password: `pass`

### **Create Admin Account:**

After setup, create an admin account for testing:

1. Go to http://localhost:3456
2. Click "Get Started" → "Sign Up"
3. Fill form:
   - Username: `admin`
   - Email: `admin@thex.com`
   - Password: `Admin123!`
   - Role: `Admin`
4. Sign up → Login → Access Admin Dashboard

---

## 7️⃣ **PORTS USED BY THIS PROJECT**

Make sure these ports are **free** (not used by other apps):

| Port | Service | URL |
|------|---------|-----|
| `3456` | Frontend | http://localhost:3456 |
| `8080` | Backend API | http://localhost:8080 |
| `27017` | MongoDB | localhost:27017 |
| `8081` | Mongo Express | http://localhost:8081 |

**Check if port is in use:**

```bash
# Linux/Mac
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

---

## 8️⃣ **STOPPING THE PROJECT**

When done working, stop all services:

### **Stop Frontend:**
- In Frontend terminal, press `Ctrl+C`

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

### **Or stop everything at once:**
```bash
# In backend folder
cd backend
./stop-backend.sh

# In database folder
cd ../database-microservice
./stop-db.sh
```

---

## 9️⃣ **TROUBLESHOOTING**

### **Problem: "Port already in use"**

**Error:** `Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use`

**Solution:**

```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or stop all Docker containers
docker stop $(docker ps -aq)
```

---

### **Problem: Backend shows "Error connecting to MongoDB"**

**Cause:** Database not started or not ready yet

**Solution:**

```bash
# Make sure database is running
docker ps | grep testops-db

# If not running, start it
cd database-microservice
./start-db.sh

# Wait 15 seconds, then restart backend
cd ../backend
./stop-backend.sh
./start-backend.sh
```

---

### **Problem: Frontend shows "Network Error" when logging in**

**Cause:** Backend not running

**Solution:**

```bash
# Check backend status
docker ps | grep testops-backend

# If not running
cd backend
./start-backend.sh

# Check if working
curl http://localhost:8080
```

---

### **Problem: npm install fails with "ERESOLVE" error**

**Error:** `ERESOLVE unable to resolve dependency tree`

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps
```

---

### **Problem: Google OAuth shows "Invalid Client ID"**

**Cause:** Google OAuth Client ID not configured (expected!)

**Solution:**

Either:
1. Follow Section 5 to configure Google OAuth, OR
2. Use Email/Password authentication instead (works perfectly!)

---

### **Problem: Database UI (Mongo Express) doesn't show users**

**Cause:** UI refresh issue (data IS saved!)

**Solution:**

```bash
# Verify users exist via MongoDB shell
docker exec -it testops-db mongosh -u admin -p admin123

# In mongosh:
use testops
db.users.find().pretty()
exit

# Refresh Mongo Express browser page (F5)
```

---

### **Problem: Docker build fails**

**Error:** `failed to solve with frontend dockerfile.v0`

**Solution:**

```bash
# Update Docker to latest version
docker --version

# Clear Docker cache
docker system prune -a

# Rebuild
cd backend
docker-compose build --no-cache
```

---

## 🔟 **QUICK COMMAND REFERENCE**

### **Start Everything:**

```bash
# Terminal 1: Database
cd database-microservice && ./start-db.sh

# Wait 15 seconds, then Terminal 2: Backend
cd backend && docker-compose build && ./start-backend.sh

# Wait 10 seconds, then Terminal 3: Frontend
cd Frontend && npm install && npm run dev
```

### **Stop Everything:**

```bash
# Frontend: Ctrl+C in terminal

# Backend:
cd backend && ./stop-backend.sh

# Database:
cd database-microservice && ./stop-db.sh
```

### **Check Status:**

```bash
# See all running containers
docker ps

# Check backend logs
cd backend && docker-compose logs

# Check database logs
cd database-microservice && docker-compose logs
```

### **Access URLs:**

- Frontend: http://localhost:3456
- Backend: http://localhost:8080
- Mongo Express: http://localhost:8081 (admin/pass)

---

## 📊 **SUMMARY: 6 Commands Your Colleague Runs**

```bash
# 1. Clone project
git clone <YOUR_REPO_URL>
cd THEX

# 2. Start database (wait 15 sec)
cd database-microservice && ./start-db.sh && cd ..

# 3. Build backend (wait 1-2 min)
cd backend && docker-compose build && cd ..

# 4. Start backend (wait 10 sec)
cd backend && ./start-backend.sh && cd ..

# 5. Install frontend dependencies (wait 2-3 min)
cd Frontend && npm install

# 6. Start frontend
npm run dev
```

**Total time:** 5-8 minutes (depending on internet speed)

---

## ✅ **SUCCESS CHECKLIST**

Your colleague should verify:

- [ ] All prerequisites installed (Docker, Node.js, npm, Git)
- [ ] Repository cloned successfully
- [ ] Database started and running (docker ps shows testops-db)
- [ ] Backend built without errors
- [ ] Backend started and responds to curl http://localhost:8080
- [ ] Frontend dependencies installed (node_modules folder exists)
- [ ] Frontend running on http://localhost:3456
- [ ] Can create account with email/password
- [ ] Can login successfully
- [ ] Redirects to dashboard after login
- [ ] Can logout and return to home page

**If all checked ✅, setup is complete!**

---

## 🎯 **WHAT TO TELL YOUR COLLEAGUE**

Send them this message:

> Hey! I'm sharing the THEX project with you.
> 
> **Setup Steps:**
> 1. Make sure you have Docker, Node.js (v18+), and Git installed
> 2. Clone: `git clone <REPO_URL>`
> 3. Follow the **6 commands** in `SETUP_GUIDE.md` file
> 4. Total setup time: 5-8 minutes
> 
> **What works:** Email/Password authentication, dashboards, user management
> **What doesn't work:** Google OAuth (you'll need to configure your own Client ID if you want it)
> 
> **If you have issues:** Check the Troubleshooting section in SETUP_GUIDE.md
> 
> Let me know if you run into any problems!

---

## 📞 **GET HELP**

If your colleague faces issues:

1. Check **Troubleshooting** section above
2. Verify prerequisites are correct versions
3. Make sure all 6 commands ran without errors
4. Check `docker ps` shows containers running
5. Check backend logs: `cd backend && docker-compose logs`

---

**Good luck! 🚀**
