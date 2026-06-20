import { useState, useRef } from 'react';
import { UploadCloud, FileVideo, FileImage, AlertCircle, RefreshCw } from 'lucide-react';
import { useAxios } from '../hooks/useAxios';

export const DetectionForm = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);
  const api = useAxios();

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
    const name = selectedFile.name.toLowerCase();
    const isImage = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp') || name.endsWith('.bmp');
    const isVideo = name.endsWith('.mp4') || name.endsWith('.avi') || name.endsWith('.mov') || name.endsWith('.mkv') || name.endsWith('.webm');

    if (!isImage && !isVideo) {
      setError('Unsupported file type. Please upload a valid image or video.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const uploadAndAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setUploadProgress(10);
    setStatusText('Uploading media to scanner database...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload File
      const response = await api.post('/detection/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(10 + percentCompleted);
        }
      });

      const analysisId = response.data.id;
      setUploadProgress(100);
      setStatusText('Processing file with PyTorch AI engine...');
      
      // 2. Poll Status
      pollAnalysisStatus(analysisId);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload or analyze the file.');
      setAnalyzing(false);
      setUploadProgress(0);
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
          setFile(null);
          setUploadProgress(0);
          setStatusText('');
          onAnalysisComplete(data);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.report?.error || 'PyTorch deepfake classification failed.');
          setAnalyzing(false);
          setUploadProgress(0);
          setStatusText('');
        } else {
          // Update status message based on status
          if (data.status === 'processing') {
            setStatusText('Neural network scanning features... (Extracting crops)');
          } else {
            setStatusText('Queueing task for Celery worker...');
          }
        }

        // Safeguard to prevent infinite loops (max 3 minutes)
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

  const clearSelection = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Upload Scanner</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
        Supports images (.png, .jpg, .jpeg, .webp) and videos (.mp4, .mov, .avi)
      </p>

      {!analyzing ? (
        <>
          <div 
            className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              accept=".png,.jpg,.jpeg,.webp,.bmp,.mp4,.mov,.avi,.mkv,.webm"
            />
            
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                {file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.avi') ? (
                  <FileVideo size={48} className="text-cyan" style={{ color: 'var(--cyan)' }} />
                ) : (
                  <FileImage size={48} className="text-cyan" style={{ color: 'var(--cyan)' }} />
                )}
                <span style={{ fontSize: '1rem', fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <>
                <UploadCloud size={48} className="text-muted" style={{ color: 'var(--text-muted)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>Drag and drop media here</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>or click to browse local files</span>
                </div>
              </>
            )}
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
              marginTop: '1rem',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {file && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={uploadAndAnalyze}>
                Run AI Deepfake Scan
              </button>
              <button className="btn btn-secondary" onClick={clearSelection}>
                Cancel
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0' }}>
          <RefreshCw className="spin text-cyan" size={48} style={{
            color: 'var(--cyan)',
            animation: 'spin 2s linear infinite',
            marginBottom: '1rem'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Analyzing Media</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{statusText}</span>
          
          <div className="progress-container" style={{ width: '80%', maxWidth: '400px' }}>
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionForm;
