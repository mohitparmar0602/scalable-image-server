# Use a lightweight Node.js image
FROM node:22-slim
WORKDIR /app
# Install dependencies first for better caching
COPY package*.json ./
RUN npm install
# Copy the rest of the code
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]