// server/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth'); // Your JWT middleware
const JournalEntry = require('../models/JournalEntry');

// PUT /api/profile → Update name and/or profile picture
router.put('/', auth, async (req, res) => {
  const { name, profilePic } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name) user.name = name;
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    res.json({
      name: user.name,
      email: user.email,
      profilePic: user.profilePic
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).send('Server error');
  }
});




// GET /api/profile → Return full user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({
      name: user.name,
      email: user.email,
      profilePic: user.profilePic
    });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/profile → Delete user and all data
router.delete('/', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await JournalEntry.deleteMany({ userId: req.user.id });
    res.json({ msg: 'Account and data deleted' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;