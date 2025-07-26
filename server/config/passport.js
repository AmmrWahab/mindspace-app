// server/config/passport.js
console.log('✅ passport.js loaded');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config({ path: '.env' });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://mindspace-app.onrender.com/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const User = require('../models/User');
        const email = profile.emails[0].value;

        // ✅ Extract name: use displayName, fallback to email prefix
        let name = profile.displayName || email.split('@')[0];

        // ✅ Ensure first letter is capitalized
        name = name.charAt(0).toUpperCase() + name.slice(1);

        // ✅ Ensure no empty name
        if (!name || name === 'undefined' || name === 'null') {
          name = 'User'; // Final fallback
        }

        // ✅ Find user by email
        let user = await User.findOne({ email });

        if (user) {
          return done(null, user);
        }

        // ✅ Create new user with guaranteed name
        user = new User({
          name,
          email,
          password: '',
          isGoogleAuth: true,
        });

        await user.save();
        console.log('✅ New Google user saved:', user.email, 'Name:', user.name);
        done(null, user);
      } catch (err) {
        console.error('Google Auth Error:', err);
        done(err, null);
      }
    }
  )
);

// Save user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});