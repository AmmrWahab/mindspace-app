// server/routes/journalRoutes.js
const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const auth = require('../middleware/auth'); // We'll create this next
const router = express.Router();

// POST /api/journal → Save entry + AI mood analysis
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    // Use Gemini to analyze mood
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze the emotional tone of this journal entry and return ONLY a number from 1 to 5:
1 = Very negative (hopeless, anxious, depressed)
2 = Negative
3 = Neutral or mixed
4 = Positive
5 = Very positive (joyful, grateful, hopeful)

Do NOT add explanations. Only return the number.

Journal entry: "${content}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let mood = parseInt(response.text().trim()) || 3; // Default to 3 if parsing fails

    // Clamp to 1–5
    mood = Math.max(1, Math.min(5, mood));

    // Save to DB
    const newEntry = new JournalEntry({
      userId: req.user.id,
      title,
      content,
      mood
    });

    const entry = await newEntry.save();
    res.json(entry);

  } catch (error) {
    console.error('Mood analysis error:', error.message);
    // Fallback: save with mood 3
    const newEntry = new JournalEntry({
      userId: req.user.id,
      title,
      content,
      mood: 3
    });

    const entry = await newEntry.save();
    res.json(entry);
  }
});

// GET /api/journal → Get all journal entries for user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Journal load error:', err.message);
    res.status(500).send('Server error');
  }
});


// DELETE /api/journal/:id → Delete a journal entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }

    // Make sure user owns the entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await entry.deleteOne();
    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;