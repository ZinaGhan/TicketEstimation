# Use Node.js for both frontend and backend
FROM node:16-alpine AS build

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies for server only
COPY ./server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy server code
COPY ./server /app/server

# Expose necessary ports for server (e.g., 4000 for API)
EXPOSE 4000

# Start the server (Node.js backend)
WORKDIR /app/server
CMD ["npm", "run", "start"]
