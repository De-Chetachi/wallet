import { CustomError } from "./custom_error";
import { ValidationError as VE } from "express-validator"


export class ValidationError extends CustomError {
    statusCode = 400;

    constructor(public errors: VE[]) {
        super('validation error');
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    serializeErrors(): { message: string; field?: string; }[] {
        return this.errors.map(err => {
            if (err.type === "field") {
                return { message: err.msg, field: err.path };
            }
            return { message: err.msg };
        });
        
    }
}