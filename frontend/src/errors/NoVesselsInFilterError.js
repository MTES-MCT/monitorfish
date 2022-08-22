import { ErrorType } from '../domain/entities/errors'

export default class NoVesselsInFilterError extends Error {
  name = 'NoVesselsInFilterError'
  type = ErrorType.INFO
  showEmptyComponentFields = true

  constructor (message = '') {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoVesselsInFilterError)
    }
    this.message = message
    this.date = new Date()
  }
}
