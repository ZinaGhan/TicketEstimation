# Use Node.js for both frontend and backend
FROM node:16-alpine AS build

# Set the working directory to the project root
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies (assumes this handles server dependencies)
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the server's port
EXPOSE 4000

# Move into the server folder and start the server
WORKDIR /usr/src/app/server
CMD ["npm", "run", "start"]
