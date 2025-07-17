import request from 'supertest';
import app from '../../app';

//integration test for transaction routes

//auth for second user
const createAuth = async () => {
  await request(app)
    .post('/api/wallet/users/')
    .send({
        name: 'John Mark',
        email: 'mark@gmail.com',
        password: 'password'
    })
    .expect(201);

  const loginResponse = await request(app)
    .post('/api/wallet/users/login')
    .send({
        email: 'mark@gmail.com',
        password: 'password'
    })
    .expect(200);
  const cookie = loginResponse.get('Set-Cookie');
  if (!cookie) {
    throw new Error('cookie not set');
  }
  return cookie;
}

const createAccount = async (cookie: string[]) => {
    const res = await request(app)
        .post('/api/wallet/accounts')
        .set('Cookie', cookie)
        .expect(201);
    return { id: res.body.object.id, accountNumber: res.body.object.account_number };
}



describe('test for the Transaction router', () => {

    describe('test get /api/wallet/transactions', () => {
        it('should return 200 and the transactions', async () => {
            const cookie = await global.getAuthCookie();
             //create an account first
            const accountId = (await createAccount(cookie)).id;

            //get transactions, should be an empty array initially
            const accountsEmpty = await request(app)
                .get('/api/wallet/transactions')
                .set('Cookie', cookie)
                .expect(200);
            expect(accountsEmpty.body.message).toBe('transactions retrieved');
            expect(accountsEmpty.body.object).toBeInstanceOf(Array);
            expect(accountsEmpty.body.object.length).toBe(0);
            //make a transaction transaction creation
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ amount: 100 })
                .expect(201);
            //get transactions again, should now contain the transaction
            const response = await request(app)
                .get('/api/wallet/transactions')
                .set('Cookie', cookie)
                .expect(200);
            expect(response.body.object.length).toBe(1);
            expect(response.body.object[0]).toHaveProperty('id');
            expect(response.body.object[0]).toHaveProperty('amount', 100);
            expect(response.body.object[0]).toHaveProperty('type', 'DEPOSIT');
            expect(response.body.message).toBe('transactions retrieved');
            expect(response.body.object).toBeInstanceOf(Array);
        });

        it('should return 401 if user is not authenticated', async () => {
            await request(app)
                .get('/api/wallet/transactions')
                .expect(401);
        });
    })


    describe('test get /api/wallet/transactions/:id', () => {
        it('should return 200 and the transaction by id', async () => {
            const cookie = await global.getAuthCookie();
            //create an account 
            const accountId = (await createAccount(cookie)).id;
            //create a transaction
            const deposit = await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ amount: 100 })
                .expect(201);
            const transactionId = deposit.body.object.id;
            const response = await request(app)
                .get(`/api/wallet/transactions/${transactionId}`)
                .set('Cookie', cookie)
                .expect(200);
            //simulate account creation
            //simulate transaction creation
            expect(response.body.message).toBe('transaction retrieved');
            expect(response.body.object).toHaveProperty('id');
        });

        it('should return 404 if transaction not found', async () => {
            const cookie = await global.getAuthCookie();
            //create an account
            const accountId = (await createAccount(cookie)).id;
            await request(app)
                .get('/api/wallet/transactions/999')
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should return 401 if user is not authenticated', async () => {
            await request(app)
                .get('/api/wallet/transactions/1')
                .expect(401);
        });
    }); 

    describe('test /api/wallet/transactions/withdraw', () => { 

        it ('should fail for unauthorised user user 401', async () => {
            await request(app)
                .post('/api/wallet/transactions/withdraw')
                .send({ amount: 100 })
                .expect(401);
        });

        it ('should fail for user without account account 404', async () => {
            const cookie = await global.getAuthCookie();
            await request(app)
                .post('/api/wallet/transactions/withdraw')
                .set('Cookie', cookie)
                .send({ amount: 100 })
                .expect(404);
        });

        it ('should fail for insufficient balance 400', async () => {
            const cookie = await global.getAuthCookie();
            //create an account first
            const accountId = (await createAccount(cookie)).id;
            await request(app)
                .post('/api/wallet/transactions/withdraw')
                .set('Cookie', cookie)
                .send({ amount: 100 })
                .expect(400);
        });

        it('should return 400 if amount is not provided or is not positive', async () => {
            const cookie = await global.getAuthCookie();
            //create an account first
            const accountId = (await createAccount(cookie)).id;
            await request(app)
                .post('/api/wallet/transactions/withdraw')
                .set('Cookie', cookie)
                .send({ })
                .expect(400);
        });

        it('should return 400 if amount is not positive', async () => {
            const cookie = await global.getAuthCookie();
            //create an account first
            const accountId = (await createAccount(cookie)).id;
            await request(app)
                .post('/api/wallet/transactions/withdraw')
                .set('Cookie', cookie)
                .send({ amount: -100 })
                .expect(400);
        }); 

        it('should return 201 and withdraw the amount', async () => {
            const cookie = await global.getAuthCookie();
            //create an account first
            const accountId = (await createAccount(cookie)).id;
            //deposit some amount to the account
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ amount: 200 })
                .expect(201);
            //now withdraw
            const response = await request(app)
                .post('/api/wallet/transactions/withdraw')
                .set('Cookie', cookie)
                .send({ amount: 100 })
                .expect(201);
            expect(response.body.message).toBe('withdrawal successful');
            expect(response.body.object).toHaveProperty('id');
            expect(response.body.object.amount).toBe(100);
            expect(response.body.object.type).toBe('WITHDRAWAL');

        });

    });

    describe('test /api/wallet/transactions/deposit', () => {

        it ('should fail for unauthorised user user 401', async () => {
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .send({ amount: 100 })
                .expect(401);
        });

        it ('should fail for user without account 404', async () => {
            const cookie = await global.getAuthCookie();
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ amount: 100 })
                .expect(404);
        });

        it ('should fail for negative balance 400', async () => {
            const cookie = await global.getAuthCookie();
            //create an account
            const accountId = (await createAccount(cookie)).id;
            await request(app)
            .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ amount: -100 })
                .expect(400);
        });

        it('should return 400 if amount is not provided ', async () => {
            const cookie = await global.getAuthCookie();
            //create an account
            const accountId = (await createAccount(cookie)).id;
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ })
                .expect(400);
        });

        it('should return 201 and deposit the amount', async () => {
            const cookie = await global.getAuthCookie();
            //create an account
            const accountId = (await createAccount(cookie)).id;
            const response = await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ amount: 100 })
                .expect(201);
            expect(response.body.message).toBe('deposit successful');
            expect(response.body.object).toHaveProperty('id');
            expect(response.body.object.amount).toBe(100);
            expect(response.body.object.type).toBe('DEPOSIT');

        });

    })

    describe('test /api/wallet/transactions/transfer', () => {

        it ('should fail for unauthorised user 401', async () => {
            await request(app)
                .post('/api/wallet/transactions/transfer')
                .send({ amount: 100, receiver: 'test' })
                .expect(401);
        });

        it ('should fail for user without account account 404', async () => {
            const cookie = await global.getAuthCookie();
            await request(app)
                .post('/api/wallet/transactions/transfer')
                .set('Cookie', cookie)
                .send({ amount: 100, receiver: 'test' })
                .expect(404);
        });

        it ('should fail for insufficient balance 400', async () => {
            const user1 = await global.getAuthCookie();
            const user2 = await createAuth();
            //create an account
            const account1 = await createAccount(user1);
            const account2 = await createAccount(user2);
            await request(app)
                .post('/api/wallet/transactions/transfer')
                .set('Cookie', user1)
                .send({ amount: 100, receiver: account2.accountNumber })
                .expect(400);
        });

        it('should return 400 if amount is not provided or is not positive', async () => {
            const user1 = await global.getAuthCookie();
            const user2 = await createAuth();
            //create an accounts
            const account1 = await createAccount(user1);
            const account2 = await createAccount(user2);
            //deposit some amount to account1
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', user1)
                .send({ amount: 200 })
                .expect(201);

            await request(app)
                .post('/api/wallet/transactions/transfer')
                .set('Cookie', user1)
                .send({ reciever: account2.accountNumber })
                .expect(400);

            await request(app)
                .post('/api/wallet/transactions/transfer')
                .set('Cookie', user1)
                .send({ amount: -100, receiver: account2.accountNumber })
                .expect(400);
        });

        it('should return 404 if receiver account does not exist', async () => {
            const cookie = await global.getAuthCookie();
            //create an account
            const accountId = (await createAccount(cookie)).id;
            //deposit
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', cookie)
                .send({ amount: 200 })
                .expect(201);

            const res = await request(app)
                .post('/api/wallet/transactions/transfer')
                .set('Cookie', cookie)
                .send({ amount: 100, receiver: 'nonexistentaccount' })
                .expect(404);
        });

        it('should return 201 and transer the amount for correct parameters', async () => {
            const user1 = await global.getAuthCookie();
            const user2 = await createAuth();
            //create an account
            const account1 = await createAccount(user1);
            const account2 = await createAccount(user2);
            //deposit some amount to account1
            await request(app)
                .post('/api/wallet/transactions/deposit')
                .set('Cookie', user1)
                .send({ amount: 200 })
                .expect(201);
            //now transfer
            const response = await request(app)
                .post('/api/wallet/transactions/transfer')
                .set('Cookie', user1)
                .send({ amount: 100, receiver: account2.accountNumber })
                .expect(201);
            expect(response.body.message).toBe('transfer successful');
            expect(response.body.object).toHaveProperty('id');
            expect(response.body.object.amount).toBe(100);
            expect(response.body.object.type).toBe('TRANSFER');
            expect(response.body.object.receiver).toBe(account2.id);
        });

    });
})