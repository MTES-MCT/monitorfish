import { errorType } from '../domain/entities/errors'

export default class NoPositionsFoundError extends Error {
  name = 'NoPositionsFoundError'
  type = errorType.INFO
  showEmptyComponentFields = true

  constructor(message = '') {
    super(message);

    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, NoPositionsFoundError)
    }
    this.message = message
    this.date = new Date()
  }
}