import { Request, Response } from 'express';
import { Account } from '../models/account';


class AccountController {
    static async getAccount(req: Request, res: Response) {
        const userId = req.currentUser!.id; 
        const account = await Account.findByUser(userId);
        if (!account) {
            return res.status(200).json({ message: 'No account found for this user', object: {} });
        }
        res.status(200).json({ message: 'Account fetched successfully', object: account });
    }


    static async createAccount(req: Request, res: Response) {
        const user = req.currentUser!.id;
        const account = Account.build({ user });
        await account.save();
        res.status(201).json({ message: 'Account created successfully', object: account });
    }

}

export default AccountController;