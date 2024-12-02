// errors/CustomErrors.ts

export class BaseError extends Error {
    public statusCode: number;
    public errors?: any;
  
    constructor(message: string, statusCode: number, errors?: any) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }

  export class BadRequestError extends BaseError {
    constructor(message: string, errors?: any) {
      super(message, 400, errors);
    }
  }
  
  export class ValidationError extends BaseError {
    constructor(message: string, errors?: any) {
      super(message, 400, errors);
    }
  }
  
  export class NotFoundError extends BaseError {
    constructor(message: string) {
      super(message, 404);
    }
  }
  
  export class UnauthorizedError extends BaseError {
    constructor(message: string) {
      super(message, 401);
    }
  }
  
  export class ForbiddenError extends BaseError {
    constructor(message: string) {
      super(message, 403);
    }
  }
  
  export class InternalServerError extends BaseError {
    constructor(message: string) {
      super(message, 500);
    }
  }
  