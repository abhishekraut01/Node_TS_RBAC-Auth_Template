import { Router } from 'express';
import {
  getCurrentUser,
  handleLogout,
  handleSignin,
  handleSignup,
  healthCheck,
  refreshAccessToken,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router: Router = Router();
router.route('/signup').post(handleSignup);
router.route('/signin').post(handleSignin);
router.route('/logout').post(authenticate, handleLogout);
router.route('/health').get(healthCheck);
router.route('/me').get(authenticate, getCurrentUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;
