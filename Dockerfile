# Use Node.js 20 LTS image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy server source
COPY server ./server

# Expose Cloud Run port
EXPOSE 8080

# Start server
CMD ["node", "server/index.js"]
