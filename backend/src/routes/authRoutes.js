import express from 'express';
import passport from 'passport';
import { register, login, logout, getMe, generateToken, setTokenCookie } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    // Generate JWT and set in HttpOnly cookie just like normal login
    const token = generateToken(req.user._id);
    setTokenCookie(res, token);

    // Redirect straight back to the frontend app root
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  }
);

export default router;
