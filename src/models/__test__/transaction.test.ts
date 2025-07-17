import { Transaction } from "../transaction";  
import { dbClient } from "../../knex";
import { Account } from "../account";
import { User } from "../user";
import { usera, userb } from "./user.test";


const createAcc1 = async () => {
    const user1 = User.build(usera);
    await user1.save();
    const account = Account.build({user: user1.id });
    await account.save();
    return account;

}

const createAcc2 = async () => {
    const user2 = User.build(userb);
    await user2.save();
    const account = Account.build({user: user2.id });
    await account.save();
    return account;
}


describe("test for the transaction model", () => {
    describe("test for the build method", () => {
        
    })
});


describe('test for the transfer model', () => {

})