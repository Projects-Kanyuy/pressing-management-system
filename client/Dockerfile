# Stage 1: Install dependencies and build the app
FROM node:20.9.0-alpine3.18 AS builder

# Set working directory
WORKDIR /app

# Copy package manager files to install dependencies
COPY package.json yarn.lock ./ 

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all source files
COPY . .

# Build the client app
RUN yarn build

# Stage 2: Prepare the production image
FROM node:20.9.0-alpine3.18 AS runner

# Set working directory
WORKDIR /app

# Copy only the built application and node_modules from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# Expose port 3000 for the app
EXPOSE 3000
ENV PORT=3000

# Start the app in production mode
CMD ["yarn", "serve"]
