import { CustomError } from "./custom_error";

export class NotFoundError extends CustomError {
    statusCode = 404;

    constructor() {
        super('resource not found');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

    serializeErrors(): { message: string; field?: string; }[] {
        return [{ message: 'resource not found' }];
    }
}