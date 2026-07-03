#!/bin/bash
set -euo pipefail

# OxLint's jsPlugins bridge (import-js/order, sort-keys-fix, etc.) runs the underlying ESLint plugin
# but only applies fixes in a single pass, unlike real ESLint's `--fix`, which loops internally until
# the file stops changing. Reordering several imports often needs more than one pass to fully converge
# (moving one import past another can reveal a new ordering violation further down), so a single
# `oxlint --fix` run can leave fixable `import-js(order)` violations behind. This wrapper reruns the
# fixer until the staged files stop changing (capped to guard against a genuine oxlint bug looping
# forever), then does one last run so the exit code still reflects any remaining, non-autofixable errors.

max_passes=15
files=("$@")

checksum() {
  cksum "${files[@]}"
}

previous_checksum=""
for ((pass = 1; pass <= max_passes; pass += 1)); do
  set +e
  npx oxlint --config=.oxlintrc.json --fix "${files[@]}"
  set -e

  current_checksum="$(checksum)"
  if [[ "$current_checksum" == "$previous_checksum" ]]; then
    break
  fi
  previous_checksum="$current_checksum"
done

npx oxlint --config=.oxlintrc.json --fix "${files[@]}"
