

FROM node:22

# Set the working directory
WORKDIR /app

# Install build essentials
RUN apt-get update && \
    apt-get install -y python3 make g++ sqlite3 && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci
RUN npm install 

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 8443

# Start the backend server
CMD ["npm", "run", "dev"]   