# Multi-Stage Production Dockerfile for DevSync
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client packages
COPY package.json ./
COPY client/package.json ./client/
RUN npm --prefix client install

# Build client React application
COPY client/ ./client/
RUN npm --prefix client run build

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install build tools & compilers (Python3, GCC, G++, OpenJDK) for code execution sandboxes
RUN apk add --no-cache python3 py3-pip gcc g++ openjdk17-jre make

ENV NODE_ENV=production
ENV PORT=5000

# Copy server package dependencies
COPY server/package.json ./server/
RUN npm --prefix server install --omit=dev

# Copy server source code and built client
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/index.js"]
