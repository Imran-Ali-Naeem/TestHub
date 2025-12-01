# Database Microservice

Independent MongoDB database service with Mongo Express web interface.

## Services

- **MongoDB**: Database server (Port 27017)
- **Mongo Express**: Web-based admin interface (Port 8081)

## Quick Start

1. Start the database microservice:
   ```bash
   ./start-db.sh
   ```

2. Access Mongo Express:
   - URL: http://localhost:8081
   - Username: admin
   - Password: pass

3. Stop the database microservice:
   ```bash
   ./stop-db.sh
   ```

## Database Details

- Database Name: `testops`
- Collections: `users`
- Admin User: admin
- Admin Password: admin123

## Checking Status

```bash
./check-db.sh
```
