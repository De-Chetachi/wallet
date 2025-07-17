import { Account } from "../account";
import User from "../user";
import { usera, userb }from "./user.test";


import dbClient from "../../knex";

const createUser1 = async () => {
    const user1 = User.build(usera);
    await user1.save();
    return user1;

}

const createUser2 = async () => {
    const user2 = User.build(userb);
    await user2.save();
    return user2;
}

describe("test for the account model", () => {
    describe("test for the build method", () => {
        it("should create and return a new account", async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            expect(account).toBeDefined();
            expect(account).toHaveProperty("user", user1.id);
            expect(account).toHaveProperty("account_number");
            expect(account).toHaveProperty("balance", 0.0);
            expect(account).toHaveProperty("currency", "#");
            expect(account).toHaveProperty("id");
        });
    });

    describe("test for the save method", () => {
        it("should save an account to the database", async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            const accounts = await dbClient(Account.tableName).select("*");
            expect(accounts.length).toEqual(1);
            expect(accounts[0]).toHaveProperty("user", user1.id);
            expect(accounts[0]).toHaveProperty("account_number");
            expect(accounts[0]).toHaveProperty("balance", 0.0);
            expect(accounts[0]).toHaveProperty("currency", "#");
            expect(accounts[0]).toHaveProperty("created_at");
            expect(accounts[0]).toHaveProperty("updated_at");
        })
    });

    describe("test for the findAll method", () => {
        it("should return all accounts", async () => {
            const user1 = await createUser1();
            const user2 = await createUser2();
            const account1 = Account.build({user: user1.id });
            const account2 = Account.build({user: user2.id });
            await account1.save();
            await account2.save();

            const accounts = await Account.findAll();
            expect(accounts.length).toEqual(2);
            expect(account1.id === accounts[0].id || account1.id === accounts[1].id).toBeTruthy();
            expect(accounts[0]).toHaveProperty("user");
            expect(accounts[0]).toHaveProperty("account_number");
            expect(accounts[0]).toHaveProperty("balance", 0.0);
            expect(accounts[0]).toHaveProperty("currency", "#");
            expect(accounts[0] instanceof Account).toBeTruthy();
        })
        it("should return an empty array if no accounts are found", async () => {
            const accounts = await Account.findAll();
            expect(accounts.length).toEqual(0);
        });

    })
    describe("test for the update method", () => {
        it("should update an account in the database", async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            account.balance = 100.0;
            await account.update();

            const updatedAccount = await Account.findById(account.id);
            if (updatedAccount){
                expect(updatedAccount).toBeDefined();
                expect(updatedAccount.balance).toEqual(100.0);
            }
        });
    });
    describe("test for the findById method", () => {
        it("should return an account by id", async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            const foundAccount = await Account.findById(account.id);
            expect(foundAccount).toBeDefined();
            if (foundAccount) {
                expect(foundAccount.id).toEqual(account.id);
                expect(foundAccount.user).toEqual(user1.id);
            }
        });

        it("should return null if no account is found", async () => {
            const foundAccount = await Account.findById("non-existing-id");
            expect(foundAccount).toBeNull();
        });
    });

    describe('test for the delete method', () => {
        it('should delete an account from the database', async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();
            const accounts_ = await dbClient(Account.tableName).select('*');
            expect(accounts_.length).toEqual(1);
            await account.delete();

            const accounts = await dbClient(Account.tableName).select('*');
            expect(accounts.length).toEqual(0);
        });
    })

    describe('test for transfer method', () => {
        it('should transfer money from one account to another', async () => {
            const user1 = await createUser1();
            const user2 = await createUser2();
            const account1 = Account.build({user: user1.id });
            const account2 = Account.build({user: user2.id });
            await account1.save();
            await account2.save();

            account1.balance = 1000.0;
            await account1.update();

            await account1.transfer(500.0, account2);

            const updatedAccount1 = await Account.findById(account1.id);
            const updatedAccount2 = await Account.findById(account2.id);

            expect(updatedAccount1).toBeDefined();
            expect(updatedAccount2).toBeDefined();

            if (updatedAccount1 && updatedAccount2) {
                expect(updatedAccount1.balance).toEqual(500.0);
                expect(updatedAccount2.balance).toEqual(500.0);
            }
        });

        it('should throw an error if the transfer amount is greater than the balance', async () => {
            const user1 = await createUser1();
            const user2 = await createUser2();
            const account1 = Account.build({user: user1.id });
            const account2 = Account.build({user: user2.id });
            await account1.save();
            await account2.save();

            account1.balance = 100.0;
            await account1.update();

            await expect(account1.transfer(200.0, account2)).rejects.toThrow("Insufficient balance");
        }); 
    });

    describe('test for the deposit method', () => {
        it('should deposit money into an account', async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            await account.deposit(500.0);

            const updatedAccount = await Account.findById(account.id);
            expect(updatedAccount).toBeDefined();
            if (updatedAccount) {
                expect(updatedAccount.balance).toEqual(500.0);
            }
        });

        it('should throw an error if the deposit amount is negative', async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            await expect(account.deposit(-100.0)).rejects.toThrow("Amount must be greater than zero");
        });
    });
    
    describe('test for the withdraw method', () => {
        it('should withdraw money from an account', async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            account.balance = 1000.0;
            await account.update();

            await account.withdraw(500.0);

            const updatedAccount = await Account.findById(account.id);
            expect(updatedAccount).toBeDefined();
            if (updatedAccount) {
                expect(updatedAccount.balance).toEqual(500.0);
            }
        });

        it('should throw an error if the withdrawal amount is greater than the balance', async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            account.balance = 100.0;
            await account.update();

            await expect(account.withdraw(200.0)).rejects.toThrow("Insufficient balance");
        });

        it ('should throw an error if the withdrawal amount is negative', async () => {
            const user1 = await createUser1();
            const account = Account.build({user: user1.id });
            await account.save();

            await expect(account.withdraw(-100.0)).rejects.toThrow("Amount must be greater than zero");
        }); 
    });
});