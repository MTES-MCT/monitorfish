// OxLint has no bulk suppressions (ESLint's `eslint-suppressions.json`), so the type-aware pass
// gets the same ratchet here: the pre-existing backlog is recorded per file and per rule in
// oxlint-typed-baseline.json, any violation beyond it fails, and fixed violations must be pruned
// from it (`--prune`) so that the baseline only ever shrinks.
//
// Usage: node scripts/oxlint_typed_baseline.mjs [--prune | --suppress-all]
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const BASELINE_PATH = 'oxlint-typed-baseline.json'
const mode = process.argv[2]

const result = spawnSync(
  'oxlint',
  ['--type-aware', '--config=.oxlintrc.typed.json', '--format=json', 'src'],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, shell: process.platform === 'win32' }
)
if (result.error || !result.stdout) {
  console.error(result.error ?? result.stderr)
  process.exit(2)
}

const { diagnostics } = JSON.parse(result.stdout)
const crashes = diagnostics.filter(({ code }) => !code)
if (crashes.length > 0) {
  crashes.forEach(({ filename, message }) => console.error(`${filename}: ${message}`))
  process.exit(2)
}

const current = {}
diagnostics.forEach(({ code, filename }) => {
  current[filename] ??= {}
  current[filename][code] = (current[filename][code] ?? 0) + 1
})

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : {}

function writeBaseline(counts) {
  const sorted = Object.fromEntries(
    Object.keys(counts)
      .sort()
      .map(filename => [filename, Object.fromEntries(Object.entries(counts[filename]).sort())])
  )
  writeFileSync(BASELINE_PATH, `${JSON.stringify(sorted, null, 2)}\n`)
}

if (mode === '--suppress-all') {
  writeBaseline(current)
  process.exit(0)
}

const excess = []
const pruned = {}
let unpruned = 0
Object.entries(current).forEach(([filename, rules]) => {
  Object.entries(rules).forEach(([code, count]) => {
    const allowed = baseline[filename]?.[code] ?? 0
    if (count > allowed) {
      excess.push({ code, count, filename, allowed })
    }
  })
})
Object.entries(baseline).forEach(([filename, rules]) => {
  Object.entries(rules).forEach(([code, allowed]) => {
    const count = Math.min(current[filename]?.[code] ?? 0, allowed)
    unpruned += allowed - count
    if (count > 0) {
      pruned[filename] ??= {}
      pruned[filename][code] = count
    }
  })
})

if (excess.length > 0) {
  excess.forEach(({ allowed, code, count, filename }) => {
    console.error(`${filename}: ${code} ${count} violation(s), ${allowed} allowed by ${BASELINE_PATH}`)
    diagnostics
      .filter(diagnostic => diagnostic.filename === filename && diagnostic.code === code)
      .forEach(({ labels, message }) => console.error(`  ${labels[0]?.span.line}:${labels[0]?.span.column} ${message}`))
  })
  process.exit(1)
}

if (mode === '--prune') {
  writeBaseline(pruned)
  process.exit(0)
}

if (unpruned > 0) {
  console.error(
    `${unpruned} violation(s) recorded in ${BASELINE_PATH} no longer occur: run \`npm run test:lint:types:prune\` and commit the result.`
  )
  process.exit(1)
}
