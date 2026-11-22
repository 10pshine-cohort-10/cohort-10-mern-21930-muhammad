export class AppError extends Error {
  public status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
