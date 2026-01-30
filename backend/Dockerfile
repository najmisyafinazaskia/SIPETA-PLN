FROM node:18-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (must match your server.js port)
EXPOSE 5000

# Start command (using dev for hot-reload with nodemon)
CMD ["npm", "run", "dev"]
