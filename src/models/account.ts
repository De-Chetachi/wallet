import { v4 as uuidv4 } from 'uuid';
import dbClient from '../knex';
import User from './user';
import { BadRequestError } from '../errors/badrequest_error';

interface AccountAttrs {
    id?: string;
    user: string;
    account_number?: string;
    balance?: number;
    currency?: string;
}


export class Account {
    static tableName = 'accounts';
    id: string;
    user: string;
    account_number: string;
    balance: number;
    currency: string;

    constructor(account: AccountAttrs) {
        const accNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        this.id = account.id || uuidv4();
        this.user = account.user;
        this.account_number = account.account_number || accNumber;
        this.balance = account.balance || 0.0;
        this.currency = account.currency || '#';
    }


    static build(accountAttrs: AccountAttrs): Account{
        return new Account(accountAttrs);
    }

    

    static async findById(id: string): Promise<Account | null> {
        try {
            const account = await dbClient(this.tableName).where({ id }).first();
            if (!account) {
                return null;
            }
            return Account.build(account);
        } catch(error: any) {
            throw new BadRequestError(error.message);
        }

    }

    static async findByAccountNumber(account_number: string): Promise<Account | null> {
        try {
            const account = await dbClient(this.tableName).where({ account_number }).first();
            if (!account) {
                return null;
            }
            return Account.build(account);
        } catch(error: any) {
            throw new BadRequestError(error.message);
        }

    }

    static async findAll(): Promise<Account[]> {
        try {
            const accounts = await dbClient(this.tableName).select('*');
            return accounts.map(account => {
                return Account.build(account);
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
            
        }
    }

    static async findByUser(userId: string): Promise<Account | null> {
        try {
            const account = await dbClient(this.tableName).where({ user: userId }).first();
            if (!account) {
                return null;
            }
            return this.build(account);
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }


    async save(){
        try {
            await dbClient(Account.tableName)
            .insert({
                id: this.id,
                account_number: this.account_number,
                balance: this.balance,
                user: this.user,
                currency: this.currency,
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    async update() {
        try {
            await dbClient(Account.tableName)
            .where({ id: this.id})
            .update({
                balance: this.balance,
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    async delete() {
        try {
            await dbClient(Account.tableName).delete()
            .where({ id: this.id });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    async deposit(amount: number) {
        try{
            if (amount <= 0) {
                throw new BadRequestError('Amount must be greater than zero');
            }
            this.balance += amount;
            await this.update();
            return this;
        } catch (error: any) {
            throw new BadRequestError(error.message);   
        }
    }

    async withdraw(amount: number) {
        try {
            if (amount <= 0) {
                throw new BadRequestError('Amount must be greater than zero');
            }
            if (this.balance < amount) {
                throw new BadRequestError('Insufficient balance');
            }
            this.balance -= amount;
            await this.update();
            return this;
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }

    }

    async transfer(amount: number, reciever: Account) {
        try{
            if (amount <= 0) {
                throw new BadRequestError('Amount must be greater than zero');
            }
            if (this.balance < amount) {
                throw new BadRequestError('Insufficient balance');
            }
            await reciever.deposit(amount);
            this.balance -= amount;
            await this.update();
            return this;
        } catch (error: any) { 
            throw new BadRequestError(error.message);
        }

    }
}
