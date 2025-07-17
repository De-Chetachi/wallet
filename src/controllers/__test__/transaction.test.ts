import { TransactionController } from "../transaction";
import AccountController from "../account";
import UserController from "../user";
import dbClient from "../../knex";
import { Account } from "../../models/account";
import e from "express";


const mockRequest = (body: any, currentUser?: any) => {
    return {
        body,
        currentUser,
        params: {},
        session: {},
    } 
}

const mockResponse = () => {
    const res: any = {};

    res.status = (statusCode: number) => {
        res.statusCode = statusCode;            
        return res;
    }

    res.json = (data: any) => {
        res.body = data;
        return res;
    }

    return res;
}

const getUserId = async () => {
    let req: any;
    let res: any;
    req = mockRequest({});
    res = mockResponse();
    req.body = {
        name: 'John Doe',
        email: 'john@gmail.com',
        password: 'password',
    };
    await UserController.createUser(req, res);
    const userId = res.body.object.id;
    return userId;
}

const getUserId2 = async () => {
    let req: any;
    let res: any;
    req = mockRequest({});
    res = mockResponse();
    req.body = {
        name: 'John Mark',
        email: 'Mark@gmail.com',
        password: 'password',
    };
    await UserController.createUser(req, res);
    const userId = res.body.object.id;
    return userId;
}



const createAccount = async (userId: string) => {
    let req: any;
    let res: any;
    req = mockRequest({});
    res = mockResponse();
    req.currentUser = { id: userId };
    await AccountController.createAccount(req, res);
    const accountId = res.body.object.id;
    return accountId;
}


describe('test for the transaction controller', () => { 
    let req: any;
    let res: any;
    beforeAll( async () => {
        req = mockRequest({});
        res = mockResponse();   
    })

    beforeEach( async () => {
        req = mockRequest({});
        res = mockResponse();
    });

    describe('test for the getTransactions method', () => {
        //require auth, simulate a current user
        it('should return transactions for the current user', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            req.currentUser = { id: userId };
            await TransactionController.getTransactions(req, res);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('transactions retrieved');
            expect(res.body.object).toBeDefined();
            expect (res.body.object).toBeInstanceOf(Array);
            expect(res.body.object.length).toBe(0); // since no transaction has been created yet

        });

        it('throw not found error if no account is found for the user', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId };
            await expect(TransactionController.getTransactions(req, res)).rejects.toThrow('resource not found');
        });
    });

    describe('test for the getTransactionById method', () => {
        //require auth, simulate a current user
        it('should return a transaction by id', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            req.currentUser = { id: userId };
            req.body = {
                amount: 1000
            }
            await TransactionController.deposit(req, res);
            const transactionId = res.body.object.id;
            req.params = { id: transactionId };
            await TransactionController.getTransactionById(req, res);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('transaction retrieved');
            expect(res.body.object).toBeDefined();
            expect(res.body.object).toHaveProperty('id', transactionId);
            expect(res.body.object).toHaveProperty('type', 'DEPOSIT');

        });

        it('should throw not found error if transaction is not found', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId };
            req.params = { id: 'dfkgjnmv-fgjnkm=fgmk' }; // simulate a non-existent transaction id
            await expect(TransactionController.getTransactionById(req, res)).rejects.toThrow('resource not found');

        });
    });

    describe('test for the withdraw method', () => {
        //require auth, simulate a current user
        it('should withdraw an amount from the user account', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            // simulate a deposit to the account before withdrawal
            const acc = await Account.findById(accountId);
            const newacc = await acc!.deposit(2000);
            req.currentUser = { id: userId };
            req.body = {
                amount: 500
            }
            await TransactionController.withdraw(req, res);
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('withdrawal successful');
            expect(res.body.object).toHaveProperty('id');
            expect(res.body.object).toHaveProperty('type', 'WITHDRAWAL');
            expect(res.body.object).toHaveProperty('status', 'COMPLETED');

            //check if transaction is saved in the database
            const transaction = await dbClient('transactions').select('*').first();
            expect(transaction).toBeDefined();
            expect(transaction).toHaveProperty('type', 'WITHDRAWAL');
            expect(transaction).toHaveProperty('status', 'COMPLETED');

            //check if account balance is updated
            const updatedAccount = await Account.findById(accountId);
            expect(updatedAccount).toBeDefined();
            expect(updatedAccount!.balance).toBe(1500); // 2000 - 500
        });

        it('should throw not found error if no account is found for the user', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId };
            res.body = {
                amount: 1000
            }
            await expect(TransactionController.withdraw(req, res)).rejects.toThrow('resource not found');
        });

        it('should throw error if insufficient balance', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            req.currentUser = { id: userId };
            req.body = {
                amount: 1000
            }
            await expect(TransactionController.withdraw(req, res)).rejects.toThrow('Insufficient balance');
            //insufficient balance, since no deposit was made after account creation
        });

        it('should throw error if amount is less than or equal to zero', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            req.currentUser = { id: userId };
            req.body = {
                amount: -1000
            }
            await expect(TransactionController.withdraw(req, res)).rejects.toThrow('Amount must be greater than zero')  ;

        });
    });

    describe('test for the deposit method', () => {
        //require auth, simulate a current user
        it('should deposit an amount to the user account', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            req.currentUser = { id: userId };
            req.body = {
                amount: 1000
            }
            await TransactionController.deposit(req, res);
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('deposit successful');
            expect(res.body.object).toHaveProperty('id');
            expect(res.body.object).toHaveProperty('type', 'DEPOSIT');
            expect(res.body.object).toHaveProperty('status', 'COMPLETED');
            expect(res.body.object).toHaveProperty('amount', 1000);

            //check if transaction is saved in the database
            const transaction = await dbClient('transactions').select('*').first();
            expect(transaction).toBeDefined();
            expect(transaction).toHaveProperty('type', 'DEPOSIT');
            expect(transaction).toHaveProperty('status', 'COMPLETED');
            expect(transaction).toHaveProperty('amount', 1000);
            expect(transaction).toHaveProperty('id', res.body.object.id);

        });

        it('should throw not found error if no account is found for the user', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId };
            res.body = {
                amount: 1000
            }
            await expect(TransactionController.deposit(req, res)).rejects.toThrow('resource not found');
        });

        it('should throw error if amount is less than or equal to zero', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            req.currentUser = { id: userId };
            req.body = {
                amount: -1000
            }
            await expect(TransactionController.deposit(req, res)).rejects.toThrow('Amount must be greater than zero')  ;

        });
    });


    describe('test for the transfer method', () => {
        //require auth, simulate a current user
        it('should transfer an amount from one account to another', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            const acc = await Account.findById(accountId);
            await acc!.deposit(2000);
            const receiverUserId = await getUserId2();
            const receiverAccountId = await createAccount(receiverUserId);
            const receiverAcc = await Account.findById(receiverAccountId);
            req.currentUser = { id: userId };
            req.body = {
                amount: 500,
                receiver: receiverAcc!.account_number,
            }
            await TransactionController.transfer(req, res);
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('transfer successful');
            expect(res.body.object).toHaveProperty('id');
            expect(res.body.object).toHaveProperty('type', 'TRANSFER');
            expect(res.body.object).toHaveProperty('status', 'COMPLETED');
            expect(res.body.object).toHaveProperty('amount', 500);

            //check if transaction is saved in the database
            const transaction = await dbClient('transactions').select('*').first();
            expect(transaction).toBeDefined();
            expect(transaction).toHaveProperty('type', 'TRANSFER');
            expect(transaction).toHaveProperty('status', 'COMPLETED');
            expect(transaction).toHaveProperty('amount', 500);
            expect(transaction).toHaveProperty('id', res.body.object.id);

            //check if sender account balance is updated
            const senderAccount = await Account.findById(accountId);
            expect(senderAccount).toBeDefined();
            expect(senderAccount!.balance).toBe(1500);

            //check if receiver account balance is updated
            const receiverAccount = await Account.findById(receiverAccountId);
            expect(receiverAccount).toBeDefined();
            expect(receiverAccount!.balance).toBe(500);
        });

        it('should throw not found error if no account is found for the user', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId };
            res.body = {
                amount: 1000
            }
            await expect(TransactionController.transfer(req, res)).rejects.toThrow('resource not found');

        });

        it('should throw error if insufficient balance', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            const receiverUserId = await getUserId2();
            const receiverAccountId = await createAccount(receiverUserId);
            const receiverAcc = await Account.findById(receiverAccountId);
            req.currentUser = { id: userId };
            req.body = {
                amount: 500,
                receiver: receiverAcc!.account_number,
            }
            await expect(TransactionController.transfer(req, res)).rejects.toThrow('Insufficient balance');

        });

        it('should throw error if amount is less than or equal to zero', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            const acc = await Account.findById(accountId);
            await acc!.deposit(2000);
            const receiverUserId = await getUserId2();
            const receiverAccountId = await createAccount(receiverUserId);
            const receiverAcc = await Account.findById(receiverAccountId);
            req.currentUser = { id: userId };
            req.body = {
                amount: 0,
                receiver: receiverAcc!.account_number,
            }
            await expect(TransactionController.transfer(req, res)).rejects.toThrow('Amount must be greater than zero');
        });

        it('should throw error if recipient account is not found', async () => {
            const userId = await getUserId();
            const accountId = await createAccount(userId);
            const acc = await Account.findById(accountId);
            await acc!.deposit(2000);
            req.currentUser = { id: userId };
            req.body = {
                amount: 500,
                receiver: '009856756',//fake account number
            }
            await expect(TransactionController.transfer(req, res)).rejects.toThrow('resource not found');
        });
    });
})