#!/bin/bash

set -e
unset https_proxy
unset HTTPS_PROXY
source $HOME/.monitorfish
MPHR=60    # Minutes per hour.

echo `date`
echo "Checking if the update process is already running..."
echo "OK. No update in progress."
exit_message="ERROR"

STATUSCODE=$(curl --silent -o /dev/null --write-out "%{http_code}" https://monitorfish.din.developpement-durable.gouv.fr/api/v1/healthcheck)
echo $STATUSCODE
if [[ "$STATUSCODE" == *"40"* ]] || [[ "$STATUSCODE" == *"50"* ]]; then
    exit_code=0
    /bin/grep -Fxq "ERROR" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "Alarm message already sent"
        exit 0
    fi
    echo "Application is down"
    curl --proxy "http://172.27.229.197:8090" -X POST -H 'Content-type: application/json' --data '{"text":"😱 Oups, MonitorFish est DOWN."}' https://hooks.slack.com/services/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
    echo $exit_message > $MONITORFISH_LOGS_FOLDER/cron.lock
    exit 1
fi
echo "App is running."


JSON=$(curl --silent https://monitorfish.din.developpement-durable.gouv.fr/api/v1/healthcheck)
# We match the dateLastPositionReceivedByAPI by selecting the date after the 34th character
regex='^.{34}(.{20})'
NOW=$(date +%s);
echo $JSON
if [[ $JSON =~ $regex ]]; then
    date="${BASH_REMATCH[1]}"
    TARGET=$(date +%s -d${date})
    echo $date
    MINUTES=$(( ($NOW - $TARGET) / $MPHR ))
    echo $MINUTES
    if [ $MINUTES -gt 5 ]; then
	exit_code=0
        /bin/grep -Fxq "ERROR" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?
        if [ $exit_code -eq 0 ]; then
            echo "Alarm message already sent"
            exit 0
        fi
	echo "Positions plus à jour"
	curl --proxy "http://172.27.229.197:8090" -X POST -H 'Content-type: application/json' --data '{"text":"⚠️  Oups, nous ne recevons plus de positions depuis '"$MINUTES"' minutes. (dernière position le '"$(date -d${date})"')"}' https://hooks.slack.com/services/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
        echo $exit_message > $MONITORFISH_LOGS_FOLDER/cron.lock
	exit 1
    else
	exit_code=0
        /bin/grep -Fxq "ERROR" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?
        if [ $exit_code -eq 0 ]; then
	    curl --proxy "http://172.27.229.197:8090" -X POST -H 'Content-type: application/json' --data '{"text":"✅ La réception des positions est OK. (dernière position le '"$(date -d${date})"')"}' https://hooks.slack.com/services/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
            echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock
            exit 0
        fi
        echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock
    fi
fi

# We match the dateLastPositionUpdatedByPrefect by selecting the date after the 92th character
regex='^.{92}(.{20})'
NOW=$(date +%s);
echo $JSON
if [[ $JSON =~ $regex ]]; then
    date="${BASH_REMATCH[1]}"
    TARGET=$(date +%s -d${date})
    echo $date
    MINUTES=$(( ($NOW - $TARGET) / $MPHR ))
    echo $MINUTES
    if [ $MINUTES -gt 5 ]; then
	exit_code=0
        /bin/grep -Fxq "ERROR" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?
        if [ $exit_code -eq 0 ]; then
            echo "Alarm message already sent"
            exit 0
        fi
	echo "Flow Prefect des positions plus à jour"
	curl --proxy "http://172.27.229.197:8090" -X POST -H 'Content-type: application/json' --data '{"text":"⚠️  Oups, le flow Prefect ne met plus à jour les positions depuis '"$MINUTES"' minutes. (dernier run le '"$(date -d${date})"')"}' https://hooks.slack.com/services/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
        echo $exit_message > $MONITORFISH_LOGS_FOLDER/cron.lock
	exit 1
    else
	exit_code=0
        /bin/grep -Fxq "ERROR" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?
        if [ $exit_code -eq 0 ]; then
	    curl --proxy "http://172.27.229.197:8090" -X POST -H 'Content-type: application/json' --data '{"text":"✅ Le flow Prefect des positions est revenu à la normale. (dernier run le '"$(date -d${date})"')"}' https://hooks.slack.com/services/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
            echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock
            exit 0
        fi
        echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock
    fi
fi

# We match the dateLogbookMessageReceived by selecting the date after the 144th character
regex='^.{144}(.{20})'
NOW=$(date +%s);
echo $JSON
if [[ $JSON =~ $regex ]]; then
    date="${BASH_REMATCH[1]}"
    TARGET=$(date +%s -d${date})
    echo $date
    MINUTES=$(( ($NOW - $TARGET) / $MPHR ))
    echo $MINUTES
    if [ $MINUTES -gt 5 ]; then
	exit_code=0
        /bin/grep -Fxq "ERROR" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?
        if [ $exit_code -eq 0 ]; then
            echo "Alarm message already sent"
            exit 0
        fi
	echo "Plus de message JPE"
	curl --proxy "http://172.27.229.197:8090" -X POST -H 'Content-type: application/json' --data '{"text":"⚠️  Oups, nous ne recevons plus de message JPE depuis '"$MINUTES"' minutes. (dernier message le '"$(date -d${date})"')"}' https://hooks.slack.com/services/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
        echo $exit_message > $MONITORFISH_LOGS_FOLDER/cron.lock
	exit 1
    else
	exit_code=0
        /bin/grep -Fxq "ERROR" $MONITORFISH_LOGS_FOLDER/cron.lock || exit_code=$?
        if [ $exit_code -eq 0 ]; then
	    curl --proxy "http://172.27.229.197:8090" -X POST -H 'Content-type: application/json' --data '{"text":"✅ La réception des messages JPE est OK. (dernier message le '"$(date -d${date})"')"}' https://hooks.slack.com/services/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
            echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock
            exit 0
        fi
        echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock
    fi
fi

echo "" > $MONITORFISH_LOGS_FOLDER/cron.lock
