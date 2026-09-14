# syntax=docker/dockerfile:1

FROM node:20-alpine

# curl is required for Coolify's container healthcheck (GET / against localhost)
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Ensure the data directory exists and is owned by a non-root user.
# Coolify should mount a persistent volume at /app/data (see README.md).
RUN mkdir -p /app/data \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup \
  && chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
ENV PORT=3000
ENV LEADS_DB_PATH=/app/data/leads.db

EXPOSE 3000

CMD ["node", "server.js"]
