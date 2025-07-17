import app from '../app';
import request from 'supertest';
import dbClient from '../knex';

declare global {
    var getAuthCookie: () => Promise<string[]>;
}

beforeAll(async () => {
    process.env.JWT_SECRET ='sdfghjkl';
    process.env.NODE_ENV = 'test';
    await dbClient.migrate.latest();
}, 30000);

beforeEach(async () => {
    // Clear the database before each test
    await dbClient.raw('SET FOREIGN_KEY_CHECKS = 0;');
    await dbClient('transactions').truncate();
    await dbClient('accounts').truncate();
    await dbClient('users').truncate();
    await dbClient.raw('SET FOREIGN_KEY_CHECKS = 1;');
});


afterAll(async () => {
    // destroy the database connection
    await dbClient.raw('SET FOREIGN_KEY_CHECKS = 0;');
    await dbClient.schema.dropTableIfExists('transactions');
    await dbClient.schema.dropTableIfExists('accounts');
    await dbClient.schema.dropTableIfExists('users');
    await dbClient.schema.dropTableIfExists('migrations')
    await dbClient.raw('SET FOREIGN_KEY_CHECKS = 1;');
    await dbClient.destroy();
});


global.getAuthCookie = async () => {
  await request(app)
    .post('/api/wallet/users/')
    .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: 'password'
    })
    .expect(201);

  const loginResponse = await request(app)
    .post('/api/wallet/users/login')
    .send({
        email: 'john@gmail.com',
        password: 'password'
    })
    .expect(200);
  const cookie = loginResponse.get('Set-Cookie');
  if (!cookie) {
    throw new Error('cookie not set');
  }
  return cookie;
}