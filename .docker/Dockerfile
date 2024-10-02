# Use Node.js for both frontend and backend
FROM node:16-alpine AS build

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json from the root and install dependencies
COPY ./package*.json ./

# Install global dependencies (for both frontend and backend if needed)
RUN npm install

# Copy the entire project, including both frontend and backend
COPY . .

# Expose necessary ports for server (e.g., 4000 for API)
EXPOSE 4000

# Start the server (Node.js backend)
WORKDIR /app/server
CMD ["npm", "run", "start"]
