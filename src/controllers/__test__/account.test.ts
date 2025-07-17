import AccountController from "../account";
import UserController from "../user";
import { Account } from "../../models/account";
import dbClient from "../../knex";

//both methods require auth
//mock a req.currentUser object for this test
//get an actual user id from the database 


const mockRequest = (body: any, currentUser?: any) => {
    return {
        body,
        currentUser,
        session: {}
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


describe('test for account controller', () => {
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
    describe('createAccount method', () => {
        it('should create a new account for the user', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId }; // Mock currentUser with the userId
            await AccountController.createAccount(req, res);
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Account created successfully');
            expect(res.body.object).toHaveProperty('id');
            expect(res.body.object).toHaveProperty('user', userId);

            //check if account is saved in the database
            const account = await dbClient(Account.tableName).select('*').first();
            expect(account).toBeDefined();
            expect(account).toHaveProperty('user', userId);
        });
    });

    describe('getAccount method', () => {
        it('should return account details for the current user', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId }
            await AccountController.createAccount(req, res);
            const acc = res.body.object;
            res = mockResponse(); 
            await AccountController.getAccount(req, res);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Account fetched successfully');
            expect(res.body.object).toHaveProperty('id', acc.id);
            expect(res.body.object).toHaveProperty('user', userId);
            expect(res.body.object).toHaveProperty('account_number', acc.account_number);
            expect(res.body.object).toHaveProperty('balance', acc.balance);

        });

        it ('should return a message if no account is found for the user', async () => {
            const userId = await getUserId();
            req.currentUser = { id: userId }
            await AccountController.getAccount(req, res);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('No account found for this user');
            expect(res.body.object).toEqual({});
        });

    });
})