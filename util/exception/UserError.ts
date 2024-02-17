export class UserError extends Error {
  public constructor(message = "User Error") {
    super(message);
  }
}
