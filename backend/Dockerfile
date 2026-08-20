# Production-ready Dockerfile for the backend service
FROM node:20-bullseye AS builder

WORKDIR /app

# Install dependencies for reproducible builds
COPY package*.json ./
RUN npm ci

# Copy source and Prisma schema, then generate Prisma client
COPY . .
RUN npx prisma generate

# Remove dev dependencies to shrink final image
RUN npm prune --production

FROM node:20-bullseye AS runtime
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "src/server.js"]