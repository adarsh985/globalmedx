# Disaster Recovery Guide

This guide details database backup strategies, data restore workflows, and failover disaster scenarios.

---

## 1. Backup Strategy & Scripts
We recommend daily binary backups using `mongodump` stored in an isolated persistent volume or AWS S3.

### Automated Backup Script
Create a file `backup.sh` to run as a cron job:
```bash
#!/bin/bash
# MongoDB backup configuration

DB_NAME="globalmedx"
BACKUP_DIR="/var/backups/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${DB_NAME}_backup_${TIMESTAMP}"

# Create directories
mkdir -p "${BACKUP_DIR}"

echo "Starting MongoDB backup for ${DB_NAME}..."
# In Docker compose, execute inside the mongodb container
docker exec globalmedx-mongodb mongodump --db ${DB_NAME} --out /data/db/backup_${TIMESTAMP}

# Move backup folder from host mount
mv ../database/backup_${TIMESTAMP} "${BACKUP_DIR}/${BACKUP_NAME}"

echo "Backup completed successfully: ${BACKUP_DIR}/${BACKUP_NAME}"
```

---

## 2. Restore Procedures & Scripts

In the event of database corruption or node failures:

### Automated Restore Script
Create a file `restore.sh` to execute manual restores:
```bash
#!/bin/bash
# MongoDB restore configuration

BACKUP_FOLDER=$1
DB_NAME="globalmedx"

if [ -z "$BACKUP_FOLDER" ]; then
  echo "Usage: ./restore.sh <path_to_backup_folder>"
  exit 1
fi

echo "Restoring database from: ${BACKUP_FOLDER}..."

# Copy backup data back to DB folder mount
cp -r "${BACKUP_FOLDER}" ../database/restore_temp

# Execute restoration inside container
docker exec globalmedx-mongodb mongorestore --db ${DB_NAME} /data/db/restore_temp/${DB_NAME}

# Clean temporary folder
rm -rf ../database/restore_temp

echo "Database restoration completed successfully."
```

---

## 3. Failover Playbook

In the event of primary database cluster failures:

1. **EKS Stateful Pod Failures:**
   Kubernetes automatically restarts pods scheduled on healthy physical nodes. Verify status:
   ```bash
   kubectl get pods -l app=mongodb -n globalmedx
   ```
2. **Data Recovery Protocol:**
   If persistent volume storage fails, spin up a new storage resource and apply the restore script:
   ```bash
   ./restore.sh /var/backups/mongodb/globalmedx_backup_latest
   ```
