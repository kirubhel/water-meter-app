#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Warning: .env file not found"
fi

# Build Docker image
docker build -t water-meter-backend .

# Run container with environment variables
docker run -d \
  -p $PORT:$PORT \
  -e DB_SERVER=$DB_SERVER \
  -e DB_NAME=$DB_NAME \
  -e DB_PORT=$DB_PORT \
  -e DB_USER=$DB_USER \
  -e DB_PASSWORD=$DB_PASSWORD \
  -e DB_OPTIONS_ENCRYPT=$DB_OPTIONS_ENCRYPT \
  -e DB_OPTIONS_TRUST_SERVER_CERTIFICATE=$DB_OPTIONS_TRUST_SERVER_CERTIFICATE \
  -e NODE_ENV=$NODE_ENV \
  --name water-meter-backend \
  water-meter-backend

echo "Backend deployed successfully on port $PORT"