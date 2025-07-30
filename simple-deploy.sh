#!/bin/bash

# Simple Water Meter Application Deployment Script
# This script only starts the Docker containers without system updates

echo "🚀 Starting Water Meter Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Docker Compose is available"

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
print_status "Building and starting Water Meter Application..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    print_status "Application started successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://196.190.251.194:7072"
    echo "   Backend API: http://196.190.251.194:7075"
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop application: docker-compose down"
    echo "   Restart application: docker-compose restart"
    echo "   View running containers: docker ps"
else
    print_error "Failed to start application"
    exit 1
fi 