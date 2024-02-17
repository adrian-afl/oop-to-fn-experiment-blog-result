export class NotAuthenticatedError extends Error {
  public constructor(message = "Not Authenticated") {
    super(message);
  }
}
