import { errorType } from '../domain/entities/errors'

export default class NoDEPFoundError extends Error {
  name = 'NoDEPFoundError'
  type = errorType.INFO
  showEmptyComponentFields = true

  constructor (message = '') {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoDEPFoundError)
    }
    this.message = message
    this.date = new Date()
  }
}
