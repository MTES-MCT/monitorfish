#!/bin/bash

###########################
####### LOAD CONFIG #######
###########################

while [ $# -gt 0 ]; do
    case $1 in
        -c)
            CONFIG_FILE_PATH="$2"
            shift 2
            ;;
        -t)
            RESTORE_TAG="$2"
            shift 2
            ;;
        *)
            echo "Unknown Option \"$1\"" 1>&2
            exit 2
            ;;
    esac
done

if [ -z "$CONFIG_FILE_PATH" ]; then
    SCRIPTPATH=$(cd ${0%/*} && pwd -P)
    CONFIG_FILE_PATH="${SCRIPTPATH}/pg_backup.config"
fi

if [ ! -r "${CONFIG_FILE_PATH}" ]; then
    echo "Could not load config file from ${CONFIG_FILE_PATH}" 1>&2
    exit 1
fi

echo "Loading config from ${CONFIG_FILE_PATH}..."
source "${CONFIG_FILE_PATH}"

if [ -z "$RESTORE_TAG" ]; then
    echo "Restore tag not specified. Use -t YYYY-MM-DD-suffix" 1>&2
    exit 1
fi

RESTORE_DIR=$BACKUP_DIR$RESTORE_TAG

if [ ! -d "$RESTORE_DIR" ]; then
    echo "Backup directory does not exist: $RESTORE_DIR" 1>&2
    exit 1
fi

###########################
### PRE-RESTORE CHECKS ####
###########################

# Make sure we're running as the required backup user
if [ "$BACKUP_USER" != "" -a "$(id -un)" != "$BACKUP_USER" ]; then
	echo "This script must be run as $BACKUP_USER. Exiting." 1>&2
	exit 1
fi

###########################
##### RESTORE BACKUPS #####
###########################

function restore_databases() {
    echo "Starting restore from backups in $RESTORE_DIR"

    ###############################
    ### RESTORE GLOBALS BACKUPS ###
    ###############################

    GLOBALS_BACKUP="$RESTORE_DIR/globals.sql.gz"

    if [ -f "$GLOBALS_BACKUP" ]; then
        echo "Restoring globals from $GLOBALS_BACKUP"
        if ! gunzip -c "$GLOBALS_BACKUP" | docker exec -i monitorfish_database sh -c "psql -h $HOSTNAME -U $USERNAME"; then
            echo "Failed to restore globals"
            exit 1
        fi
    else
        echo "No globals backup file found"
    fi

    #################################
    ##### RESTORE FULL BACKUPS ######
    #################################

    for BACKUP_FILE in $RESTORE_DIR/*.custom; do
        DATABASE_NAME=$(basename "$BACKUP_FILE" .custom)

        echo "Restoring $DATABASE_NAME from $BACKUP_FILE"

        if ! docker exec -i monitorfish_database sh -c "pg_restore -v -d $DATABASE_NAME -h $HOSTNAME -U $USERNAME" < "$BACKUP_FILE"; then
            echo "Failed to restore database $DATABASE_NAME"
            exit 1
        fi

    done

    echo "Database restoration complete!"
}

restore_databases

