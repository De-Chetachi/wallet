import express from 'express';
import AccountController from '../controllers/account';

const accountRouter = express.Router();
import { currentUser } from '../middlewares/current_user';
import requireAuth from '../middlewares/require_auth';


accountRouter.get('/',  currentUser, requireAuth, AccountController.getAccount);
accountRouter.post('/', currentUser, requireAuth, AccountController.createAccount);



export default accountRouter;
