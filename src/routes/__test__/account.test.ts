import request from 'supertest';
import app from '../../app';

//integration test for account routes

const url = '/api/wallet/accounts';
describe('test for Account Router', () => { 
    describe('test for GET /api/wallet/accounts', () => {
        it('should return 200 and the account details', async () => {
            const cookie = await getAuthCookie();
            //simulate account creation
            await request(app)
            .post(url)
            .set('Cookie', cookie)
            .send();
            const response = await request(app)
            .get(url)
            .set('Cookie', cookie)
            .expect(200);
            expect(response.body.message).toBe('Account fetched successfully');
            expect(response.body.object).toHaveProperty('id');
            expect(response.body.object).toHaveProperty('user');
        });

        it ('should return an empty object if no account had being created', async () => {
            const cookie = await global.getAuthCookie();
            const response = await request(app)
                .get(url)
                .set('Cookie', cookie)
                .send()
                .expect(200);
            expect(response.body.message).toBe('No account found for this user');
            expect(response.body.object).toEqual({});
        })

        it('should fail if user is not signed in', async () => {
            await request(app)
                .get(url)
                .expect(401);
        });
    });

    describe('post /api/wallet/accounts', () => {
        it('should create a new account', async () => {
            const cookie = await global.getAuthCookie();
            const response = await request(app)
                .post(url)
                .set('Cookie', cookie)
                .expect(201);
            expect(response.body.message).toBe('Account created successfully');
            expect(response.body.object).toHaveProperty('id');
            expect(response.body.object).toHaveProperty('user');
            expect(response.body.object).toHaveProperty('balance');
        });

        it('should return error if user is not signed in', async () => {
            await request(app)
            .post(url)
            .expect(401);
        });
    })
})