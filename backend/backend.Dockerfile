

FROM node:20-alpine

# Set the working directory
WORKDIR /app

RUN apk add --no-cache curl python3 make g++ sqlite

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --omit=optional

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 8443

# Start the backend server
CMD ["node", "src/server.js"]