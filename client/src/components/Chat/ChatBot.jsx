// client/src/components/Chat/ChatBot.jsx
import { useState } from 'react';
import api from '../../services/api';

function ChatBot() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { sender: 'ai', text: 'Hello! I’m your MindSpace Guide. How are you feeling today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { sender: 'user', text: message };
    setChat(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message });
      const aiMsg = { sender: 'ai', text: res.data.reply };
      setChat(prev => [...prev, aiMsg]);
    } catch (err) {
      setChat(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I could not connect right now. Are you okay? You’re not alone.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ 
        fontSize: '1.8rem', 
        color: '#4a5568', 
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #a78bfa, #60a5fa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        💬 Chat with Your AI Guide
      </h2>

      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1rem',
        minHeight: '300px',
        backgroundColor: '#f7f9fc',
        fontSize: '0.95rem',
        color: '#555',
        overflowY: 'auto',
        maxHeight: '400px'
      }}>
        {chat.map((msg, i) => (
          <p key={i} style={{ margin: '0.5rem 0' }}>
            <strong>{msg.sender === 'ai' ? 'AI:' : 'You:'}</strong> {msg.text}
          </p>
        ))}
        {loading && <p style={{ color: '#718096', fontStyle: 'italic' }}>Thinking...</p>}
      </div>

      <form onSubmit={sendMessage} style={{
        display: 'flex',
        marginTop: '1rem',
        gap: '8px'
      }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#5a67d8',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBot;