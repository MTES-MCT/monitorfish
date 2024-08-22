#!/bin/bash

while true; do
    echo "Listing Git dirty .kt files..."
    GIT_CHANGED_KT_FILES=$(git status --porcelain | grep '\.kt$' | awk '{print $2}')
    GIT_UNTRACKED_KT_FILES=$(git ls-files --others --exclude-standard | grep '\.kt$')
    GIT_DIRTY_KT_FILES=$(echo -e "$GIT_CHANGED_KT_FILES\n$GIT_UNTRACKED_KT_FILES" | grep '\.kt$')

    if [ ! -z "$GIT_DIRTY_KT_FILES" ]; then
        echo "Found Git dirty .kt files: $GIT_DIRTY_KT_FILES"

        TEST_COMMAND_ARGS=""
        for FILE in $GIT_DIRTY_KT_FILES; do
            # Filter for files ending with UTests.kt or ITests.kt
            if [[ $FILE =~ (UTests|ITests)\.kt$ ]]; then
                # Extract test pathed class name
                TEST_CLASS=$(echo $FILE | sed -e 's#backend/src/test/kotlin/##' -e 's#/#.#g' -e 's/.kt$//')
                TEST_COMMAND_ARGS="$TEST_COMMAND_ARGS --tests $TEST_CLASS"
            fi
        done

        if [ ! -z "$TEST_COMMAND_ARGS" ]; then
            echo "Running tests for: $TEST_COMMAND_ARGS..."
            (cd backend && ./gradlew test --console plain --parallel $TEST_COMMAND_ARGS)
        else
            echo "No matching test files (UTests or ITests) found to run."
        fi
    else
        echo "No Git dirty .kt file detected."
    fi

    echo "Watching for .kt file changes..."
    inotifywait -e create -e modify -e move -e delete -r backend/src/main/kotlin backend/src/test/kotlin || echo "No files specified to watch!"
done
