#!/bin/bash

# Server-side deployment script for Water Meter Application
# This script should be run on the server (196.190.251.194)

echo "🔧 Setting up Water Meter Application on server..."

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

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed successfully!"
else
    print_status "Docker is already installed"
fi

# Add user to docker group if not already added
if ! groups $USER | grep -q docker; then
    print_status "Adding user to docker group..."
    sudo usermod -aG docker $USER
    print_warning "Please log out and log back in for group changes to take effect, or run: newgrp docker"
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully!"
else
    print_status "Docker Compose is already installed"
fi

# Create application directory
print_status "Setting up application directory..."
mkdir -p ~/water-meter-app
cd ~/water-meter-app

# Stop any existing containers
print_status "Stopping existing containers..."
sudo docker-compose down 2>/dev/null || true

# Start the application
print_status "Starting Water Meter Application..."
sudo docker-compose up -d

if [ $? -eq 0 ]; then
    print_status "Application started successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://196.190.251.194:7072"
    echo "   Backend API: http://196.190.251.194:7075"
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs: sudo docker-compose logs -f"
    echo "   Stop application: sudo docker-compose down"
    echo "   Restart application: sudo docker-compose restart"
    echo "   View running containers: sudo docker ps"
else
    print_error "Failed to start application"
    exit 1
fi 