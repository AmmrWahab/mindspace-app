// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../components/Chat/ChatBot';
import api from '../services/api';
import MoodChart from "../components/Journal/MoodChart";
import EditProfileModal from '../components/Profile/EditProfileModal';




function Dashboard() {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');
  const navigate = useNavigate();
  const [newEntry, setNewEntry] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id: '...', entry: '...' }
  // Breathing Exercise State
const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold, exhale
const [breathingScale, setBreathingScale] = useState(1); // 0.8 to 1.2
const [editModalOpen, setEditModalOpen] = useState(false);
const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
const [previewImage, setPreviewImage] = useState(null);

// Breathing durations (in seconds)
const durations = {
  inhale: 4,
  hold: 4,
  exhale: 6
};


useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // ✅ Fetch full user data from backend
      const res = await api.get('/profile');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load user:', err);
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [navigate]);




// Breathing animation
useEffect(() => {
  const cycleBreathing = () => {
    setBreathingScale(1.1); // Expand
    setTimeout(() => {
      setBreathingPhase('hold');
      setBreathingScale(1.1);
      setTimeout(() => {
        setBreathingPhase('exhale');
        setBreathingScale(0.8); // Contract
        setTimeout(() => {
          setBreathingPhase('inhale');
          setBreathingScale(1);
          cycleBreathing(); // Repeat
        }, durations.exhale * 1000);
      }, durations.hold * 1000);
    }, durations.inhale * 1000);
  };

  cycleBreathing();
}, []);

  // Simulate user data from JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 Decoded JWT:', payload); // 🔍 Check browser console
      setUser({ 
  name: payload.user?.name || 'User', 
  email: payload.user?.email || 'you@example.com' 
});
    } catch (_err) {
      navigate('/login');
    }

    // Create floating particles
    createParticles();
  }, [navigate]);



const handleProfileSave = async (updatedData) => {
  try {
    const res = await api.put('/profile', updatedData);
    
    // ✅ Update user state with full response
    setUser(prev => ({ 
      ...prev, 
      name: res.data.name, 
      profilePic: res.data.profilePic 
    }));
    
    setEditModalOpen(false);
  } catch (err) {
    console.error('Failed to update profile');
  }
};


// Save a new journal entry
const handleSaveEntry = async () => {
  if (!newEntry.trim()) return;

  try {
    // Send journal content to backend for AI mood analysis
    const res = await api.post('/journal', {
      content: newEntry,
      title: 'My Thoughts'
      // Don't send mood — let backend decide
    });

    // Add new entry to top of list
    setJournalEntries([res.data, ...journalEntries]);
    setNewEntry(''); // Clear textarea
  } catch (err) {
    console.error('Failed to save journal entry');
  }
};


// Show confirmation
const confirmDelete = (entryId) => {
  const entry = journalEntries.find(e => e._id === entryId);
  setDeleteConfirm({ id: entryId, entry });
};

// Actually delete after confirmation
const handleDeleteEntry = async () => {
  if (!deleteConfirm) return;

  try {
    await api.delete(`/journal/${deleteConfirm.id}`);
    setJournalEntries(journalEntries.filter(entry => entry._id !== deleteConfirm.id));
  } catch (err) {
    console.error('Failed to delete journal entry');
  } finally {
    setDeleteConfirm(null); // Close popup
  }
};

// Cancel deletion
const cancelDelete = () => {
  setDeleteConfirm(null);
};

// Load entries when tab is active
useEffect(() => {
  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal');
      setJournalEntries(res.data);
    } catch (err) {
      console.error('Failed to load journal entries');
    }
  };
  if (activeTab === 'journal') fetchEntries();
}, [activeTab]);


  // Create soft floating particles (like breath or thoughts)
  const createParticles = () => {
    const addParticle = () => {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        top: ${Math.random() * 100}vh;
        left: ${Math.random() * 100}vw;
        width: ${Math.random() * 2 + 1}px;
        height: ${Math.random() * 2 + 1}px;
        background: rgba(90, 103, 216, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        animation: float-pulse ${Math.random() * 10 + 10}s infinite linear;
        animation-delay: ${Math.random() * 5}s;
      `;
      document.body.appendChild(particle);

      setTimeout(() => {
        if (particle && particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 15000);
    };

    // Add 20 particles
    for (let i = 0; i < 20; i++) {
      setTimeout(addParticle, i * 500);
    }

    const interval = setInterval(addParticle, 4000);
    return () => clearInterval(interval);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


const handleDeleteAccount = async () => {
  if (!window.confirm('Are you sure? This will permanently delete your account and all journal entries. This cannot be undone.')) {
    return;
  }

  try {
    // Delete account from backend
    await api.delete('/profile');
    
    // Clear local data
    localStorage.removeItem('token');
    setUser(null);
    
    // Redirect to login
    navigate('/login');

    // Optional: Sign out of Google session
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://accounts.google.com/logout'; // ✅ Fixed: no extra spaces
    document.body.appendChild(iframe);

    // Clean up iframe after use
    setTimeout(() => {
      if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 1000);

    // Notify user
    alert('Your account and data have been deleted.');
  } catch (err) {
    console.error('Failed to delete account:', err);
    alert('Failed to delete account. Please try again.');
  }
};


if (loading) {
  return (
    <div style={{
      color: '#5a67d8',
      textAlign: 'center',
      padding: '2rem',
      fontSize: '1.1rem'
    }}>
      🌱 Loading your sanctuary...
    </div>
  );
}

if (!user) {
  return (
    <div style={{
      color: '#ef4444',
      textAlign: 'center',
      padding: '2rem',
      fontSize: '1.1rem'
    }}>
      ❌ Failed to load profile. Please log in again.
    </div>
  );
}

  return (
    <>
      {/* Global Styles */}
      <style jsx="true">{`
        @keyframes float-pulse {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
            filter: blur(0px);
          }
          10% {
            opacity: 0.8;
            filter: blur(0.5px);
          }
          90% {
            opacity: 0.8;
            filter: blur(0.5px);
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
            filter: blur(1px);
          }
        }

        @keyframes breathe {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(90, 103, 216, 0.2); }
          50% { box-shadow: 0 0 40px rgba(127, 86, 217, 0.3); }
          100% { box-shadow: 0 0 20px rgba(90, 103, 216, 0.2); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0a20, #1a1233, #2a1a45, #1e1438)',
        color: '#e0e7ff',
        fontFamily: 'Satoshi, Segoe UI, sans-serif',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Animated Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.1), transparent 30%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1), transparent 30%)',
          opacity: 0.8,
          pointerEvents: 'none'
        }} />

        {/* Header */}
        <header style={{
          padding: '1.5rem 2rem',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(30, 15, 50, 0.4)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 600,
            background: 'linear-gradient(to right, #a78bfa, #7dd3fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💙 MindSpace
          </h1>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.95rem', color: '#c7d2fe' }}>
              Hi, {user.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#a78bfa',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Logout
            </button>
          </div>
        </header>

       <div style={{
  display: 'flex',
  minHeight: 'calc(100vh - 60px)',
  maxHeight: 'calc(100vh - 60px)',
  overflow: 'hidden'
}}>
          {/* Sidebar */}
          <aside style={{
            width: '260px',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(25, 10, 40, 0.5)',
            borderRight: '1px solid rgba(139, 92, 246, 0.2)',
            padding: '2rem 1.2rem',
            height: '100vh',
            position: 'sticky',
            top: 0,
            zIndex: 5
          }}>
            <nav>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  { id: 'journal', label: '📝 Journal', desc: 'Write your thoughts' },
                  { id: 'chat', label: '💬 AI Companion', desc: 'Talk to your guide' },
                  { id: 'mood', label: '📈 Mood Tracker', desc: 'See your progress' },
                  { id: 'breathing', label: '🧘 Breathing', desc: 'Calm your mind' },
                  { id: 'profile', label: '👤 Profile', desc: 'Your details' }
                ].map((item) => (
                  <li key={item.id} style={{ marginBottom: '1.2rem' }}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        backgroundColor: activeTab === item.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        color: activeTab === item.id ? '#a78bfa' : '#c7d2fe',
                        border: activeTab === item.id ? '1px solid rgba(139, 92, 246, 0.4)' : 'none',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== item.id) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{item.label}</div>
                      <div style={{
                        fontSize: '0.85rem',
                        opacity: 0.7,
                        marginTop: '4px'
                      }}>
                        {item.desc}
                      </div>
                      {activeTab === item.id && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '0 4px 4px 0'
                        }} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
         <main style={{
  flex: 1,
  padding: '2.5rem',
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 60px)',
  position: 'relative'
}}>
            {activeTab === 'journal' && (
  <div style={{
    animation: 'glow 3s infinite'
  }}>
    <h2 style={{
      fontSize: '2rem',
      background: 'linear-gradient(to right, #a78bfa, #60a5fa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1.5rem'
    }}>
      📝 Write a Journal Entry
    </h2>

    {/* Journal Entry Form */}
    <textarea
      placeholder="How are you feeling today? What’s on your mind?"
      value={newEntry} // ← Add this state
      onChange={(e) => setNewEntry(e.target.value)} // ← Add handler
      style={{
        width: '100%',
        minHeight: '320px',
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        backgroundColor: 'rgba(30, 15, 50, 0.4)',
        color: '#e0e7ff',
        fontSize: '1.1rem',
        resize: 'vertical',
        backdropFilter: 'blur(10px)',
        outline: 'none'
      }}
    />

    <button
      onClick={handleSaveEntry} // ← Add this function
      style={{
        marginTop: '1.5rem',
        padding: '14px 32px',
        backgroundColor: 'linear-gradient(120deg, #8b5cf6, #60a5fa)',
        background: 'linear-gradient(120deg, #8b5cf6, #60a5fa)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        fontSize: '1.1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
      }}
    >
      Save Entry
    </button>

    {/* Display Saved Entries Below */}
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ color: '#c7d2fe', marginBottom: '1rem' }}>Your Entries</h3>
      {journalEntries.length === 0 ? (
        <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>No entries yet.</p>
      ) : (
        journalEntries.map((entry) => (
  <div key={entry._id} style={{
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(30, 15, 50, 0.4)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    marginBottom: '1rem'
  }}>
    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#e0e7ff' }}>{entry.title || 'Untitled'}</h3>
    <p style={{ margin: '0.5rem 0', lineHeight: 1.6, color: '#cbd5e1' }}>{entry.content}</p>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.9rem',
      color: '#a0aec0',
      marginTop: '0.5rem'
    }}>
      <span>Mood: {entry.mood} ⭐</span>
      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
    </div>

    {/* ✅ Delete Button */}
    <button
      onClick={() => confirmDelete(entry._id)}
      style={{
        marginTop: '0.5rem',
        padding: '6px 12px',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        color: '#f87171',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
        e.target.style.color = '#fca5a5';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        e.target.style.color = '#f87171';
      }}
    >
      Delete
    </button>
  </div>
))
      )}
    </div>
  </div>
)}

            {activeTab === 'chat' && <ChatBot />}

            {activeTab === 'mood' && (
  <div>
    <h2 style={{
      fontSize: '2rem',
      background: 'linear-gradient(to right, #4ade80, #22d3ee)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1.5rem'
    }}>
      📈 Your Emotional Journey
    </h2>

    {journalEntries.length === 0 ? (
      <div style={{
        border: '1px solid rgba(77, 144, 254, 0.3)',
        borderRadius: '20px',
        padding: '2.5rem',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '1.2rem',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📊</div>
        <div>No journal entries yet.</div>
        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
          Write a few entries to see your mood trend.
        </div>
      </div>
    ) : (
      <div style={{
        border: '1px solid rgba(77, 144, 254, 0.3)',
        borderRadius: '20px',
        padding: '2rem',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <MoodChart data={journalEntries} />
      </div>
    )}
  </div>
)}

           {activeTab === 'breathing' && (
  <div>
    <h2 style={{
      fontSize: '2rem',
      background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '2rem'
    }}>
      🧘 Guided Breathing
    </h2>

    {/* Breathing Circle */}
    <div style={{
      width: '220px',
      height: '220px',
      margin: '3rem auto',
      borderRadius: '50%',
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      border: '2px solid rgba(251, 191, 36, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fbbf24',
      fontSize: '1.3rem',
      fontWeight: 600,
      backdropFilter: 'blur(5px)',
      // Dynamic animation and size
      transform: `scale(${breathingScale})`,
      transition: 'transform 0.3s ease-out'
    }}>
      {breathingPhase === 'inhale' && 'Breathe In'}
      {breathingPhase === 'hold' && 'Hold'}
      {breathingPhase === 'exhale' && 'Breathe Out'}
    </div>

    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>
      {breathingPhase === 'inhale' && 'Inhale for 4 seconds...'}
      {breathingPhase === 'hold' && 'Hold for 4 seconds...'}
      {breathingPhase === 'exhale' && 'Exhale for 6 seconds...'}
    </p>
  </div>
)}

          {activeTab === 'profile' && (
  <div>
    <h2 style={{
      fontSize: '2rem',
      background: 'linear-gradient(to right, #f97316, #ea580c)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1.5rem'
    }}>
      👤 Your Sanctuary
    </h2>

    {/* Profile Picture */}
    <div style={{
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      backgroundColor: '#f97316',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '2rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      overflow: 'hidden',
      border: '3px solid rgba(249, 115, 22, 0.3)'
    }}>
     {user?.profilePic ? (
  <img
    src={user.profilePic}
    alt="Profile"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      cursor: 'zoom-in' // ✅ Show hand cursor
    }}
    onClick={() => setPreviewImage(user.profilePic)} // ✅ Open full-size view
    title="Click to view full size"
  />
) : (
  user?.name?.charAt(0).toUpperCase()
)}
    </div>

    <div style={{
      border: '1px solid rgba(249, 115, 22, 0.3)',
      borderRadius: '20px',
      padding: '2rem',
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(10px)',
      color: '#e0e7ff'
    }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <strong style={{ color: '#f97316' }}>Name:</strong> {user?.name}
      </div>
      <div style={{ marginBottom: '1.2rem' }}>
        <strong style={{ color: '#f97316' }}>Email:</strong> {user?.email}
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <strong style={{ color: '#f97316' }}>Account:</strong> Free Tier
      </div>

      <button
        onClick={() => setEditModalOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: 'linear-gradient(120deg, #f97316, #ea580c)',
          background: 'linear-gradient(120deg, #f97316, #ea580c)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Edit Profile
      </button>
    </div>

    {/* Edit Modal */}
    {editModalOpen && (
      <EditProfileModal
        user={user}
        onSave={handleProfileSave}
        onClose={() => setEditModalOpen(false)}
      />
    )}

{/* Delete Account Button */}
<div style={{
  marginTop: '2rem',
  padding: '1.5rem',
  borderRadius: '16px',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  textAlign: 'center'
}}>
  <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Danger Zone</h3>
  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
    Permanently delete your account and all journal entries.
  </p>
  <button
    onClick={() => setShowDeleteAccountModal(true)}
    style={{
      padding: '10px 20px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 600
    }}
  >
    🗑️ Delete My Account
  </button>
</div>

{/* Delete Account Confirmation Popup */}
{showDeleteAccountModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  }}>
    <div style={{
      width: '90%',
      maxWidth: '400px',
      padding: '1.5rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(30, 15, 50, 0.9)',
      backdropFilter: 'blur(20px)',
      color: '#e0e7ff',
      textAlign: 'center',
      border: '1px solid rgba(139, 92, 246, 0.3)'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', color: '#f87171' }}>
        Delete Account?
      </h3>
      <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Are you sure you want to delete your account? This will permanently remove:
      </p>
      <ul style={{ textAlign: 'left', color: '#fbbf24', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <li>Your profile information</li>
        <li>All journal entries</li>
        <li>Your mood history</li>
      </ul>
      <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        This action <strong>cannot be undone</strong>.
      </p>
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setShowDeleteAccountModal(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#c7d2fe',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteAccount}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


    
  </div>
)}


            {/* Delete Confirmation Popup */}
{deleteConfirm && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  }}>
    <div style={{
      width: '90%',
      maxWidth: '400px',
      padding: '1.5rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(30, 15, 50, 0.9)',
      backdropFilter: 'blur(20px)',
      color: '#e0e7ff',
      textAlign: 'center',
      border: '1px solid rgba(139, 92, 246, 0.3)'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Delete Entry?</h3>
      <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Are you sure you want to delete this journal entry? This action cannot be undone.
      </p>
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
      }}>
        <button
          onClick={cancelDelete}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#c7d2fe',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteEntry}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{/* Image Preview Modal */}
{previewImage && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000,
      cursor: 'zoom-out',
      backdropFilter: 'blur(4px)'
    }}
    onClick={() => setPreviewImage(null)}
    onKeyDown={(e) => {
      if (e.key === 'Escape') setPreviewImage(null);
    }}
    tabIndex={0}
    role="button"
    aria-label="Close full-size image preview"
  >
    {/* Image */}
    <img
      src={previewImage}
      alt="Full size preview"
      style={{
        width: 'auto',
        height: 'auto',
        maxHeight: '90vh',
        maxWidth: '90vw',
        minWidth: '60%',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        objectFit: 'contain',
        outline: 'none',
        transition: 'transform 0.2s ease',
        cursor: 'zoom-out'
      }}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
      }}
    />

    {/* Close Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setPreviewImage(null);
      }}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.4)',
        border: 'none',
        color: 'white',
        fontSize: '2.5rem',
        fontWeight: 'normal',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 3001,
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        e.target.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        e.target.style.transform = 'scale(1)';
      }}
      aria-label="Close image"
    >
      ×
    </button>

    {/* Optional: Caption */}
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#e0e7ff',
        fontSize: '0.9rem',
        textAlign: 'center',
        maxWidth: '80%',
        opacity: 0.8
      }}
    >
      Click anywhere outside or press <strong>Esc</strong> to close.
    </div>
  </div>
)}


          </main>
        </div>
      </div>
    </>
  );
}

export default Dashboard;