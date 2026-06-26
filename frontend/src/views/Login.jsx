import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Cannot connect to the backend server. Please verify it is running on port 8000.');
      } else {
        setError(err.response.data?.detail || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>
      
      <div className="glass-card auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={40} className="text-cyan" style={{ color: 'var(--cyan)' }} />
          </div>
          <h2 className="auth-logo">DeepShield AI</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Media Verification & Deepfake Forensics
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--danger)',
            background: 'var(--danger-glow)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--cyan)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }} disabled={submitting}>
            {submitting ? (
              <>
                <Loader size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.0rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
