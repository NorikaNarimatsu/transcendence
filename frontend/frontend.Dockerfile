FROM node:20

WORKDIR /app

# Install build essentials
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first
COPY package*.json ./

# Install dependencies for Linux environment
RUN npm ci
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Start with host binding for container access
CMD ["npm", "run", "dev", "--", "--host"]