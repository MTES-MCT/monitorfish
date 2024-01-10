import { ErrorType } from '../domain/entities/errors'

export default class NoControlsFoundError extends Error {
  name = 'NoControlsFoundError'
  type = ErrorType.INFO_AND_HIDDEN
  showEmptyComponentFields = true

  constructor(message = '') {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoControlsFoundError)
    }
    this.message = message
    this.date = new Date()
  }
}
