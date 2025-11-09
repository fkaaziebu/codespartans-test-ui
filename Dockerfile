# Stage 1: Dependency Installation
FROM node:20-alpine AS base
# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install --force

# Stage 2: Build Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_PUBLIC_API_BASE_URL_AUTH=http://ec2-3-76-36-58.eu-central-1.compute.amazonaws.com:3000/v1
ENV NEXT_PUBLIC_API_BASE_URL_INVENTORY=http://ec2-3-76-36-58.eu-central-1.compute.amazonaws.com:3001/v1
ENV NEXT_PUBLIC_API_BASE_URL_SIMULATION=http://ec2-3-76-36-58.eu-central-1.compute.amazonaws.com:3002/v1
ENV NEXT_PUBLIC_API_BASE_URL_UPLOAD=http://ec2-3-76-36-58.eu-central-1.compute.amazonaws.com:3003/v1
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Add a non-root user for security
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set correct permissions
RUN chmod -R a-w+x . && chmod -R a+x .next
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
