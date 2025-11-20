# Stage 1: Build the server image
FROM node:20.9.0-alpine3.18 AS base

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy all source files
COPY . .

# Expose default server port
EXPOSE 8000
ENV PORT=8000

# Default command: start the server
# Can be overridden at runtime with 'yarn data:import' for seeding
CMD ["npm", "start"]
