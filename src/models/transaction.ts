import { v4 as uuidv4 } from 'uuid';
import dbClient from '../knex';
import User from './user';
import { BadRequestError } from '../errors/badrequest_error';

export enum transactionType { 
    deposit = "DEPOSIT",
    withdrawal = "WITHDRAWAL",
    transfer = "TRANSFER",
}

export enum status {
    pending = "PENDING",
    completed = "COMPLETED",
    failed = "FAILED",
}

interface TransactionAttrs {
    id?: string;
    account: string;
    amount: number;
    type: transactionType;
    status: status;
    created_at?: string;
    updated_at?: string;
}

interface TransferAttrs extends TransactionAttrs {
    receiver: string;
}


export class Transaction {
    static tableName = 'transactions';
    id: string;
    account: string;
    amount: number;
    type: string;
    status: status;
    created_at: string;
    updated_at: string;

    constructor(transaction: TransactionAttrs) {
        this.id = transaction.id || uuidv4();
        this.account = transaction.account;
        this.amount = transaction.amount;
        this.type = transaction.type;
        this.status = transaction.status;
        this.created_at = transaction.created_at || new Date().toISOString();
        this.updated_at = transaction.updated_at || new Date().toISOString();
    }


    static build(transactionAttrs: TransactionAttrs): Transaction{
        return new Transaction(transactionAttrs);
    }

    

    static async findById(id: string): Promise<Transaction | null> {
        try {
            const transaction = await dbClient(this.tableName).where({ id }).first();
            if(!transaction) {
                return  null;
            }
            return Transaction.build(transaction);
        } catch(error: any) {
            throw new BadRequestError(error.message);
        }

    }

    static async findAll(): Promise<Transaction[]> {
        try {
            const transactions = await dbClient(this.tableName).select('*');
            transactions.map(transaction => {
                return Transaction.build(transaction);
            })
            return transactions;
        } catch (error: any) {
            throw new BadRequestError(error.message);
            
        }

    }

    static async findByAccount(account: string) : Promise<Transaction[]> {
        try {
            const transactions = await dbClient(this.tableName).where({ account }).select('*');
            return transactions.map(transaction => {
                return Transaction.build(transaction);
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
            
        }

    }

    async save(){
        try {
            await dbClient(Transaction.tableName)
            .insert({
                id: this.id,
                account: this.account,
                amount: this.amount,
                type: this.type,
                status: this.status,
                
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    async update() {
        try {
            await dbClient(Transaction.tableName)
            .where({ id: this.id})
            .update({
                status: this.status,
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }

    async delete() {
        try {
            await dbClient(Transaction.tableName).delete()
            .where({ id: this.id });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }
}


export class Transfer extends Transaction {
    receiver: string;

    constructor(transfer: TransferAttrs) {
        super(transfer);
        this.receiver = transfer.receiver;
    }

    static build(transferAttrs: TransferAttrs): Transfer {
        return new Transfer(transferAttrs);
    }

    async save() {
        try {
            await dbClient(Transaction.tableName)
            .insert({
                id: this.id,
                account: this.account,
                amount: this.amount,
                type: this.type,
                receiver: this.receiver,
                status: this.status,
            });
        } catch (error: any) {
            throw new BadRequestError(error.message);
        }
    }
}