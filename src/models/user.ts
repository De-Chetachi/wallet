import { v4 as uuidv4 } from 'uuid';
import dbClient from '../knex';
import { hashPassword } from '../utils/password';
import { BadRequestError } from '../errors/badrequest_error';

interface UserAttrs {
    id?: string;
    name: string;
    email: string;
    //phone: string;
    password: string;
}


export class User {
    static tableName = 'users';
    id: string;
    name: string;
    email: string;
    //phone: string;
    password: string;

    constructor(user: UserAttrs) {
        this.id = user.id || uuidv4();
        this.name = user.name;
        this.email = user.email;
        //this.phone = user.phone;
        this.password = user.password;
    }


    static build(userAttrs: UserAttrs): User{
        return new User(userAttrs);
    }

    

    static async findById(id: string): Promise<User | null> {
        try {
            const user = await dbClient(this.tableName).where({ id }).first();
            if (!user) {
                return null;
            }  
            return User.build(user);
        } catch(error: any) {
            throw new BadRequestError(error.message);
        }

    }

    static async findOne(email: string): Promise<User | null> {
        try {
            const user = await dbClient(this.tableName).where({ email }).first();
            if (!user) {
                return null;
            }
            return User.build(user);
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    static async findAll(): Promise<User[]> {
        try {
            const users = await dbClient(this.tableName).select('*');
            return users.map(user => {
                return User.build(user);
            });
            
        } catch (error: any) {
            throw new BadRequestError(error.message)
            
        }

    }


    async save(){
        try {
            this.password = await hashPassword(this.password);
            await dbClient(User.tableName)
            .insert({
                id: this.id,
                name: this.name,
                email: this.email,
                //phone: this.phone,
                password: this.password,
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    async update() {
        try {
            await dbClient(User.tableName)
            .where({ id: this.id})
            .update({
                name: this.name,
                email: this.email,
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    async delete() {
        try {
            await dbClient(User.tableName).delete()
            .where({ id: this.id });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
        };
    }
}


export default User;