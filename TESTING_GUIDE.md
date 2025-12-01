# Testing Guide: Frontend to MongoDB Connection

## Overview
This guide will help you test the complete signup flow from frontend to MongoDB database.

## Architecture
```
Frontend (React) → Backend (Golang) → MongoDB
     :5173             :8080           :27017
```

## Step-by-Step Testing

### 1. Start Database Microservice

```bash
cd database-microservice
./start-db.sh
```

**Verify:**
- MongoDB running on port 27017
- Mongo Express UI: http://localhost:8081 (admin/pass)
- Check that `users` collection exists in `testops` database

### 2. Start Backend API

```bash
cd ../backend
./start-backend.sh
```

**Verify:**
- Backend running on port 8080
- Health check: http://localhost:8080/health (should return "OK")
- Check logs: `./logs-backend.sh`

### 3. Start Frontend

```bash
cd ../Frontend
npm run dev
```

**Verify:**
- Frontend running on port 5173
- Open: http://localhost:5173

### 4. Test Signup Flow

1. Navigate to signup page: http://localhost:5173/auth
2. Click on "Sign Up" tab
3. Fill in the form:
   - Full Name: `Test User`
   - Email: `testuser123@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
   - Check "Accept Terms"
4. Click "SIGN UP"

**Expected Behavior:**
- Loading spinner appears
- Success message: "Account Created Successfully!"
- User data saved to MongoDB

### 5. Verify in Database

**Option 1: Mongo Express UI**
1. Open http://localhost:8081
2. Login: admin / pass
3. Navigate to: testops → users
4. You should see your new user with:
   - username: "Test User"
   - email: "testuser123@example.com"
   - password: "test123" (plain text)
   - role: "tester"
   - created_at: timestamp
   - updated_at: timestamp

**Option 2: Command Line**
```bash
docker exec -it testops-mongo mongosh -u admin -p admin123 testops

# Run in MongoDB shell:
db.users.find().pretty()
```

## Troubleshooting

### Backend Not Starting
- Make sure database is running first
- Check if network exists: `docker network ls | grep testops-db-network`
- View logs: `cd backend && ./logs-backend.sh`

### Connection Refused Error
- Verify backend is running: `curl http://localhost:8080/health`
- Check CORS settings in backend/cmd/api/main.go
- Ensure frontend API URL is correct: `http://localhost:8080`

### Duplicate Email/Username Error
- Each email and username must be unique
- Try with a different email address
- Or clear database: `docker exec testops-mongo mongosh -u admin -p admin123 testops --eval "db.users.deleteMany({})"`

### Password Validation Error
- Ensure passwords match
- Check minimum length requirements

## Expected Data Flow

1. **Frontend** sends POST request to `http://localhost:8080/api/users/signup`
   ```json
   {
     "name": "Test User",
     "email": "testuser123@example.com",
     "password": "test123"
   }
   ```

2. **Backend Handler** receives request and calls UserService

3. **UserService** validates:
   - Required fields present
   - Email not already registered
   - Username not already taken
   - Automatically sets role to "tester"

4. **UserRepository** saves to MongoDB:
   ```json
   {
     "_id": ObjectId("..."),
     "username": "Test User",
     "email": "testuser123@example.com",
     "password": "test123",
     "role": "tester",
     "created_at": ISODate("..."),
     "updated_at": ISODate("...")
   }
   ```

5. **Backend** returns success response to Frontend

6. **Frontend** shows success message

## Stopping Services

```bash
# Stop frontend (Ctrl+C in terminal)

# Stop backend
cd backend
./stop-backend.sh

# Stop database
cd ../database-microservice
./stop-db.sh
```

## Notes

- No JWT authentication implemented yet
- Passwords stored in plain text (for testing only)
- Role automatically set to "tester" for all signups
- Each work is independent and commented for easy debugging
