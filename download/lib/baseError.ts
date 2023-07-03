class BaseError extends Error {
  readonly error: string; // error name
  readonly cause: string; // detailed error message or stack trace
  readonly isOperational: boolean; // if it's an operational error

  constructor(error: string, cause: string, isOperational: boolean = true) {
    super(cause);
    this.error = error;
    this.cause = cause;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default BaseError;
