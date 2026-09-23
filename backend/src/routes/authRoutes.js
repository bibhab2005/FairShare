import express from 'express';
import passport from 'passport';
import { register, login, logout, getMe, generateToken, setTokenCookie, checkUsername, setUsername, deleteAccount } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/check-username', checkUsername);
router.put('/username', protect, setUsername);
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
        console.error('Google OAuth callback failure:', err || info);
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
