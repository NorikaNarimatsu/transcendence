FROM node:20-alpine

# Set the working directory
WORKDIR /app

RUN apk add --no-cache curl python3 make g++ sqlite openssl

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=optional

# Copy the rest of the application files
COPY . .

# creating self-signed certificates
# RUN mkdir -p /app/https
# RUN openssl req -x509 -newkey rsa:4096 -keyout /app/https/key.pem -out /app/https/cert.pem -days 365 -nodes -subj "/CN=localhost"

# Expose the backend port
EXPOSE 8443

# Start the backend server
CMD ["npm", "run", "dev"]   