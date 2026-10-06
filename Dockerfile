FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
# The build never connects to a database; this value only satisfies the Prisma config.
ENV DATABASE_URL="mysql://build:build@127.0.0.1:3306/build" \
    NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npx next build

FROM base AS run
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=512
COPY --from=build /app ./
RUN mkdir -p /data/uploads && chown -R node:node /data /app/.next
USER node
EXPOSE 3000
# Apply any new database migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p 3000"]
