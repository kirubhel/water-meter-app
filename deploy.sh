#!/bin/bash

# Water Meter Application Deployment Script
# Server: 196.190.251.194
# Username: daftech1

echo "🚀 Starting Water Meter Application Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    print_error "Failed to build Docker images"
    exit 1
fi

print_status "Docker images built successfully!"

print_status "Creating deployment package..."
# Create a deployment directory
mkdir -p deployment
cp docker-compose.yml deployment/
cp -r water-meter-backend deployment/
cp -r water-meter-frontend deployment/

# Create a simple deployment script for the server
cat > deployment/start.sh << 'EOF'
#!/bin/bash
echo "Starting Water Meter Application..."
docker-compose up -d
echo "Application started successfully!"
echo "Frontend: http://196.190.251.194:7072"
echo "Backend API: http://196.190.251.194:7075"
EOF

chmod +x deployment/start.sh

print_status "Deployment package created successfully!"

print_status "Transferring files to server..."
# Transfer the deployment package to the server
scp -r deployment daftech1@196.190.251.194:~/

if [ $? -ne 0 ]; then
    print_error "Failed to transfer files to server"
    exit 1
fi

print_status "Files transferred successfully!"

print_status "Connecting to server to start application..."
# SSH into the server and start the application
ssh daftech1@196.190.251.194 << 'EOF'
cd ~/deployment
chmod +x start.sh
./start.sh
EOF

if [ $? -ne 0 ]; then
    print_error "Failed to start application on server"
    exit 1
fi

print_status "Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://196.190.251.194:7072"
echo "   Backend API: http://196.190.251.194:7075"
echo ""
echo "📝 Useful commands:"
echo "   SSH to server: ssh daftech1@196.190.251.194"
echo "   View logs: docker-compose logs -f"
echo "   Stop application: docker-compose down"
echo "   Restart application: docker-compose restart" 