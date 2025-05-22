# Stage 1: Dependency Installation
# This stage installs only production dependencies for a smaller layer if needed later,
# or can be merged into the builder stage if devDependencies are small or managed well.
# For Next.js, devDependencies are often needed for the build, so we'll do a full install in builder.
FROM node:20-bookworm-slim AS dependencies

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies (optional optimization, builder will do full install)
# RUN pnpm install --frozen-lockfile --prod

# Stage 2: Builder Stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
# This includes src/, public/, next.config.ts, tsconfig.json, components.json etc.
# .dockerignore should prevent node_modules, .git, .next, etc. from being copied.
COPY . .

# Run the build script (this will generate .next/standalone)
RUN pnpm run build

# Stage 3: Final Runner Stage (Standalone Output)
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
# NEXT_TELEMETRY_DISABLED is optional, set to 1 to disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output from the builder stage
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

# Set the user
USER nextjs

EXPOSE 3000

# Command to run the Next.js server from the standalone output
CMD ["node", "server.js"]
