# TestOps - Automated Testing Platform

A comprehensive test automation platform with Selenium-based test execution, video recording, and result management.

## 🏗️ Architecture

TestOps is a microservices-based platform consisting of:

- **Frontend**: React/Vite UI for test management and monitoring
- **Backend**: Golang REST API for business logic and data management
- **Runner**: Python microservice for executing Selenium tests with video recording
- **Gateway**: Nginx reverse proxy for routing and serving static files
- **Database**: PostgreSQL (or MongoDB) for data persistence
- **Queue**: Redis for job queue management

## 📁 Project Structure

```
TestOps/
├── frontend/           # React UI
├── backend/            # Golang API service
├── runner/             # Python Selenium runner
├── gateway/            # Nginx gateway
├── database/           # Database initialization scripts
├── tests/              # Platform tests
├── scripts/            # Helper scripts
├── docker/             # Docker-specific files
└── docker-compose.yml  # Service orchestration
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TestOps
   ```

2. **Initialize environment**
   ```bash
   chmod +x scripts/init_env.sh
   ./scripts/init_env.sh
   ```

3. **Configure environment variables**
   ```bash
   nano .env
   # Update JWT_SECRET and other sensitive values
   ```

4. **Start the platform**
   ```bash
   ./scripts/start.sh
   ```

   Or manually:
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Videos: http://localhost/videos
   - Screenshots: http://localhost/screenshots

## 🛠️ Development

### Backend (Golang)

```bash
cd backend
go mod download
go run cmd/api/main.go
```

### Runner (Python)

```bash
cd runner
pip install -r requirements.txt
python src/runner.py
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

## 📦 Building

Build all Docker images:

```bash
./scripts/build.sh
```

Or build individually:

```bash
docker build -t testops-backend -f backend/Dockerfile backend/
docker build -t testops-runner -f runner/Dockerfile runner/
docker build -t testops-gateway -f gateway/Dockerfile gateway/
```

## 🧪 Testing

Run tests:

```bash
# Unit tests
cd tests/unit && ./run.sh

# Integration tests
cd tests/integration && ./run.sh

# E2E tests
cd tests/e2e && ./run.sh
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Tests
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create new test
- `GET /api/tests/:id` - Get test by ID
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test

### Results
- `GET /api/results` - Get all results
- `GET /api/results/:id` - Get result by ID
- `POST /api/results` - Upload test result

### Workers
- `GET /api/workers` - Get all workers
- `GET /api/workers/:id/status` - Get worker status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://testops:testops123@postgres:5432/testops` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `JWT_SECRET` | Secret key for JWT tokens | `change-this-in-production` |
| `PORT` | Backend API port | `8080` |
| `VITE_API_URL` | Frontend API URL | `http://localhost/api` |

## 🐳 Docker Services

- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis queue (port 6379)
- **backend**: Golang API (port 8080)
- **runner**: Python Selenium runner
- **frontend**: React UI (port 5173)
- **gateway**: Nginx reverse proxy (port 80)

## 📊 Monitoring

View logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f runner
```

Check service status:

```bash
docker-compose ps
```

## 🛑 Stopping the Platform

```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Team Name

## 🙏 Acknowledgments

- Selenium WebDriver
- Golang
- React
- Docker
- Nginx
