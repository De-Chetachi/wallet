import { CustomError } from "./custom_error";

export class KarmaError extends CustomError {
    statusCode = 403;

    constructor() {
        super("settle your other debt");
        Object.setPrototypeOf(this, KarmaError.prototype);
    }

    serializeErrors(): { message: string; field?: string; }[] {
        return [{ message: "settle your other debt" }];
    }
}