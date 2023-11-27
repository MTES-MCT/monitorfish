/**
 * Usage error thrown or returned for expected errors coming from a user action that's impossible to process.
 *
 * @example
 * - Attempting to delete a DB entity that has existing uncascaded relations with other entities.
 */
export class UsageError {
  constructor(
    /** User-friendly message explaining why the operation couldn't be processed. */
    public userMessage: string
  ) {}
}
