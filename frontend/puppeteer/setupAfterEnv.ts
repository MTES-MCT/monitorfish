/**
 * These specs drive two real browsers against live back ends, so a step can lose a race that has
 * nothing to do with what is being asserted — the mission auto-save, for instance, sometimes flushes
 * a half-typed value and MonitorEnv rejects it with a `400`, which surfaces as a console error.
 *
 * Retrying the whole test re-runs its `beforeEach`, so each attempt starts from a fresh page.
 */
jest.retryTimes(2, { logErrorsBeforeRetry: true, waitBeforeRetry: 2000 })
