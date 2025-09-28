#!/bin/bash

# AyuTrace Backend Deployment Script
echo "🚀 Starting AyuTrace Backend Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set deployment environment
ENV=${1:-production}
echo "📋 Deployment Environment: $ENV"

# Create .env file from template
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.production template..."
    cp .env.production .env
    echo "⚠️  Please update the .env file with your actual configuration values!"
    echo "⚠️  Especially DATABASE_URL and JWT_SECRET"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run build

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose down
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check if API is healthy
echo "🩺 Checking API health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API is healthy!"
else
    echo "❌ API health check failed. Check logs with: docker-compose logs api"
    exit 1
fi

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec api npm run deploy

# Optional: Seed database
read -p "🌱 Do you want to seed the database with sample data? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose exec api npm run seed
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "   API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo "   API Docs: http://localhost:3000/api-docs"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f api"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update .env with production values"
echo "   2. Set up SSL certificates for HTTPS"
echo "   3. Configure firewall rules"
echo "   4. Set up monitoring and backups"