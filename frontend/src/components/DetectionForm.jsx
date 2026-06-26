import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileVideo, FileImage, AlertCircle, RefreshCw, Check, Trash2 } from 'lucide-react';
import { useAxios } from '../hooks/useAxios';

// Helper utilities for file properties and metrics formatting
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatSpeed = (bytesPerSec) => {
  if (bytesPerSec === 0 || isNaN(bytesPerSec)) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s'];
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
  return (bytesPerSec / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

const formatRemainingTime = (seconds) => {
  if (seconds === Infinity || isNaN(seconds) || seconds <= 0) return 'estimating...';
  if (seconds < 60) return `${seconds}s remaining`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s remaining`;
};

export const DetectionForm = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [eta, setEta] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fileInputRef = useRef(null);
  const startTime = useRef(null);
  const abortControllerRef = useRef(null);
  const api = useAxios();

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e) => {
    setError(null);
    if (e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    setUploadSuccess(false);

    const name = selectedFile.name.toLowerCase();
    const isImage = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');
    const isVideo = name.endsWith('.mp4');

    // 1. Extension Verification
    if (!isImage && !isVideo) {
      setError('Unsupported file format. Please upload JPG, JPEG, PNG (up to 10 MB) or MP4 (up to 100 MB).');
      clearSelection();
      return;
    }

    // 2. Max File Size Enforcement
    if (isImage && selectedFile.size > 10 * 1024 * 1024) {
      setError('Image size exceeds the 10 MB limit.');
      clearSelection();
      return;
    }

    if (isVideo && selectedFile.size > 100 * 1024 * 1024) {
      setError('Video size exceeds the 100 MB limit.');
      clearSelection();
      return;
    }

    setFile(selectedFile);

    // 3. Extract Metadata & Create Local Previews
    const localUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(localUrl);

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        setMetadata({
          resolution: `${img.width} × ${img.height}`,
          size: formatBytes(selectedFile.size),
          type: 'Image'
        });
      };
      img.src = localUrl;
    } else if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setMetadata({
          resolution: `${video.videoWidth} × ${video.videoHeight}`,
          duration: formatDuration(video.duration),
          size: formatBytes(selectedFile.size),
          type: 'Video'
        });
      };
      video.src = localUrl;
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelection = () => {
    setFile(null);
    setMetadata(null);
    setUploadProgress(0);
    setUploadSpeed('');
    setEta(null);
    setUploadSuccess(false);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setAnalyzing(false);
    setUploadProgress(0);
    setUploadSpeed('');
    setEta(null);
    setUploadSuccess(false);
    setStatusText('');
    setError('Upload cancelled by user.');
  };

  const uploadAndAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadSpeed('0 B/s');
    setEta(null);
    setStatusText('Uploading media to scanner database...');

    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    startTime.current = Date.now();

    try {
      // 1. Upload File with progress metrics computation
      const response = await api.post('/detection/upload', formData, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || file.size;
          const percentCompleted = Math.round((loaded * 100) / total);

          setUploadProgress(percentCompleted);

          // Calculate upload speed and remaining time (ETA)
          const timeElapsed = (Date.now() - startTime.current) / 1000; // in seconds
          if (timeElapsed > 0) {
            const speedBytes = loaded / timeElapsed;
            const remainingBytes = total - loaded;
            const etaSeconds = speedBytes > 0 ? Math.ceil(remainingBytes / speedBytes) : 0;

            setUploadSpeed(formatSpeed(speedBytes));
            setEta(etaSeconds);
          }
        }
      });

      setUploadSuccess(true);
      setStatusText('Upload completed successfully. Processing file with PyTorch AI engine...');
      const analysisId = response.data.id;

      // 2. Poll Status
      pollAnalysisStatus(analysisId);

    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        // Handled internally by cancelUpload
        return;
      }
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload or analyze the file.');
      setAnalyzing(false);
      setUploadProgress(0);
      setUploadSpeed('');
      setEta(null);
    }
  };

  const pollAnalysisStatus = (id) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      try {
        attempts++;
        const statusResponse = await api.get(`/detection/status/${id}`);
        const data = statusResponse.data;

        if (data.status === 'completed') {
          clearInterval(interval);
          setAnalyzing(false);
          clearSelection();
          onAnalysisComplete(data);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.report?.error || 'PyTorch deepfake classification failed.');
          setAnalyzing(false);
          setUploadProgress(0);
          setStatusText('');
        } else {
          if (data.status === 'processing') {
            setStatusText('Neural network scanning features... (Extracting crops)');
          } else {
            setStatusText('Queueing task for Celery worker...');
          }
        }

        // Safeguard timeout (max 3 minutes)
        if (attempts > 120) {
          clearInterval(interval);
          setError('Analysis timed out. Please check history later.');
          setAnalyzing(false);
        }

      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setError('Error polling scanner status.');
        setAnalyzing(false);
      }
    }, 1500);
  };

  return (
    <div className="glass-card dd-upload-container" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <h3 style={{ marginBottom: '0.5rem', textAlign: 'center', fontWeight: '700', fontSize: '1.25rem' }}>Upload Scanner</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        Submit files to inspect for synthesized metadata alterations or adversarial prompt attacks.
      </p>

      {!analyzing ? (
        <>
          {/* Dropzone Render */}
          {!file && (
            <div
              className={`dd-upload-zone ${isDragOver ? 'dragover' : ''} ${error ? 'has-error' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              tabIndex={0}
              role="button"
              aria-label="Upload File Dropzone"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileInput(); } }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".jpg,.jpeg,.png,.mp4"
              />

              <UploadCloud size={40} className="text-muted" style={{ color: 'var(--text-muted)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#ffffff' }}>
                  Drag and drop media here
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  or <button type="button" className="btn-browse" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>Browse Files</button>
                </span>
              </div>

              {/* Supported Format Guidelines */}
              <div style={{ marginTop: '0.75rem', width: '100%' }}>
                <span className="format-badges-title">Supported Formats</span>
                <div className="badge-flex" style={{ marginTop: '0.5rem' }}>
                  <span className="badge-saas-info">
                    🖼 JPG • JPEG • PNG (Max 10 MB)
                  </span>
                  <span className="badge-saas-info">
                    🎥 MP4 (Max 100 MB)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Failure Indicator */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem',
              color: 'var(--danger)',
              background: 'var(--danger-glow)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              fontSize: '0.85rem',
              lineHeight: '1.4'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Local Preview Pane */}
          {file && previewUrl && (
            <div>
              <div className="preview-card">
                <div className="preview-media-wrapper">
                  {file.name.toLowerCase().endsWith('.mp4') ? (
                    <video src={previewUrl} controls className="preview-media-element" />
                  ) : (
                    <img src={previewUrl} alt="Upload Thumbnail" className="preview-media-element" />
                  )}
                </div>

                <div className="preview-info">
                  <div className="preview-title" title={file.name}>
                    {file.name}
                  </div>

                  {metadata && (
                    <div className="preview-metadata-grid">
                      <div className="preview-metadata-item">
                        Format: <span className="preview-metadata-value">{metadata.type}</span>
                      </div>
                      <div className="preview-metadata-item">
                        Resolution: <span className="preview-metadata-value">{metadata.resolution}</span>
                      </div>
                      {metadata.duration && (
                        <div className="preview-metadata-item">
                          Duration: <span className="preview-metadata-value">{metadata.duration}</span>
                        </div>
                      )}
                      <div className="preview-metadata-item">
                        Size: <span className="preview-metadata-value">{metadata.size}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearSelection}
                  style={{ padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove file"
                  aria-label="Remove file"
                >
                  <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                </button>
              </div>

              {/* Action Trigger Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={uploadAndAnalyze}
                >
                  Run AI Deepfake Scan
                </button>
                <button className="btn btn-secondary" onClick={clearSelection}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Progress & Polling Indicators */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>

          {/* Scan Running spinner or success indicator */}
          {!uploadSuccess ? (
            <RefreshCw className="spin text-cyan" size={40} style={{
              color: 'var(--cyan)',
              animation: 'spin 2s linear infinite',
              marginBottom: '1rem'
            }} />
          ) : (
            <div style={{
              background: 'var(--success-glow)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              padding: '0.5rem',
              borderRadius: '50%',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Check size={24} />
            </div>
          )}

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>

          <span style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ffffff' }}>
            {!uploadSuccess ? 'Uploading File' : 'Running Core Diagnostics'}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '0 1rem' }}>
            {statusText}
          </span>

          {/* Upload Progress Details */}
          {!uploadSuccess && (
            <div style={{ width: '100%', marginTop: '1.5rem' }}>
              <div className="progress-details">
                <span className="progress-status">{uploadProgress}% uploaded</span>
                <div className="progress-stats-group">
                  <span>{uploadSpeed}</span>
                  <span>•</span>
                  <span>{formatRemainingTime(eta)}</span>
                </div>
              </div>

              <div className="progress-container" style={{ margin: '0.5rem 0 1.25rem 0' }}>
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-cancel-upload"
                  onClick={cancelUpload}
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          )}

          {/* Polling Spinner after upload completion */}
          {uploadSuccess && (
            <div style={{ width: '100%', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', marginBottom: '1rem' }}>
                ✓ Upload completed successfully.
              </span>
              <RefreshCw className="spin" size={24} style={{
                color: 'var(--primary)',
                animation: 'spin 1.5s linear infinite'
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetectionForm;
