# Stage 1: Build the frontend
FROM node:18-alpine AS builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Build frontend
RUN npm run build

# Stage 2: Setup the backend and serve the app
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy backend source code
COPY backend/ .

# Copy built frontend assets from builder stage
COPY --from=builder /app/frontend/dist ./public

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
