import express from 'express';
import passport from 'passport';
import { register, login, logout, getMe, generateToken, setTokenCookie, checkUsername, checkUpiId, setUsername, deleteAccount, updateProfile } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { registerSchema, loginSchema, setUsernameSchema, updateProfileSchema } from '../validators/schemas.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/check-username', checkUsername);
router.get('/check-upi', checkUpiId);
router.put('/username', protect, validateBody(setUsernameSchema), setUsername);
router.put('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.delete('/account', protect, deleteAccount);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Helper to get frontend URL dynamically at request time
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
};

router.get(
  '/google/callback',
  (req, res, next) => {
    const frontendUrl = getFrontendUrl();
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err || !user) {
        logger.error('Google OAuth callback failure:', err || info);
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }
      const token = generateToken(user._id);
      setTokenCookie(res, token);

      // Redirect straight back to the frontend app root
      return res.redirect(`${frontendUrl}/?token=${token}`);
    })(req, res, next);
  }
);

export default router;
