# ── Build context: plume/ (one level above bot/) ─────────────────────────────
# Build with:  docker build -f bot/Dockerfile -t plume-bot .
# Or use:      docker compose up --build
# ─────────────────────────────────────────────────────────────────────────────
# Bun runs TypeScript natively — no compilation step required.
FROM oven/bun:1-alpine

# Mirror the repo layout so "file:../shared_types" in package.json resolves.
COPY shared_types/ /app/shared_types/

WORKDIR /app/bot
COPY bot/ ./
RUN bun install

RUN chmod +x docker-entrypoint.sh

# DISCORD_TOKEN and LOGS_WEBHOOK must be supplied at runtime (e.g. via .env)
ENV NODE_ENV=production

# Declare the logs directory as a volume so it survives container restarts
VOLUME ["/app/bot/logs_prod"]

ENTRYPOINT ["./docker-entrypoint.sh"]
