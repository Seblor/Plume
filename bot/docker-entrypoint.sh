#!/bin/sh
set -e

# Validate required environment variables
if [ -z "$DISCORD_TOKEN" ]; then
  echo "ERROR: DISCORD_TOKEN environment variable is not set" >&2
  exit 1
fi
if [ -z "$LOGS_WEBHOOK" ]; then
  echo "ERROR: LOGS_WEBHOOK environment variable is not set" >&2
  exit 1
fi

# Ensure the logs directory exists (also created as VOLUME in the Dockerfile,
# but this guarantees it exists even when no external volume is mounted)
mkdir -p /app/bot/logs_prod

# If a bind-mount target for the DB file was created as a directory by Docker
# (which happens when the host path does not exist yet), remove it so that
# lowdb can create the file itself on first write.
if [ -d /app/bot/db-prod.json ]; then
  rmdir /app/bot/db-prod.json
fi


cd ../shared_types/
bun i typescript
bun install
bun run build
bun link

cd ../bot/

# Install / sync dependencies (fast no-op when lockfile is unchanged)
bun install

exec bun run src/app.ts
