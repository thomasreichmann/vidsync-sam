export class BaseError extends Error {
  public readonly error: string; // error name
  public readonly cause: string; // detailed error message or stack trace
  public readonly isOperational: boolean; // if it's an operational error

  constructor(error: string, cause: string, isOperational: boolean = true) {
    super(cause);
    this.error = error;
    this.cause = cause;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default BaseError;
