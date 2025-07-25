// server/models/User.js
const mongoose = require('mongoose');

// server/models/User.js
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [function() { return !this.isGoogleAuth; }, 'Password is required'],
  },
  isGoogleAuth: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String, // URL or base64 string
    default: ''
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('User', UserSchema);