// client/src/components/Journal/JournalForm.jsx
import { useState } from 'react';
import api from '../../services/api';

function JournalForm({ onEntrySaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/journal', { title, content, mood });
      onEntrySaved(res.data);
      setTitle('');
      setContent('');
      setMood(3);
    } catch (err) {
      console.error('Failed to save journal entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#5a67d8' }}>Write a Journal Entry</h3>
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      />
      <textarea
        placeholder="How are you feeling today? What’s on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="6"
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      />
      <div style={{ marginBottom: '1rem' }}>
        <label>Mood: {mood} ⭐</label>
        <input
          type="range"
          min="1"
          max="5"
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#718096' }}>
          <span>Very Low</span>
          <span>Good</span>
        </div>
      </div>
      <button
        type="submit"
        style={{
          padding: '10px 20px',
          backgroundColor: '#5a67d8',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Save Entry
      </button>
    </form>
  );
}

export default JournalForm;