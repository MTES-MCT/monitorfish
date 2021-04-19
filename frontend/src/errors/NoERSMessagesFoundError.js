import { errorType } from '../domain/entities/errors'

export default class NoERSMessagesFoundError extends Error {
  name = 'NoERSMessagesFoundError';
  type = errorType.INFO_AND_HIDDEN
  showEmptyComponentFields = true

  constructor(message = '') {
    super(message);

    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, NoERSMessagesFoundError);
    }
    this.message = message;
    this.date = new Date();
  }
}