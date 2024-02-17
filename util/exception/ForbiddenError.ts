export class ForbiddenError extends Error {
  public constructor(message = "Access denied") {
    super(message);
  }
}
