import { ErrorType } from '../domain/entities/errors'

export default class NoLogbookMessagesFoundError extends Error {
  name = 'NoLogbookMessagesFoundError'
  type = ErrorType.INFO_AND_HIDDEN
  showEmptyComponentFields = true

  constructor (message = '') {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoLogbookMessagesFoundError)
    }
    this.message = message
    this.date = new Date()
  }
}
