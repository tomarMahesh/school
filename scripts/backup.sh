#!/usr/bin/env bash
# Backs up the database and the uploaded photos into ./backups, keeping 14 days.
# Run from anywhere on the server:  ./scripts/backup.sh
# Schedule daily with cron:         0 2 * * * /home/ubuntu/school/scripts/backup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP=$(date +%F_%H%M)
OUT=backups
mkdir -p "$OUT"

ROOT_PW=$(grep -E '^MYSQL_ROOT_PASSWORD=' .env | cut -d= -f2-)

docker compose exec -T -e MYSQL_PWD="$ROOT_PW" db \
  mysqldump -uroot --single-transaction --routines school_portal \
  | gzip > "$OUT/db_$STAMP.sql.gz"

docker run --rm -v school_uploads:/data:ro -v "$PWD/$OUT":/out alpine \
  tar czf "/out/uploads_$STAMP.tgz" -C /data .

find "$OUT" -type f -mtime +14 -delete
echo "Backup written: $OUT/db_$STAMP.sql.gz and $OUT/uploads_$STAMP.tgz"
