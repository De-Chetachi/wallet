import UserController from "../user";
import dbClient from "../../knex";
import User from "../../models/user";


//mock a response and request object for the calls to the controller methods

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


describe('UserController', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = mockRequest({});
        res = mockResponse();
    });

    describe('createUser method', () => {
        it('should create a new user', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password',
            };
            await UserController.createUser(req, res);
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('User created successfully');
            expect(res.body.object).toHaveProperty('id');
            expect(res.body.object).toHaveProperty('name', 'John Doe');
            expect(res.body.object).toHaveProperty('email', 'john@gmail.com');

            //check if user is saved in the database
            const user = await dbClient(User.tableName).select('*').first();
            expect(user).toBeDefined();
            expect(user).toHaveProperty('email', 'john@gmail.com');
            expect(user).toHaveProperty('name', 'John Doe');
            expect(user).toHaveProperty('password');
            expect(user).toHaveProperty('id', res.body.object.id);
        });

        it ('should return error if user already exists', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password',
            };
            await UserController.createUser(req, res);
            expect(res.statusCode).toBe(201);
            res = mockResponse();
            await expect(UserController.createUser(req, res)).rejects.toThrow('Email already in use');
        });

        it('should throw error for a logged in user', async () => {
            // a logged in user should have a currentUser property set
            req.currentUser = {
                name: 'John Mark',
                email: 'Mark@gmail.com',
                password: 'password'
            }
            req.body = {
                id: 'mock id',
                email: 'Mark@gmail.com',
                password: 'password',
            };
            await expect(UserController.createUser(req, res)).rejects.toThrow('already loggin in');
        });
    });

    describe('loginUser method', () => {
        it('should log in a existing user and set session token', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password',
            };
            await UserController.createUser(req, res);
            expect(res.statusCode).toBe(201);
            res = mockResponse();
            req.body = {
                email: 'john@gmail.com',
                password: 'password',
            }
            await UserController.loginUser(req, res);
            expect(req.session.token).toBeDefined();
            expect(res.statusCode).toBe(200);
        });

        it('throw error for non-existent user', async () => {
            req.body = {
                email: 'john@gmail.com',
                password: 'password',
            }
            await expect(UserController.loginUser(req, res)).rejects.toThrow('invalid credentials');   
        });

        it('should throw error for invalid credentials', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password',
            }
            await UserController.createUser(req, res);
            expect(res.statusCode).toBe(201);

            res = mockResponse();
            req.body = {
                email: 'john@gmail.com',
                password: 'passworddy',
            }
            await expect(UserController.loginUser(req, res)).rejects.toThrow('invalid credentials');
        });

        it ('should throw error for a logged in user', async () => {
            // a logged in user should have a currentUser property set
            //mocked a logged in user by setting currentUser
            req.currentUser = {
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password',
            }
            req.body = {
                email: 'john@gmail.com',
                password: 'password',
            }

            await expect(UserController.loginUser(req, res)).rejects.toThrow('already loggin in');
        });

    });
});
