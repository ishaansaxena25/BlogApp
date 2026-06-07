# ============================================
# BlogBubble Backend Dockerfile
# Multi-stage production build
# ============================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests for layer caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# --- Stage 2: Production ---
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production

# Install wget for health check (not included in alpine by default)
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Create upload directories and set ownership
RUN mkdir -p public/uploads public/profile \
    && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "index.js"]
