import  { NextFunction, Request, Response } from 'express';
import { CustomError } from '../errors/custom_error';


export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({ errors: err.serializeErrors() });
    } else {
        return res.status(400).json({
            errors: [{ message: err.message }]
        });
    }

    next();
}