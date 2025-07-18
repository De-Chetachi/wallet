import { Request, Response, NextFunction } from 'express';  
import axios from 'axios';
import { KarmaError } from '../errors/karma_error';

const karmaApiKey = process.env.KARMA_API_KEY;

const karma = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const identity = req.body.email;
    if (process.env.NODE_ENV === 'test') {
        console.log('Skipping karma check in test environment');
        next();
    } else {
        const karma = await axios.get(`https://adjutor.lendsqr.com/v2/verification/karma/${identity}`, {
        headers: {
            'Authorization': `Bearer ${karmaApiKey}` 
        }
});
        if (karma.status !== 200) {
            throw new KarmaError();
        }
        next();
    }
}

export default karma;