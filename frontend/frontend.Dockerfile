FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# Install deps
RUN npm install --omit=optional

COPY . .

EXPOSE 3000

CMD ["npm","run","dev"]
