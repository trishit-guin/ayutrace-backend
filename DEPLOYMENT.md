# AyuTrace Backend - Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (if not using Docker)

### Option 1: Docker Deployment (Recommended)

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd ayutrace-backend
   ```

2. **Configure Environment**
   ```bash
   cp .env.production .env
   # Edit .env with your production values
   ```

3. **Deploy with Docker**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Access Your API**
   - API: http://localhost:3000
   - Health: http://localhost:3000/health
   - Docs: http://localhost:3000/api-docs

### Option 2: Manual Deployment

1. **Install Dependencies**
   ```bash
   npm ci --production
   ```

2. **Setup Database**
   ```bash
   npm run build
   npm run deploy
   ```

3. **Start Application**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Security
JWT_SECRET="your-secure-secret"
NODE_ENV="production"

# Server
PORT=3000
CORS_ORIGIN="https://yourdomain.com"
```

## 📊 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run build` - Generate Prisma client & push schema
- `npm run deploy` - Run database migrations
- `npm run seed` - Seed database with sample data

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild
docker-compose up --build -d
```

## 🔒 Production Checklist

- [ ] Update all environment variables
- [ ] Set secure JWT_SECRET
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update CORS origins
- [ ] Set up log rotation

## 🩺 Health Monitoring

The API includes health checks at `/health` endpoint:
- Database connectivity
- Service status
- Memory usage

## 📝 API Documentation

Swagger documentation available at `/api-docs` when server is running.

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check database logs
   docker-compose logs postgres
   ```

2. **API Not Starting**
   ```bash
   # Check API logs
   docker-compose logs api
   ```

3. **Prisma Issues**
   ```bash
   # Regenerate client
   npx prisma generate
   ```

## 📞 Support

For deployment issues, check:
1. Logs: `docker-compose logs`
2. Health check: `curl http://localhost:3000/health`
3. Database status: `docker-compose exec postgres pg_isready`