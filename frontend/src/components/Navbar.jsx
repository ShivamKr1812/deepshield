import { Activity } from 'lucide-react';

export const Navbar = ({ title }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '2.5rem',
      borderBottom: '1px solid var(--border-glass)',
      marginBottom: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{title}</h1>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        padding: '0.4rem 0.8rem',
        borderRadius: '50px',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--success)'
      }}>
        <Activity size={14} />
        <span>Detector Engine Active</span>
      </div>
    </header>
  );
};

export default Navbar;
