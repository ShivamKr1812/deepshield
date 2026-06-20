import { Printer, X, ShieldAlert, ShieldCheck, Download, Calendar, Cpu, Shield } from 'lucide-react';

export const ReportModal = ({ analysis, onClose }) => {
  if (!analysis) return null;

  const {
    id,
    file_name,
    media_type,
    fake_probability,
    confidence_score,
    model_version,
    confidence_metrics,
    created_at,
    report
  } = analysis;

  // Predict Category Mappings
  const getCategoryDetails = (prob) => {
    if (prob <= 40.0) {
      return { 
        label: 'Real', 
        badgeClass: 'badge-success', 
        color: 'var(--success)', 
        glow: 'var(--success-glow)',
        description: 'Authentic content with standard camera signature features.' 
      };
    } else if (prob <= 60.0) {
      return { 
        label: 'Uncertain', 
        badgeClass: 'badge-warning', 
        color: 'var(--warning)', 
        glow: 'rgba(245, 158, 11, 0.15)',
        description: 'Borderline prediction. Background noise or lighting issues.'
      };
    } else if (prob <= 80.0) {
      return { 
        label: 'Suspicious', 
        badgeClass: 'badge-danger', 
        color: 'var(--danger)', 
        glow: 'var(--danger-glow)',
        description: 'Potential local anomalies or visual incoherence patterns.'
      };
    } else {
      return { 
        label: 'Likely Fake', 
        badgeClass: 'badge-danger', 
        color: '#ff3f5f', 
        glow: 'rgba(255, 63, 95, 0.25)',
        description: 'Significant manipulation features corresponding to deepfake algorithms.'
      };
    }
  };

  const cat = getCategoryDetails(fake_probability);

  // Asset URL Helper
  const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    
    const backendBase = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${backendBase}${path}`;
  };
  
  // Format Date
  const dateFormatted = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `authenticity_report_${id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" id="report-modal" style={{ maxWidth: '900px' }}>
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          className="no-print"
        >
          <X size={24} />
        </button>

        {/* Certificate Header */}
        <div className="certificate-header">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={24} className="text-cyan" style={{ color: 'var(--cyan)' }} />
              DeepShield AI
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              MEDIA FORENSICS LABORATORY DEEPFAKE DETECTION VERIFICATION REPORT
            </span>
          </div>
          
          <div className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handleDownloadJSON} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              <Download size={14} /> JSON
            </button>
            <button className="btn btn-primary" onClick={handlePrint} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              <Printer size={14} /> Print Certificate
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2.5rem', marginTop: '1rem' }} className="cert-grid">
          {/* Left Column: Visual Stamps, Scores & GradCAM */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', borderRight: '1px solid rgba(255, 255, 255, 0.05)', paddingRight: '2rem' }} className="cert-left">
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: cat.glow,
                border: `2px solid ${cat.color}`,
                color: cat.color,
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: `0 0 15px ${cat.glow}`
              }}>
                {fake_probability > 50.0 ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
              </div>
              <span className={`badge`} style={{ backgroundColor: cat.glow, color: cat.color, border: `1px solid ${cat.color}` }}>
                {cat.label}
              </span>
            </div>

            <div style={{ textAlign: 'center', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fake Probability</span>
              <div className="score-circle-container" style={{ margin: '1rem 0' }}>
                <div className={`score-circle`} style={{ borderColor: cat.color }}>
                  <span className="score-value" style={{ color: cat.color }}>
                    {fake_probability}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</span>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>
                Confidence Score: <strong>{(confidence_score * 100).toFixed(1)}%</strong>
              </span>
            </div>

            {/* GradCAM Heatmap Overlay */}
            {(report?.gradcam_img_url || analysis.report?.gradcam_img_url) && (
              <div style={{ width: '100%', marginTop: '0.5rem', textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GradCAM Attention Map
                </span>
                <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0a0f1d' }}>
                  <img 
                    src={getAssetUrl(report?.gradcam_img_url || analysis.report?.gradcam_img_url)} 
                    alt="GradCAM Heatmap Overlay" 
                    style={{ width: '100%', display: 'block', height: 'auto' }} 
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem', lineHeight: '1.3' }}>
                  Thermal colors highlight anomalies contributing to the authenticity score.
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Dataset Metrics */}
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem', color: 'white' }}>
              Forensic Metadata Breakdown
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }} className="details-table">
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analysis ID</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'monospace' }}>{id}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>File Name</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-all' }}>{file_name}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Media Layout</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{media_type}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Model Classifier</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: 'var(--cyan)' }}>{model_version || "EfficientNet-B4 v1.0"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Calibration Method</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>Temperature Scaling (T=1.35)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Classification Result</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700, fontSize: '0.9rem', color: cat.color }}>{cat.label} ({fake_probability}%)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Evaluation Date</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <Calendar size={14} /> {dateFormatted}
                    </div>
                  </td>
                </tr>
                {report && (
                  <>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Visual Dimensions</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>{report.resolution || 'Normalized (224x224)'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Compression Artifacts</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: report.compression_artifacts === 'High' ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {report.compression_artifacts}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Facial Coherence</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: report.facial_coherence === 'Inconsistent' ? 'var(--danger)' : 'var(--success)' }}>
                        {report.facial_coherence}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            {/* Dataset Compatibility Benchmark */}
            {(report?.dataset_scores || analysis.report?.dataset_scores) && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dataset Authenticity Benchmarking
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(report?.dataset_scores || analysis.report?.dataset_scores || {}).map(([dataset, score]) => {
                    const dCat = getCategoryDetails(score);
                    return (
                      <div key={dataset}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{dataset}</span>
                          <span style={{ fontWeight: 600, color: dCat.color }}>{score}% Compatibility Match</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${score}%`, background: dCat.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multiple Detected Faces details */}
            {(report?.faces_detailed || analysis.report?.faces_detailed) && (report?.faces_detailed?.length > 0 || analysis.report?.faces_detailed?.length > 0) && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Detected Faces Crops ({ (report?.faces_detailed || analysis.report?.faces_detailed).length } targets)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {(report?.faces_detailed || analysis.report?.faces_detailed).map((face, idx) => {
                    const fCat = getCategoryDetails(face.fake_probability);
                    return (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Face #{idx + 1}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: fCat.color }}>{face.fake_probability}%</span>
                        </div>
                        {face.gradcam_img_url && (
                          <div style={{ borderRadius: '4px', overflow: 'hidden', height: '70px', background: '#070a13' }}>
                            <img src={getAssetUrl(face.gradcam_img_url)} alt={`Face ${idx+1} GradCAM`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                          Category: <strong style={{ color: fCat.color }}>{fCat.label}</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Timeline Chart */}
        {media_type === 'video' && report?.frame_by_frame_timeline && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} className="text-cyan" style={{ color: 'var(--cyan)' }} />
              Frame-by-Frame Authenticity Analysis Timeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Timeline of analyzed frames. Red spikes indicate suspect visual components within individual frames.
            </p>
            
            <div className="timeline-chart">
              {report.frame_by_frame_timeline.map((frameData) => {
                const fCat = getCategoryDetails(frameData.fake_probability);
                return (
                  <div key={frameData.frame} className="timeline-bar-wrapper">
                    <div 
                      className={`timeline-bar`}
                      style={{ 
                        height: `${frameData.fake_probability}%`,
                        backgroundColor: fCat.color
                      }}
                    ></div>
                    <div className="timeline-tooltip">
                      Frame {frameData.frame} ({frameData.timestamp_sec}s): {frameData.fake_probability}% Fake ({fCat.label})
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Start (0.00s)</span>
              <span>Duration: {report.video_duration_sec}s (Total frames analyzed: {report.total_frames_analyzed})</span>
              <span>End ({report.video_duration_sec}s)</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            DeepShield AI Laboratory Security Protocol Code: {id.slice(0, 18).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
