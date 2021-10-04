#!/bin/bash

set -e

source $HOME/.monitorfish

echo `date`
echo "Checking if the update process is already running..."
exit_code=0
/bin/grep -Fxq "End of update" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?

# Check if script is already running
if [ $exit_code -ne 0 ]; then
    echo "Update already in progress."
    exit 0
fi

echo "OK. No update in progress."
exit_message="End of update"

if test -z "$MONITORFISH_VERSION"
then
    echo "MONITORFISH_VERSION env variable is not set"
    echo $exit_message > $MONITORFISH_LOGS_FOLDER/cron.lock
    exit 1
else
    echo "MONITORFISH_VERSION=$MONITORFISH_VERSION"
fi


echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock

# Increment bugfixes version number
if [[ $MONITORFISH_VERSION =~ (v[0-9]+\.[0-9]+\.)([0-9]+)$ ]]; then
    prefix=${BASH_REMATCH[1]}
    number=$(( 10#${BASH_REMATCH[2]} + 1 ))
    new=${prefix}${number}
    MONITORFISH_VERSION_INCREMENT=$new
fi

echo "Trying to fetch version: $MONITORFISH_VERSION_INCREMENT"

# Pull new docker image
exit_code=0
docker pull ghcr.io/mtes-mct/monitorfish/monitorfish-app:$MONITORFISH_VERSION_INCREMENT || exit_code=$?

# Check if image exists
if [ $exit_code -ne 0 ]; then
    echo $exit_message > $MONITORFISH_LOGS_FOLDER/cron.lock
    exit 0
fi

echo "Restarting app with version: $MONITORFISH_VERSION_INCREMENT"

cd $MONITORFISH_GIT_FOLDER && make restart-remote-app-dev

echo "Replacing current app version ($MONITORFISH_VERSION) to $MONITORFISH_VERSION_INCREMENT in $HOME/.monitorfish"
sed -i "s/$MONITORFISH_VERSION/$MONITORFISH_VERSION_INCREMENT/" $HOME/.monitorfish

echo $exit_message > $MONITORFISH_LOGS_FOLDER/cron.lock
