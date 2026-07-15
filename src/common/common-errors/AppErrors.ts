

export class AppError extends Error {
  constructor(message: string, public readonly code: string) {

    super(message);

    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string) {

    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, "PERMISSION_DENIED");
    this.name = "PermissionError";
  }
}

export class NetworkError extends AppError {
  public readonly originalError?: unknown;
  constructor(message: string, originalError?: unknown) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";

    this.originalError = originalError;
  }
}

export class ServiceNotInitializedError extends AppError {
  constructor(serviceName: string) {
    super(
      `${serviceName} not initialized. Call ServiceProvider.set${serviceName}() first.`,
      "SERVICE_NOT_INITIALIZED"
    );
    this.name = "ServiceNotInitializedError";
  }
}
