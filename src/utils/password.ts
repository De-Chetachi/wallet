import bcrypt from 'bcrypt';    


const saltRounds = 10;
export const hashPassword = (password: string): Promise<string> => {
    const hash = bcrypt.hash(password, saltRounds)
    .then((hash: string) =>{
        return hash;
    }).catch(function(err: any) {
        throw new Error('Error hashing password')
    });
    return hash;
}  


export const comparePassword = (password: string, hash: string): Promise<boolean> => {
    const isMatch = bcrypt.compare(password, hash)
    .then((result: boolean) => {
        return result;
    }).catch((err: any) => {
        throw new Error('Error comparing password');
    });
    return isMatch;
}