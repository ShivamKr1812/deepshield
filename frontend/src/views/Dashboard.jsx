import { useState, useEffect } from 'react';
import { useAxios } from '../hooks/useAxios';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import ReportModal from '../components/ReportModal';
import { 
  FileText, 
  AlertTriangle, 
  Percent, 
  Upload, 
  Play, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const api = useAxios();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const openReport = async (id) => {
    try {
      const response = await api.get(`/detection/status/${id}`);
      setSelectedAnalysis(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>Loading Dashboard Intelligence...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <Navbar title="Dashboard" />
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', color: 'var(--danger)' }}>
          {error}
        </div>
      </div>
    );
  }

  // Calculate max daily counts to scale chart
  const maxDailyCount = stats ? Math.max(
    ...stats.detection_history_chart.map(d => Math.max(d.real_count, d.fake_count, 1))
  ) : 10;

  return (
    <div className="main-content">
      <Navbar title="Dashboard" />

      {/* Metrics Widgets */}
      <div className="metrics-grid">
        <StatCard 
          title="Total Analyses" 
          value={stats.total_analyses} 
          icon={FileText} 
          color="primary"
          description="Uploaded media scans completed"
        />
        <StatCard 
          title="Fake Media Detected" 
          value={stats.fake_media_detected} 
          icon={AlertTriangle} 
          color="danger"
          description="Files classified above 50% probability"
        />
        <StatCard 
          title="Fake Ratio" 
          value={`${stats.fake_ratio_percent}%`} 
          icon={Percent} 
          color="cyan"
          description="Percentage of compromised files"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', marginTop: '2rem' }} className="dash-grid">
        {/* Left: Interactive History Bar Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Detection History (Last 7 Days)</h3>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1.5rem', paddingBottom: '10px', borderBottom: '1px solid var(--border-glass)' }}>
            {stats.detection_history_chart.map((day, idx) => {
              const realHeight = (day.real_count / maxDailyCount) * 100;
              const fakeHeight = (day.fake_count / maxDailyCount) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '4px', width: '100%', height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {/* Real bar */}
                    <div 
                      style={{ 
                        width: '12px', 
                        height: `${realHeight}%`, 
                        background: 'var(--success)', 
                        borderRadius: '2px 2px 0 0',
                        position: 'relative'
                      }}
                      title={`${day.real_count} Authentic`}
                    ></div>
                    {/* Fake bar */}
                    <div 
                      style={{ 
                        width: '12px', 
                        height: `${fakeHeight}%`, 
                        background: 'var(--danger)', 
                        borderRadius: '2px 2px 0 0',
                        position: 'relative'
                      }}
                      title={`${day.fake_count} Deepfakes`}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '2px' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Verified Authentic</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '2px' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Deepfakes</span>
            </div>
          </div>
        </div>

        {/* Right: Quick actions and prompt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(6, 182, 212, 0.15))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ fontSize: '1.1rem' }}>Scan New Media</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
              Verify standard media items against visual manipulation. Our PyTorch neural network scans color anomalies, pixel coherence, and noise distributions.
            </p>
            <Link to="/detect" className="btn btn-primary" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
              <Upload size={16} /> Open Scan Laboratory
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Scan Activity</h3>
        {stats.recent_uploads.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Media Item</th>
                <th>Type</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th>Fake Probability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_uploads.map((upload) => (
                <tr key={upload.id}>
                  <td style={{ fontWeight: 600 }}>{upload.file_name}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {upload.media_type === 'video' ? <Play size={14} /> : <ImageIcon size={14} />}
                      <span style={{ textTransform: 'capitalize' }}>{upload.media_type}</span>
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {upload.created_at}
                    </div>
                  </td>
                  <td>
                    {upload.status === 'completed' && (
                      <span className="badge badge-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Success</span>
                    )}
                    {upload.status === 'processing' && (
                      <span className="badge badge-warning" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Scanning</span>
                    )}
                    {upload.status === 'pending' && (
                      <span className="badge badge-warning" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Queued</span>
                    )}
                    {upload.status === 'failed' && (
                      <span className="badge badge-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Failed</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {upload.status === 'completed' ? (
                      <span style={{ color: upload.fake_probability > 50.0 ? 'var(--danger)' : 'var(--success)' }}>
                        {upload.fake_probability}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>--</span>
                    )}
                  </td>
                  <td>
                    {upload.status === 'completed' ? (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => openReport(upload.id)}
                      >
                        View Certificate
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem 0', textGrid: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
            No recent uploads. Click "Scan New Media" to begin.
          </div>
        )}
      </div>

      {/* Authenticity Certificate Modal */}
      {selectedAnalysis && (
        <ReportModal 
          analysis={selectedAnalysis} 
          onClose={() => setSelectedAnalysis(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
