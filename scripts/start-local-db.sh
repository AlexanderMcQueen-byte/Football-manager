#!/usr/bin/env bash
set -euo pipefail

export PGPORT="${PGPORT:-5433}"
export PGHOST="${PGHOST:-127.0.0.1}"
export PGDATA="${PGDATA:-$HOME/.local/football-manager-pg/data}"
export PGSOCKET_DIR="${PGSOCKET_DIR:-$HOME/.local/football-manager-pg/socket}"
export PGLOG="${PGLOG:-$HOME/.local/football-manager-pg/postgres.log}"

mkdir -p "$HOME/.local/football-manager-pg" "$PGSOCKET_DIR"

if [ -f "$PGDATA/postgresql.conf" ]; then
  echo "PostgreSQL data directory already exists at $PGDATA"
else
  echo "Initializing PostgreSQL in $PGDATA"
  /usr/lib/postgresql/17/bin/initdb -D "$PGDATA" -U postgres --auth=trust -A trust > /tmp/football-manager-pg-init.log 2>&1
fi

if pg_isready -h "$PGHOST" -p "$PGPORT" -U postgres >/dev/null 2>&1; then
  echo "PostgreSQL is already running on ${PGHOST}:${PGPORT}"
  exit 0
fi

/usr/lib/postgresql/17/bin/pg_ctl \
  -D "$PGDATA" \
  -l "$PGLOG" \
  -o "-p $PGPORT -h $PGHOST -k $PGSOCKET_DIR" \
  -w start

echo "PostgreSQL running on ${PGHOST}:${PGPORT}"
