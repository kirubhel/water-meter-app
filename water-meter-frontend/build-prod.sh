#!/bin/bash

# Exit on error
set -e

echo "Building frontend for production..."

# Install dependencies
npm install

# Build Angular app
npm run build --configuration=production

echo "Production build complete!"
echo "Static files are in: water-meter-frontend/dist/"
