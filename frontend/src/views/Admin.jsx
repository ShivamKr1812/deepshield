import { useState, useEffect } from 'react';
import { useAxios } from '../hooks/useAxios';
import Navbar from '../components/Navbar';
import { 
  Users, 
  Cpu, 
  Terminal, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert, 
  HardDrive,
  Database,
  CheckCircle,
  XCircle,
  Activity,
  AlertCircle
} from 'lucide-react';

export const Admin = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = useAxios();

  const fetchAdminData = async () => {
    try {
      const [metricsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users'),
        api.get('/admin/logs')
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
      setError('Insufficient permissions or failed connection to administration APIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // Poll metrics every 10 seconds for diagnostic updates
    const interval = setInterval(async () => {
      try {
        const metricsRes = await api.get('/admin/metrics');
        setMetrics(metricsRes.data);
      } catch (err) {
        console.error("Polled metrics failed", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/toggle`);
      // Update local users state list
      setUsers(users.map(u => u.id === userId ? response.data : u));
      // Re-fetch logs to see action immediately
      const logsRes = await api.get('/admin/logs');
      setLogs(logsRes.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to toggle user status.');
    }
  };

  const formatLogDetails = (details) => {
    if (!details) return '';
    try {
      return JSON.stringify(details);
    } catch {
      return '';
    }
  };

  const getUsageColor = (val) => {
    if (val > 80) return 'var(--danger)';
    if (val > 50) return 'var(--warning)';
    return 'var(--success)';
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>Syncing Administrative Control Console...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <Navbar title="Administration Core" />
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Navbar title="Administration Console" />

      {/* Diagnostics Dashboard */}
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Server System Diagnostics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* CPU Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>CPU Processor Load</span>
            <Cpu size={18} className="text-cyan" style={{ color: 'var(--cyan)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: getUsageColor(metrics?.cpu_usage) }}>
            {metrics?.cpu_usage.toFixed(1)}%
          </div>
          <div className="progress-container" style={{ margin: '0.75rem 0' }}>
            <div style={{
              height: '100%',
              backgroundColor: getUsageColor(metrics?.cpu_usage),
              width: `${metrics?.cpu_usage}%`,
              borderRadius: 'inherit',
              transition: 'width 0.4s ease'
            }}></div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Multi-core processor utilization thread metrics</span>
        </div>

        {/* RAM Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>System Memory Allocation</span>
            <HardDrive size={18} className="text-cyan" style={{ color: 'var(--cyan)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: getUsageColor(metrics?.memory_usage) }}>
            {metrics?.memory_usage.toFixed(1)}%
          </div>
          <div className="progress-container" style={{ margin: '0.75rem 0' }}>
            <div style={{
              height: '100%',
              backgroundColor: getUsageColor(metrics?.memory_usage),
              width: `${metrics?.memory_usage}%`,
              borderRadius: 'inherit',
              transition: 'width 0.4s ease'
            }}></div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Virtual RAM footprint distribution</span>
        </div>

        {/* Worker Diagnostics */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Celery Worker Hub</span>
            <Activity size={18} className="text-cyan" style={{ color: 'var(--cyan)' }} />
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            color: metrics?.worker_status === 'Active' ? 'var(--success)' : 'var(--warning)',
            marginTop: '0.2rem'
          }}>
            {metrics?.worker_status}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Active Users: </span>
              <strong>{metrics?.active_users_count}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>System Scans: </span>
              <strong>{metrics?.total_analyses_count}</strong>
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="dash-grid">
        
        {/* User Management Module */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} className="text-cyan" style={{ color: 'var(--cyan)' }} />
            <span>User Accounts Control</span>
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Toggle State</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.full_name || 'Guest User'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.email}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: 600 }}>{item.role}</span>
                    </td>
                    <td>
                      {item.is_active ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>Active</span>
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>Suspended</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleUser(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.is_active ? 'var(--success)' : 'var(--danger)' }}
                      >
                        {item.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs System Feed */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} className="text-cyan" style={{ color: 'var(--cyan)' }} />
            <span>Audit Logs Console Feed</span>
          </h3>
          
          <div style={{ 
            flex: 1, 
            background: 'rgba(0, 0, 0, 0.4)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '1rem', 
            fontFamily: 'monospace', 
            fontSize: '0.8rem',
            overflowY: 'auto',
            maxHeight: '380px',
            border: '1px solid var(--border-glass)'
          }}>
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} style={{ marginBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--cyan)', marginBottom: '0.15rem' }}>
                    <span>[{log.action.toUpperCase()}]</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    Actor: <span style={{ color: 'var(--text-secondary)' }}>{log.user_email || 'System / Guest'}</span>
                  </div>
                  {log.ip_address && (
                    <div style={{ color: 'var(--text-muted)' }}>IP: {log.ip_address}</div>
                  )}
                  {log.details && (
                    <div style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Payload: {formatLogDetails(log.details)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                No operations logs captured in this session.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
