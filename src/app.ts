import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cookieSession from 'cookie-session';
import { currentUser } from './middlewares/current_user';
import { errorHandler } from './middlewares/error_handler';
import { NotFoundError } from './errors/notfound_error';
import userRouter from './routes/user';
import accountRouter from './routes/account';
import transactionRouter from './routes/transaction';
import swaggerUi from 'swagger-ui-express';
//import { swaggerSpec } from 'config/swagger';


const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test', 
}));

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.path, req.method);
    next();
});


app.use('/api/wallet/users', userRouter);
app.use('/api/wallet/accounts', accountRouter);
app.use('/api/wallet/transactions', transactionRouter);

// app.get('/*', () => {
//     throw new NotFoundError('resource not found');
// });

app.use(errorHandler);

export default app;
