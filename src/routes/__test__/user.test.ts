import request from 'supertest';
import app from '../../app';

//integration test for user routes
describe('User Router', () => {
    describe('POST /api/wallet/users', () => {
        it('should create a new user', async () => {
            const response = await request(app)
            .post('/api/wallet/users')
            .send({
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password',
            })
            .expect(201);
            expect(response.body.message).toBe('User created successfully');
            expect(response.body.object).toHaveProperty('id');
            expect(response.body.object).toHaveProperty('name', 'John Doe');
            expect(response.body.object).toHaveProperty('email', 'john@gmail.com');
        });

        it('should return error if user already exists', async () => {
            await request(app)
            .post('/api/wallet/users')
            .send({
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password'
            }).expect(201);
            await request(app)
            .post('/api/wallet/users')
            .send({
                name: 'John Mark',
                email: 'john@gmail.com',
                password: 'password'
            }).expect(400);
        });

        it('should return error if any parameter is missing', async () => {
            await request(app)
            .post('/api/wallet/users')
            .send({
                email: 'john@gmail.com',
                password: 'password'
            }).expect(400);
        });
                     
    });

    describe('POST /api/users/login', () => {
        it('return 400  for non exixtent user', async () => {
            await request(app)
            .post('/api/wallet/users/login')
            .send({
                email: 'john Doe',
                password: 'password'
            }).expect(400);
        } )

        it('return 200 and set cookie on successful login', async () => {
            await request(app)
            .post('/api/wallet/users')
            .send({
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password',
            }).expect(201);

            const response = await request(app)
            .post('/api/wallet/users/login')
            .send({
                email: 'john@gmail.com',
                password: 'password',
            }).expect(200);

            expect(response.get('Set-Cookie')).toBeDefined();
            expect(response.body.message).toBe('User logged in successfully');
        });

        it ('fails for invalid credentials', async () => {
            await request(app)
            .post('/api/wallet/users')
            .send({
                name: 'John Doe',
                email: 'john@gmail.com',
                password: 'password'
            }).expect(201);

            await request(app)
            .post('/api/wallet/users/login')
            .send({
                email: 'john@gmail.com',
                password: 'passwordy'
            }).expect(400);
        });


        it('returns 400 for logged in user', async () => {
            const cookie = await getAuthCookie();
            await request(app)
            .post('/api/wallet/users/login')
            .set('Cookie', cookie)
            .send({
                name: 'John Doe',
                email: 'john@gmail.com',
            })
            .expect(400);
        });
    });
        
})