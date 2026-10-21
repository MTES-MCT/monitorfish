// OxLint has no bulk suppressions (ESLint's `eslint-suppressions.json`), so the type-aware pass
// gets the same ratchet here: the pre-existing backlog is recorded per file and per rule in
// oxlint-typed-baseline.json, any violation beyond it fails, and fixed violations must be pruned
// from it (`--prune`) so that the baseline only ever shrinks.
//
// Usage: node scripts/oxlint_typed_baseline.mjs [--prune | --suppress-all]
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const BASELINE_PATH = 'oxlint-typed-baseline.json'

function lint() {
  const { stderr, stdout } = spawnSync(
    'oxlint',
    ['--type-aware', '--config=.oxlintrc.typed.json', '--format=json', 'src'],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
  )

  try {
    return JSON.parse(stdout).diagnostics
  } catch {
    // OxLint exits with 1 both on violations and on a broken run (e.g. an invalid config),
    // only the former prints a JSON report
    console.error(stdout, stderr)
    process.exit(2)
  }
}

function countByFileAndRule(diagnostics) {
  const counts = {}
  diagnostics.forEach(({ code, filename }) => {
    counts[filename] ??= {}
    counts[filename][code] = (counts[filename][code] ?? 0) + 1
  })

  return counts
}

function findExceeding(counts, baseline) {
  return Object.entries(counts).flatMap(([filename, rules]) =>
    Object.entries(rules)
      .map(([code, count]) => ({ allowed: baseline[filename]?.[code] ?? 0, code, count, filename }))
      .filter(({ allowed, count }) => count > allowed)
  )
}

function prune(baseline, counts) {
  const pruned = {}
  Object.entries(baseline).forEach(([filename, rules]) => {
    Object.entries(rules).forEach(([code, allowed]) => {
      const count = Math.min(counts[filename]?.[code] ?? 0, allowed)
      if (count > 0) {
        pruned[filename] ??= {}
        pruned[filename][code] = count
      }
    })
  })

  return pruned
}

function sumCounts(counts) {
  return Object.values(counts).reduce(
    (total, rules) => total + Object.values(rules).reduce((sum, count) => sum + count, 0),
    0
  )
}

function writeBaseline(counts) {
  const sorted = Object.fromEntries(
    Object.keys(counts)
      .sort()
      .map(filename => [filename, Object.fromEntries(Object.entries(counts[filename]).sort())])
  )
  writeFileSync(BASELINE_PATH, `${JSON.stringify(sorted, null, 2)}\n`)
}

const mode = process.argv[2]
const diagnostics = lint()
const counts = countByFileAndRule(diagnostics)

if (mode === '--suppress-all') {
  writeBaseline(counts)
  process.exit(0)
}

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : {}
const exceeding = findExceeding(counts, baseline)
if (exceeding.length > 0) {
  exceeding.forEach(({ allowed, code, count, filename }) => {
    console.error(`${filename}: ${code} ${count} violation(s), ${allowed} allowed by ${BASELINE_PATH}`)
    diagnostics
      .filter(diagnostic => diagnostic.filename === filename && diagnostic.code === code)
      .forEach(({ labels, message }) => console.error(`  ${labels[0]?.span.line}:${labels[0]?.span.column} ${message}`))
  })
  process.exit(1)
}

const pruned = prune(baseline, counts)
if (mode === '--prune') {
  writeBaseline(pruned)
  process.exit(0)
}

const fixedCount = sumCounts(baseline) - sumCounts(pruned)
if (fixedCount > 0) {
  console.error(
    `${fixedCount} violation(s) recorded in ${BASELINE_PATH} no longer occur: run \`npm run test:lint:types:prune\` and commit the result.`
  )
  process.exit(1)
}
