import express from 'express';
import { TransactionController } from '../controllers/transaction';
import { currentUser } from '../middlewares/current_user';
import requireAuth from '../middlewares/require_auth'
import { validationHandler } from '../middlewares/validation_handler';
import { body , validationResult } from 'express-validator';

const transactionRouter = express.Router()

transactionRouter.get('/', currentUser, requireAuth, TransactionController.getTransactions);
transactionRouter.get('/:id', currentUser, requireAuth, TransactionController.getTransactionById);

transactionRouter.post('/withdraw',[
    body('amount').isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),  
], validationHandler, currentUser, requireAuth, TransactionController.withdraw);

transactionRouter.post('/deposit', [
    body('amount').isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),  
], validationHandler, currentUser, requireAuth, TransactionController.deposit);


transactionRouter.post('/transfer', [
    body('amount').isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
    body('receiver').trim().notEmpty()
    .withMessage('Receiver is required'),
], validationHandler,  currentUser, requireAuth, TransactionController.transfer);

export default transactionRouter