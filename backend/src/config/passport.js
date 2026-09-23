import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error('No email found in Google account profile'), null);
          }

          const avatar = profile.photos?.[0]?.value || '';
          let displayName = profile.displayName || profile.name?.givenName || email.split('@')[0] || 'User';
          if (displayName.trim().length < 2) {
            displayName = 'User';
          }

          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email });

            if (user) {
              user.googleId = profile.id;
              if (avatar && !user.avatar) {
                user.avatar = avatar;
              }
              await user.save();
            } else {
              user = await User.create({
                googleId: profile.id,
                name: displayName.trim(),
                email,
                avatar,
                passwordHash: '', // Set empty or random since they use OAuth
              });
            }
          }
          return done(null, user);
        } catch (error) {
          console.error('Passport Google strategy error:', error);
          return done(error, null);
        }
      }
    )
  );

  // We are not using sessions, so we don't need serializeUser/deserializeUser.
};
