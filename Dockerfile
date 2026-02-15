FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ARG BUILD_DATABASE_URL=postgresql://invoicenest:invoicenest@localhost:5432/invoicenest
ARG BUILD_BETTER_AUTH_SECRET=buildtimeplaceholdersecretvalue1234567890
ARG BUILD_BETTER_AUTH_URL=http://localhost:3000
ARG BUILD_NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV DATABASE_URL=${BUILD_DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BUILD_BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BUILD_BETTER_AUTH_URL}
ENV NEXT_PUBLIC_APP_URL=${BUILD_NEXT_PUBLIC_APP_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
EXPOSE 3000
CMD ["sh", "-c", "node scripts/validate-env.mjs && node server.js"]

FROM node:22-alpine AS migrator
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json drizzle.config.ts ./
COPY scripts ./scripts
COPY src/lib/db ./src/lib/db
CMD ["sh", "-c", "node scripts/validate-env.mjs && npx drizzle-kit migrate"]
