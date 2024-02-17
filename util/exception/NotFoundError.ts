export class NotFoundError extends Error {
  public constructor(message = "Not Found") {
    super(message);
  }
}
