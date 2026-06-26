import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Cannot connect to the backend server. Please verify it is running on port 8000.');
      } else {
        setError(err.response.data?.detail || 'Registration failed. Email might be in use.');
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
            Create Your Laboratory Account
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
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? (
              <>
                <Loader size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite', marginRight: '0.5rem' }} />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.0rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
