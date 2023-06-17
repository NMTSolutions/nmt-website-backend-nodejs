export default class NodeError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message = "Internal Server Error",
    statusCode = 500,
    code = "Error",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
