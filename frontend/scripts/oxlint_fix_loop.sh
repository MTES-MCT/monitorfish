#!/bin/bash
set -euo pipefail

# OxLint's jsPlugins bridge (import-js/order, sort-keys-fix, etc.) runs the underlying ESLint plugin
# but only applies fixes in a single pass, unlike real ESLint's `--fix`, which loops internally until
# the file stops changing. Reordering several imports often needs more than one pass to fully converge
# (moving one import past another can reveal a new ordering violation further down), so a single
# `oxlint --fix` run can leave fixable `import-js(order)` violations behind. This wrapper reruns the
# fixer until a run stops changing the files (capped to guard against a genuine oxlint bug looping
# forever) and exits with that run's status, so remaining non-autofixable errors still fail the commit.
# A file with nothing fixable converges on the very first run.

max_passes=15
files=("$@")

checksum() {
  cksum "${files[@]}"
}

previous_checksum="$(checksum)"
for ((pass = 1; pass <= max_passes; pass += 1)); do
  set +e
  npx oxlint --config=.oxlintrc.json --fix "${files[@]}"
  status=$?
  set -e

  current_checksum="$(checksum)"
  if [[ "$current_checksum" == "$previous_checksum" ]]; then
    exit "$status"
  fi
  previous_checksum="$current_checksum"
done

exit "$status"
