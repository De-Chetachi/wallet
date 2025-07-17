import { User } from "../user";
import { dbClient }  from '../../knex'

export const usera = {name: 'John Doe', email: 'john@gmail.com', password: 'password123'}
export const userb = {name: 'John Mark', email: 'Mark@gmail.com', password: 'password123'}
describe('test for the user model', () => {
    describe('test for the build method', () => {
        it('should create and return a new user ', async () => {
            const user = User.build(usera);
            expect(user).toBeDefined();
            expect(user).toHaveProperty('name', 'John Doe');
            expect(user).toHaveProperty('email', 'john@gmail.com');
            //expect(user).toHaveProperty('phone', '08107782457');
            expect(user).toHaveProperty('password');
        });
        it('should return error if the parameters passed are not complete', async () => {
            // typescript will handle this      
        });
    });


    describe('test for the save method', () => {
        it('should save a user to the database', async () => {

            const user1 = User.build(usera);
            const user2 = User.build(userb);
            await user1.save();
            await user2.save();

            const users = await dbClient(User.tableName).select('*');
            expect(users.length).toEqual(2);
            expect(users[0]).toHaveProperty('name');
            expect(users[0]).toHaveProperty('email');
            //expect(users[0]).toHaveProperty('phone');
            expect(users[0]).toHaveProperty('created_at');
            expect(users[0]).toHaveProperty('updated_at');
            expect(users[1]).toHaveProperty('name');
        });
    });

    describe('test for the findAll method', () => {
        it('should return all users', async () => {
            const user1 = User.build(usera);
            const user2 = User.build(userb);
            await user1.save();
            await user2.save();

            const users = await User.findAll();
            expect(users.length).toEqual(2);
            expect(user1.id === users[0].id || user1.id === users[1].id).toBeTruthy();
            expect(users[0] instanceof User).toBeTruthy();
        })
        it('should return an empty array if no users are found', async () => {
            const users = await User.findAll();
            expect(users.length).toEqual(0);
        });

    })

    

    describe('test for the update method', () => {
        it('should update a user in the database', async () => {});
    });

    describe('test for the delete method', () => {
        it('should delete a user from the database', async () => {
            const user1 = User.build(usera);
            const user2 = User.build(userb);
            await user1.save();
            await user2.save();
            await user1.delete();
            const users = await dbClient(User.tableName).select('*')
            expect(users.length).toEqual(1);
            expect(users[0]).toHaveProperty('name', 'John Mark');
        });
    });

    describe('test for the findById method', () => {
        it('should return a user by id', async () => {
            const user1 = User.build(usera);
            const user2 = User.build(userb);
            await user1.save();
            await user2.save();

            const user = await User.findById(user1.id);
            expect(user).toBeDefined();
            expect(user).toHaveProperty('name', 'John Doe');
            expect(user).toHaveProperty('email', 'john@gmail.com');
            expect(user instanceof User).toBeTruthy();
        });
        it('should return null if no user is found', async () => {
            const user = await User.findById('non-existing-id');
            expect(user).toBeNull();
        });
    });
});