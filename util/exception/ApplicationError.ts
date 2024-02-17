export class ApplicationError extends Error {
  public constructor(message = "Internal Application Error") {
    super(message);
  }
}
