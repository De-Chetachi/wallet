import jwt from 'jsonwebtoken';
import User from '../models/user';

export const getJWT = (user: User): string => {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn:  3 * 24 * 60 * 60,
    });
}
