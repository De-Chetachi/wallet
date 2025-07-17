import {  Request, Response, NextFunction} from 'express';
import { AuthorizationError } from '../errors/authorization_error';

const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (!req.currentUser) {
        throw new AuthorizationError();
    }
    next();

}

export default requireAuth;