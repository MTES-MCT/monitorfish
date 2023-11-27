#!/bin/bash

MAX_RUNS=100
SPEC_FILE_PATH=$1
SUCCESS_COUNT=0

if [ -z "$SPEC_FILE_PATH" ]; then
  echo "Error: No spec file provided."
  echo "Usage: `npm run test:e2e:flaky <spec_file_path>`".
  exit 1
fi

if [ ! -f "$SPEC_FILE_PATH" ]; then
  echo "Error: Spec file does not exist at `${SPEC_FILE_PATH}`."
  echo "Usage: `npm run test:e2e:flaky <spec_file_path>`".
  exit 1
fi

COUNTER=0
while [ $COUNTER -lt $MAX_RUNS ]; do
  echo -e "\033[0;36m===================================================================================================="
  echo -e "[FLAKY SCRIPT] Running test attempt: $((COUNTER + 1))...\033[0m"
  if ./node_modules/.bin/cypress run --browser firefox --config-file ./config/cypress.config.ts -q --spec "${SPEC_FILE_PATH}"; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo -e "\033[0;36m[FLAKY SCRIPT] Test passed. Success count: $SUCCESS_COUNT"
    echo -e "====================================================================================================\033[0m"
  else
    echo -e "\033[0;31m[FLAKY SCRIPT] Test failed on attempt: $((COUNTER + 1))"
    echo -e "====================================================================================================\033[0m"
    exit 1
  fi

  COUNTER=$((COUNTER + 1))
done

echo -e "\033[0;32m===================================================================================================="
echo -e "[FLAKY SCRIPT] Test passed $SUCCESS_COUNT times out of $MAX_RUNS runs."
echo -e "====================================================================================================\033[0m"
