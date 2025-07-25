// server/server.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env' });
} else {
  console.log('✅ Running in production — using environment variables from Render');
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');


// Initialize Passport
require('./config/passport');
console.log('✅ passport.js loaded');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretrandomstringforcookies',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000, secure: false, httpOnly: true }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// 🌐 MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🔍 Test Route
app.get('/', (req, res) => {
  res.send('🌱 MindSpace API is running!');
});

// ✅ Import Routes
const authRoutes = require('./routes/authRoutes');
console.log('✅ authRoutes imported:', !!authRoutes);

const journalRoutes = require('./routes/journalRoutes');
const profileRoutes = require('./routes/profileRoutes');

// ✅ Use Routes
app.use('/api/auth', authRoutes);


// ✅ POST /api/chat → with Google Gemini (Improved)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  // Safety check for crisis keywords
  const crisisKeywords = ['kill myself', 'suicide', 'hurt myself', 'don’t want to live', 'end it all', 'no reason to live'];
  const lowerMessage = message?.toLowerCase().trim() || '';

  if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return res.json({
      reply: `I'm deeply concerned about what you're going through.
      
If you're in crisis, please reach out to a professional:
- 🌎 International: https://findahelpline.com  
- 🇺🇸 US: 988 Suicide & Crisis Lifeline
- 🇬🇧 UK: 116 123 (Samaritans)
- 🇨🇦 Canada: 1-833-456-4566

You're not alone. Help is available. I'm here for you.`
    });
  }

  try {
    // Dynamic prompt based on message type
    const isPracticalQuestion = /how to make|recipe|cook|boil|fry|bake|what is|explain|define/i.test(lowerMessage);

    let prompt = '';

    if (isPracticalQuestion) {
      prompt = `
You are "MindSpace Guide", a kind and supportive AI companion for mental wellness.
The user asked a practical question. Answer briefly and clearly.
Then gently return to emotional support.

User asks: "${message}"

Reply in two parts:
1. A short, helpful answer to their question
2. A warm, empathetic follow-up that brings the focus back to their well-being

Example:
User: "How do I make an egg?"
→ "You can boil an egg for 6–8 minutes or fry it with a little oil. Simple and quick! While you're in the kitchen, would you like to try a 1-minute breathing exercise to stay calm?"

Now respond to: "${message}"
`;
    } else {
      prompt = `
You are "MindSpace Guide", a compassionate and non-judgmental AI companion for mental wellness.
Respond with empathy, warmth, and care. Use a calm, conversational tone.
Never diagnose or give medical advice.

Guidelines:
- Acknowledge the user's feelings
- Validate their experience
- Ask gentle follow-up questions if appropriate
- If they're struggling, suggest journaling, breathing, or talking to a human

Think step by step:
1. What emotion is the user expressing?
2. How can I validate that feeling?
3. What gentle response would make them feel heard?

User says: "${message}"

Reply:
`;
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiReply = response.text();

    // Clean up any unwanted formatting
    aiReply = aiReply.replace(/\*\*/g, '').trim();

    res.json({ reply: aiReply });

  } catch (error) {
    console.error('Gemini Error:', error.message);
    res.status(500).json({
      reply: "I'm here for you. I'm having trouble connecting right now, but you're not alone. Would you like to write in your journal or try a breathing exercise?"
    });
  }
});

app.use('/api/journal', journalRoutes);
app.use('/api/profile', profileRoutes);

// ✅ Debug test route
app.post('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// 🚪 Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});