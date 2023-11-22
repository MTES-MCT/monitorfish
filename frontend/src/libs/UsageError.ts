/**
 * Usage error thrown or returned for expected errors coming from a user action that's impossible to process.
 *
 * @example
 * - Attempting to delete a DB entity that has existing uncascaded relations with other entities.
 */
export type UsageError = {
  name: 'UsageError'
  /** User-friendly message explaining why the operation couldn't be processed. */
  userMessage: string
}

/**
 * @param userMessage - User-friendly message explaining why the operation couldn't be processed.
 */
export function newUsageError(userMessage: string): UsageError {
  return {
    name: 'UsageError',
    userMessage
  }
}

export function isUsageError(error: any): error is UsageError {
  return error && error.name === 'UserError'
}
