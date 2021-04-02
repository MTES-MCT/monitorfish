export default class NoDEPFoundError extends Error {
  constructor(message = '') {
    super(message);

    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, NoDEPFoundError);
    }
    this.name = 'NoDEPFoundError';
    this.message = message;
    this.date = new Date();
  }
}