import express from 'express';
import UserController from '../controllers/user';
import { body, validationResult } from 'express-validator';
import { validationHandler } from '../middlewares/validation_handler';
import karma from '../middlewares/karma';
import { currentUser } from '../middlewares/current_user';

const userRouter = express.Router();

userRouter.post('/', [
    body('name').trim().notEmpty()
    .withMessage('name is required'),
    body('email').isEmail()
    .withMessage('email must be valid'),
    body('password').trim().isLength({ min:8 })
    .withMessage('password must be at least 8 characters long'),
], currentUser, validationHandler, karma, UserController.createUser);


userRouter.post('/login', currentUser, UserController.loginUser);

export default userRouter;