FROM node:18-alpine

WORKDIR /app

# Copy package files first (for cache)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Railway will inject PORT automatically
EXPOSE 5000

# Start in production mode
CMD ["npm", "start"]
