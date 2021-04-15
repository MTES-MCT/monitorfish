export default class NoPositionsFoundError extends Error {
  name = 'NoPositionsFoundError';

  constructor(message = '') {
    super(message);

    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, NoPositionsFoundError);
    }
    this.message = message;
    this.date = new Date();
  }
}