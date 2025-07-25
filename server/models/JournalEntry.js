// server/models/JournalEntry.js
const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'My Thoughts',
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: Number, // 1 = very low, 5 = very good
    min: 1,
    max: 5,
    default: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);