import { useState, useEffect } from 'react';
import { useAxios } from '../hooks/useAxios';
import Navbar from '../components/Navbar';
import ReportModal from '../components/ReportModal';
import { Play, Image as ImageIcon, Calendar, FileText, Search, Clock } from 'lucide-react';

export const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const api = useAxios();

  const fetchHistory = async () => {
    try {
      const response = await api.get('/detection/history');
      setHistory(response.data);
      setFilteredHistory(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = history;

    if (searchQuery) {
      result = result.filter(item => 
        item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(item => item.media_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    setFilteredHistory(result);
  }, [searchQuery, typeFilter, statusFilter, history]);

  const openReport = async (id) => {
    try {
      const response = await api.get(`/detection/status/${id}`);
      setSelectedAnalysis(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>Loading Detection Archives...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Navbar title="Analysis Archives" />

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by filename..."
            style={{ paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Media Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type:</span>
          <select 
            className="form-input" 
            style={{ width: '130px', padding: '0.5rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Media</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select 
            className="form-input" 
            style={{ width: '130px', padding: '0.5rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All States</option>
            <option value="completed">Completed</option>
            <option value="processing">Scanning</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* History Grid/Table */}
      <div className="glass-card">
        {filteredHistory.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Media Type</th>
                <th>Scan Date</th>
                <th>Status</th>
                <th>Fake Probability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.file_name}>
                    {item.file_name}
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {item.media_type === 'video' ? <Play size={14} /> : <ImageIcon size={14} />}
                      <span style={{ textTransform: 'capitalize' }}>{item.media_type}</span>
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {formatDate(item.created_at)}
                    </div>
                  </td>
                  <td>
                    {item.status === 'completed' && <span className="badge badge-success">Completed</span>}
                    {item.status === 'processing' && <span className="badge badge-warning">Scanning</span>}
                    {item.status === 'pending' && <span className="badge badge-warning">Queued</span>}
                    {item.status === 'failed' && <span className="badge badge-danger">Failed</span>}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {item.status === 'completed' ? (
                      <span style={{ color: item.fake_probability > 50.0 ? 'var(--danger)' : 'var(--success)' }}>
                        {item.fake_probability}%
                      </span>
                    ) : '--'}
                  </td>
                  <td>
                    {item.status === 'completed' ? (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => openReport(item.id)}
                      >
                        Details
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
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No logs found matching specified filters.
          </div>
        )}
      </div>

      {/* Verification Certificate Overlay */}
      {selectedAnalysis && (
        <ReportModal 
          analysis={selectedAnalysis} 
          onClose={() => setSelectedAnalysis(null)} 
        />
      )}
    </div>
  );
};

export default History;
