import { useState } from 'react';
import Navbar from '../components/Navbar';
import DetectionForm from '../components/DetectionForm';
import ReportModal from '../components/ReportModal';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const Detection = () => {
  const [report, setReport] = useState(null);

  const handleAnalysisComplete = (data) => {
    setReport(data);
  };

  return (
    <div className="main-content">
      <Navbar title="Deepfake Detection Workbench" />

      <div style={{ display: 'grid', gridTemplateColumns: report ? '1fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.5s ease' }}>
        
        {/* Left side: Upload Scanner Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <DetectionForm onAnalysisComplete={handleAnalysisComplete} />
          
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Forensics Process Walkthrough</h4>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
              <li>
                <strong>Preprocessing:</strong> Media files are normalized to standard tensor layouts matching ImageNet profiles (224x224 RGB coordinates).
              </li>
              <li>
                <strong>Spatial Analysis:</strong> The PyTorch convolutional layers verify local gradients for high-frequency patterns (detecting GAN blending boundaries).
              </li>
              <li>
                <strong>Temporal Evaluation (Videos):</strong> Celery background worker splits video streams into regular sample frames, scanning face meshes across sequential frames to extract coherence metrics.
              </li>
            </ul>
          </div>
        </div>

        {/* Right side: Quick report preview on completion */}
        {report && (
          <div className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1.1rem' }}>Scan Outcome</h4>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setReport(null)}
              >
                Clear
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {report.fake_probability > 50.0 ? (
                <div style={{ background: 'var(--danger-glow)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '50%' }}>
                  <ShieldAlert size={28} />
                </div>
              ) : (
                <div style={{ background: 'var(--success-glow)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem', borderRadius: '50%' }}>
                  <ShieldCheck size={28} />
                </div>
              )}
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Result Status</span>
                <strong style={{ color: report.fake_probability > 50.0 ? 'var(--danger)' : 'var(--success)', fontSize: '1.1rem' }}>
                  {report.fake_probability > 50.0 ? 'SUSPECTED DEEPFAKE' : 'VERIFIED AUTHENTIC'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fake Probability</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: report.fake_probability > 50.0 ? 'var(--danger)' : 'var(--success)' }}>
                  {report.fake_probability}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scanner Confidence</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {(report.confidence_score * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => setReport(report)}
            >
              Open Printable Laboratory Certificate
            </button>
          </div>
        )}
      </div>

      {/* Main Certificate View Overlay */}
      {report && (
        <ReportModal analysis={report} onClose={() => setReport(null)} />
      )}
    </div>
  );
};

export default Detection;
