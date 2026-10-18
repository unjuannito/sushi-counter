#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE="${PROJECT_ROOT}/data/database.sqlite"
BACKUP_DIR="${PROJECT_ROOT}/../config-backups/sushi"
BACKUP_DATE="$(date +%F)"
BACKUP_FILE="${BACKUP_DIR}/sushi_backup_${BACKUP_DATE}.sqlite"

mkdir -p "${BACKUP_DIR}"

if [[ ! -f "${DATABASE}" ]]; then
  echo "Database not found: ${DATABASE}" >&2
  exit 1
fi

if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "${DATABASE}" ".backup '${BACKUP_FILE}'"
else
  TEMP_BACKUP="/tmp/sushi_backup_${BACKUP_DATE}.sqlite"
  docker compose exec -T sushi-app node -e '
    const Database = require("./backend/node_modules/better-sqlite3");
    const source = new Database(process.env.DATABASE_URL, { readonly: true });
    source.backup(process.argv[1]).then(() => source.close()).catch((error) => {
      process.exit(1);
    });
  ' "${TEMP_BACKUP}"
  docker compose cp "sushi-app:${TEMP_BACKUP}" "${BACKUP_FILE}"
  docker compose exec -T sushi-app rm -f "${TEMP_BACKUP}"
fi
find "${BACKUP_DIR}" -type f -name 'sushi_backup_*.sqlite' -mtime +30 -delete

# Crontab (every night at 00:00):
# 0 0 * * * /var/home/jcanas/projects/sushi-counter/scripts/backup-sushi.sh >> /var/log/sushi-counter-backup.log 2>&1
