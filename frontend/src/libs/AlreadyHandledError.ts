/**
 * Error thrown to signal to parent functions that an error happened but has already been handled.
 *
 * @description
 * Being handled means that the error has been displayed to the user.
 */
export class AlreadyHandledError extends Error {
  constructor() {
    super('')
  }
}
