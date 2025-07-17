import { CustomError } from './custom_error';   


export class AuthorizationError extends CustomError {
    statusCode = 401;
    constructor() {
        super('Not authorized');
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }

    serializeErrors(): { message: string; field?: string; }[] {
        return [{ message: 'unauthorized' }];
    }
}