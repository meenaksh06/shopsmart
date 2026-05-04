# Stage 1: Build the client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build the server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

# Install necessary runtime dependencies (like openssl for prisma)
RUN apk add --no-cache openssl wget

# Copy built frontend
COPY --from=client-builder /app/client/dist ./client/dist

# Copy server code
COPY --from=server-builder /app/server ./server
WORKDIR /app/server

# Install only production dependencies
RUN npm ci --omit=dev && npx prisma generate

# Use the pre-defined non-root 'node' user for security
USER node

# Healthcheck to verify service stability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5001/api/health || exit 1

EXPOSE 5001

CMD ["node", "src/index.js"]
