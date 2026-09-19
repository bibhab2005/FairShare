import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production' || process.env.VERCEL
          ? `${process.env.FRONTEND_URL}/api/auth/google/callback`
          : 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });

            if (user) {
              user.googleId = profile.id;
              user.avatar = profile.photos[0].value;
              await user.save();
            } else {
              user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value.toLowerCase(),
                avatar: profile.photos[0].value,
                passwordHash: '', // Set empty or random since they use OAuth
              });
            }
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // We are not using sessions, so we don't need serializeUser/deserializeUser.
};
