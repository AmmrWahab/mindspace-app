// server/routes/authRoutes.js
console.log('✅ authRoutes.js loaded');

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ✅ Import real controller functions
const { register, login } = require('../controllers/authController');

// POST /api/auth/register → Use real controller
router.post('/register', register);

// POST /api/auth/login → Use real controller
router.post('/login', login);

// Google Auth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account consent',
    approval_prompt: 'force'
  })
);

// Google Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // ✅ Include name and email in JWT
    const token = jwt.sign({ 
      user: { 
        id: req.user.id,
        name: req.user.name,
        email: req.user.email 
      } 
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`https://mindspace-app.vercel.app/auth/callback?token=${token}`);
  }
);

module.exports = router;