# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN chmod -R 755 node_modules/.bin && npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist/water-meter-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 7072

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 