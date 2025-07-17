import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/badrequest_error";
import { comparePassword } from "../utils/password";
import { User } from "../models/user";
import { getJWT } from "../utils/jwt";

class UserController {

    static async createUser(req: Request, res: Response) {
        if (req.currentUser) {
            throw new BadRequestError('already loggin in');
        }
        const { name, email, password } = req.body;

        const existingUser = await User.findOne(email);
        if (existingUser) {
            throw new BadRequestError('Email already in use');
        }

        const user = User.build({ name, email, password });
        await user.save();

        res.status(201).json({ message: 'User created successfully', object: user.toJSON() });
    }

    static async loginUser(req: Request, res: Response) {
        if (req.currentUser) {
            throw new BadRequestError('already loggin in');
        }
        const { email, password } = req.body;
        const user = await User.findOne(email);
        if (!user) throw new BadRequestError('invalid credentials');
        const isPassword = await comparePassword(password, user.password);
        if (!isPassword) throw new BadRequestError('invalid credentials');

        const token = getJWT(user);
        req.session = { token };
        res.status(200).json({ message: 'User logged in successfully', object: user.toJSON() });
    }
}

export default UserController;