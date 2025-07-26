// client/src/components/Auth/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  const navigate = useNavigate();
  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Register error:', err.message);
      }
      setError('Registration failed. Email may already be in use.');
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Create soft floating particles (like gentle breaths)
  useEffect(() => {
    const createBreathParticles = () => {
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 2 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;

        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        document.body.appendChild(particle);

        setTimeout(() => {
          if (particle && particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, duration * 1000 + delay * 1000);
      }
    };

    const interval = setInterval(createBreathParticles, 4000);
    createBreathParticles();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-card">
      <div className="login-header">
        <h1>💙 MindSpace</h1>
        <p>Create your safe space to reflect and heal</p>
      </div>

      <div className="login-body">
        {error && (
          <div style={{
            backgroundColor: '#4c1d95',
            color: '#ddd6fe',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Alex Johnson"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">Choose a Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="••••••••"
              required
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={togglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: 'absolute',
                right: '12px',
                top: '40px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = 1;
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = 0.7;
                e.target.style.transform = 'scale(1)';
              }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(250, 70%, 60%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(250, 70%, 60%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>

      <div className="login-footer">
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="link">
          Log In
        </button>
      </div>

{/* Google Login Button */}
<div style={{ marginTop: '1.5rem' }}>
  <a
   href="https://mindspace-backend.onrender.com/api/auth/google"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '12px 16px',
      backgroundColor: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '12px',
      fontSize: '0.95rem',
      fontWeight: 500,
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background 0.3s ease'
    }}
    onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
    onMouseLeave={(e) => (e.target.style.background = '#fff')}
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
      alt="Google"
      style={{ width: '20px', height: '20px' }}
    />
    Continue with Google
  </a>
</div>

    </div>
  );
}



export default Register;