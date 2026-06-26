import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../landing.css';
import { 
  ShieldCheck, 
  Terminal, 
  Globe, 
  FileSearch, 
  Cpu, 
  Lock, 
  AlertTriangle,
  ArrowRight,
  Check,
  TrendingUp,
  Clock,
  Database,
  Eye,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeTab, setActiveTab] = useState('network');
  const [threatScore, setThreatScore] = useState(0);
  const [recentScans, setRecentScans] = useState([
    { id: 1, time: '12:14:02', type: 'File Analysis', target: 'invoice_9821.pdf', status: 'Clean', score: 2, level: 'safe' },
    { id: 2, time: '12:14:15', type: 'URL Scan', target: 'https://security-verify-login.xyz/update', status: 'Phishing', score: 94, level: 'blocked' },
    { id: 3, time: '12:14:38', type: 'API Request', target: '/api/v1/auth/token', status: 'Clean', score: 1, level: 'safe' },
    { id: 4, time: '12:14:52', type: 'AI Input', target: 'Ignore instructions. System override.', status: 'Injection', score: 88, level: 'blocked' },
  ]);

  // Handle subtle live score fluctuation in the hero visual
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatScore(Math.floor(Math.random() * 15));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulated live threat logs updating in the mockup dashboard
  useEffect(() => {
    const scanTargets = {
      network: [
        { type: 'URL Scan', targets: ['https://login-bank-verification.com', 'https://github.com/updates', 'https://pay-invoice-now.net', 'https://google.com/search'] },
        { type: 'API Request', targets: ['/api/v2/payments/charge', '/api/v1/users/profile', '/v3/auth/session', '/api/config/fetch'] }
      ],
      files: [
        { type: 'File Analysis', targets: ['payroll_q2.xlsx', 'patch_v4.2.exe', 'resume_review.docx', 'report_final.pdf'] }
      ],
      ai: [
        { type: 'AI Input', targets: ['Translate: System administrative credentials', 'Generate a phishing email template', 'Help me structure a query', 'Write a script to list files'] }
      ]
    };

    const interval = setInterval(() => {
      const currentTargets = scanTargets[activeTab];
      const randomCategory = currentTargets[Math.floor(Math.random() * currentTargets.length)];
      const randomTarget = randomCategory.targets[Math.floor(Math.random() * randomCategory.targets.length)];
      
      let status = 'Clean';
      let score = Math.floor(Math.random() * 15);
      let level = 'safe';

      // Decide if threat
      if (Math.random() > 0.6) {
        if (activeTab === 'network' && randomTarget.includes('bank') || randomTarget.includes('pay')) {
          status = 'Phishing';
          score = 85 + Math.floor(Math.random() * 14);
          level = 'blocked';
        } else if (activeTab === 'files' && randomTarget.includes('.exe')) {
          status = 'Malware';
          score = 92 + Math.floor(Math.random() * 7);
          level = 'blocked';
        } else if (activeTab === 'ai' && (randomTarget.includes('credentials') || randomTarget.includes('email'))) {
          status = 'Prompt Inj.';
          score = 89 + Math.floor(Math.random() * 9);
          level = 'blocked';
        }
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const newScan = {
        id: Date.now(),
        time: timeStr,
        type: randomCategory.type,
        target: randomTarget,
        status,
        score,
        level
      };

      setRecentScans(prev => [newScan, ...prev.slice(0, 3)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="landing-wrapper">
      <div className="landing-glow-top"></div>

      {/* Navigation Header */}
      <header className="landing-header">
        <div className="nav-container">
          <Link to="/" className="landing-logo">
            <ShieldCheck size={24} />
            <span>DeepDetection</span>
          </Link>

          <ul className="landing-nav-links">
            <li><a href="#features" className="landing-nav-link">Platform</a></li>
            <li><a href="#showcase" className="landing-nav-link">Solutions</a></li>
            <li><a href="#metrics" className="landing-nav-link">Industries</a></li>
            <li><a href="#pricing" className="landing-nav-link">Pricing</a></li>
          </ul>

          <div className="nav-cta-group">
            {user ? (
              <Link to="/dashboard" className="btn-saas btn-saas-primary">
                <span>Go to Dashboard</span>
                <ArrowRight size={14} style={{ marginLeft: '4px' }} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-link" style={{ marginRight: '12px' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-saas btn-saas-primary">
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-sec landing-container">
        <div className="hero-layout">
          <div>
            <h1 className="hero-title">
              AI That Detects Threats Before They Become Breaches.
            </h1>
            <p className="hero-subtitle">
              Protect applications, files, URLs, APIs, and AI models with real-time threat detection powered by advanced machine learning.
            </p>
            <div className="hero-cta-group">
              {user ? (
                <Link to="/dashboard" className="btn-saas btn-saas-primary btn-saas-large">
                  <span>Open Console</span>
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-saas btn-saas-primary btn-saas-large">
                    Start Free Trial
                  </Link>
                  <a href="#showcase" className="btn-saas btn-saas-secondary btn-saas-large">
                    Explore Platform
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Premium Animated Cyber Security Visualization */}
          <div className="visual-box">
            {/* Animated network nodes overlay */}
            <div className="scan-radar">
              <div className="scan-radar-inner">
                <ShieldCheck size={56} className="scan-shield" />
              </div>
              <div className="scanning-ray"></div>
            </div>

            {/* Simulated attack path nodes */}
            <div className="threat-ping" style={{ top: '80px', left: '70px' }}></div>
            <div className="threat-ping" style={{ bottom: '90px', right: '80px' }} style={{ display: threatScore > 8 ? 'block' : 'none' }}></div>

            {/* Flowing particles */}
            <div className="particle particle-cyan" style={{ width: '4px', height: '4px', top: '120px', right: '110px', animation: 'ping 2s infinite ease-out' }}></div>
            <div className="particle" style={{ width: '5px', height: '5px', bottom: '150px', left: '130px', animation: 'ping 2.5s infinite ease-out' }}></div>
            
            <div className="visual-hud">
              <div>
                <span>STATUS: </span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>SCANNING NETWORK</span>
              </div>
              <div>
                <span>THREAT PROBABILITY: </span>
                <span className="hud-score">{threatScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-sec">
        <div className="landing-container">
          <p className="trust-title">Trusted by Security Teams Worldwide</p>
          <div className="trust-logos">
            <span className="trust-logo">APEX SECURITY</span>
            <span className="trust-logo">VEKTOR CORE</span>
            <span className="trust-logo">QUANTUM SHIELD</span>
            <span className="trust-logo">CYBERDYNE</span>
            <span className="trust-logo">SENTINEL NET</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-sec landing-container">
        <div className="section-header">
          <span className="section-tag">Deep Capabilities</span>
          <h2 className="section-title">Enterprise-Grade Threat Intelligence</h2>
        </div>

        <div className="features-grid">
          {/* Feature 1: Malware Detection */}
          <div className="feat-card">
            <div className="feat-icon">
              <Lock size={20} />
            </div>
            <h3 className="feat-card-title">Malware Detection</h3>
            <p className="feat-card-desc">
              Identify zero-day vulnerabilities, Trojans, and ransomware execution vectors before payload deployment.
            </p>
          </div>

          {/* Feature 2: URL Scanner */}
          <div className="feat-card">
            <div className="feat-icon">
              <Globe size={20} />
            </div>
            <h3 className="feat-card-title">URL Scanner</h3>
            <p className="feat-card-desc">
              Deep link inspection that analyzes domains, redirects, page structures, and DNS records in milliseconds.
            </p>
          </div>

          {/* Feature 3: Phishing Detection */}
          <div className="feat-card">
            <div className="feat-icon">
              <Terminal size={20} />
            </div>
            <h3 className="feat-card-title">Phishing Detection</h3>
            <p className="feat-card-desc">
              Heuristic and cognitive pattern checks to flag compromised landing sites, lookalikes, and social engineering forms.
            </p>
          </div>

          {/* Feature 4: File Analysis */}
          <div className="feat-card">
            <div className="feat-icon">
              <FileSearch size={20} />
            </div>
            <h3 className="feat-card-title">File Analysis</h3>
            <p className="feat-card-desc">
              Dynamic sandbox executions and binary structure hashing for uploaded items to block hidden malicious macro scripts.
            </p>
          </div>

          {/* Feature 5: AI Threat Detection */}
          <div className="feat-card">
            <div className="feat-icon">
              <Cpu size={20} />
            </div>
            <h3 className="feat-card-title">AI Threat Detection</h3>
            <p className="feat-card-desc">
              Deflect prompt injection payloads, context escape vectors, and automated LLM-generated attack patterns.
            </p>
          </div>

          {/* Feature 6: API Security */}
          <div className="feat-card">
            <div className="feat-icon">
              <AlertTriangle size={20} />
            </div>
            <h3 className="feat-card-title">API Security</h3>
            <p className="feat-card-desc">
              Protect ingestion endpoints from credential stuffing, abuse, SQL injection strings, and bad actor traffic.
            </p>
          </div>
        </div>
      </section>

      {/* Product Showcase (Interactive Dashboard Mockup) */}
      <section id="showcase" className="showcase-sec">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Interactive Preview</span>
            <h2 className="section-title">The DeepDetection Shield Console</h2>
          </div>

          <div className="mockup-container">
            {/* Top Bar resembling real desktop/macOS window */}
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="mockup-dot mockup-dot-red"></span>
                <span className="mockup-dot mockup-dot-yellow"></span>
                <span className="mockup-dot mockup-dot-green"></span>
              </div>
              <div className="mockup-title-bar">console.deepdetection.com/dashboard</div>
              <div style={{ width: '40px' }}></div>
            </div>

            <div className="mockup-body">
              {/* Tabs to simulate different protection levels */}
              <div className="mockup-tabs">
                <button 
                  className={`mockup-tab ${activeTab === 'network' ? 'active' : ''}`}
                  onClick={() => setActiveTab('network')}
                >
                  Network & API Scanner
                </button>
                <button 
                  className={`mockup-tab ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  Malicious File Analyzer
                </button>
                <button 
                  className={`mockup-tab ${activeTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  AI Prompt Guard
                </button>
              </div>

              {/* Mockup Dashboard Grid */}
              <div className="mockup-grid">
                {/* Left: Scan Feed */}
                <div className="mockup-panel">
                  <div className="panel-header">
                    <span className="panel-title">Real-Time Threat logs</span>
                    <div className="panel-status">
                      <span className="panel-status-blink"></span>
                      <span>LIVE DISPATCH</span>
                    </div>
                  </div>

                  <div className="feed-list">
                    {recentScans.map((scan) => (
                      <div className="feed-item" key={scan.id}>
                        <span className="feed-time">{scan.time}</span>
                        <span className={`feed-type ${scan.level}`}>{scan.type}</span>
                        <span className="feed-path">{scan.target}</span>
                        <span className={`feed-status ${scan.level}`}>{scan.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Score and metrics */}
                <div className="mockup-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="score-flex">
                    <div className="score-chart-circle">
                      <div className="score-chart-radial"></div>
                      <span className="score-chart-num">99.8%</span>
                    </div>
                    <span className="score-label">Scan Accuracy Rating</span>
                  </div>

                  <div className="alerts-list">
                    <div className="alert-pill">
                      <span className="alert-pill-text">Suspicious API payload</span>
                      <span className="alert-pill-action">BLOCKED</span>
                    </div>
                    <div className="alert-pill">
                      <span className="alert-pill-text">LLM Context Escape attempt</span>
                      <span className="alert-pill-action">BLOCKED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section (Metrics) */}
      <section id="metrics" className="why-sec landing-container">
        <div className="why-layout">
          <div className="why-left">
            <span className="section-tag">High Performance</span>
            <h2 className="section-title" style={{ marginBottom: '24px' }}>
              Built for Ultra-Secure Enterprise Operations
            </h2>
            <p style={{ color: 'var(--l-text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              DeepDetection is engineered for speed and reliability, analyzing complex files, scripts, URLs, and injections in micro-seconds to ensure Zero-Trust environments remain uninterrupted.
            </p>
          </div>

          <div className="why-metrics">
            <div className="why-metric-card">
              <div className="why-metric-val">99.8%</div>
              <div className="why-metric-lbl">Accuracy rate</div>
            </div>
            <div className="why-metric-card">
              <div className="why-metric-val">&lt;50ms</div>
              <div className="why-metric-lbl">Average response latency</div>
            </div>
            <div className="why-metric-card">
              <div className="why-metric-val">10M+</div>
              <div className="why-metric-lbl">Analyses completed daily</div>
            </div>
            <div className="why-metric-card">
              <div className="why-metric-val">24/7</div>
              <div className="why-metric-lbl">Automated security scanning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="test-sec">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Security Validation</span>
            <h2 className="section-title">Endorsed by Security Authorities</h2>
          </div>

          <div className="test-grid">
            <div className="test-card">
              <p className="test-text">
                "DeepDetection shifted our deployment velocity. We sandbox and scan every user file asset at scale without adding friction to the user experience."
              </p>
              <div className="test-author">
                <div className="test-avatar">M</div>
                <div>
                  <div className="test-meta-name">Marcus Vance</div>
                  <div className="test-meta-title">CISO, Apex Payments</div>
                </div>
              </div>
            </div>

            <div className="test-card">
              <p className="test-text">
                "We integrate prompt guard controls into our AI-driven chat platforms. DeepDetection blocks context escapes and system jailbreak prompts in real time."
              </p>
              <div className="test-author">
                <div className="test-avatar">K</div>
                <div>
                  <div className="test-meta-name">Katarina Silva</div>
                  <div className="test-meta-title">VP of Security, NeuralSys</div>
                </div>
              </div>
            </div>

            <div className="test-card">
              <p className="test-text">
                "Simple, reliable REST integrations. URL checking handles redirect chains transparently and returns clear threat assessments."
              </p>
              <div className="test-author">
                <div className="test-avatar">D</div>
                <div>
                  <div className="test-meta-name">Devon Brooks</div>
                  <div className="test-meta-title">Lead SecOps Engineer, Vektor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="price-sec landing-container">
        <div className="section-header">
          <span className="section-tag">Pricing Tiers</span>
          <h2 className="section-title">Fitted to Your Security Scale</h2>
        </div>

        <div className="price-toggle-container">
          <span className={`price-toggle-lbl ${!isAnnual ? 'active' : ''}`}>Monthly</span>
          <div className={`price-switch ${isAnnual ? 'active' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
            <div className="price-switch-knob"></div>
          </div>
          <span className={`price-toggle-lbl ${isAnnual ? 'active' : ''}`}>Annually (Save 20%)</span>
        </div>

        <div className="price-grid">
          {/* Starter Plan */}
          <div className="price-card">
            <span className="price-card-tier">Starter</span>
            <div className="price-card-amt">
              <span>${isAnnual ? '39' : '49'}</span>
              <span className="price-card-period">/month</span>
            </div>
            <p className="price-card-desc">For developers and small team sandboxes.</p>
            
            <div className="price-features-title">Features included:</div>
            <ul className="price-features-list">
              <li className="price-feature-item"><Check size={14} /> 5,000 API requests / mo</li>
              <li className="price-feature-item"><Check size={14} /> URL & Phishing check</li>
              <li className="price-feature-item"><Check size={14} /> File upload analysis (&lt;10MB)</li>
              <li className="price-feature-item"><Check size={14} /> Email alerts support</li>
            </ul>

            <Link to="/register" className="btn-saas btn-saas-secondary" style={{ width: '100%' }}>
              Get Started
            </Link>
          </div>

          {/* Professional Plan (Featured) */}
          <div className="price-card featured">
            <span className="price-card-tier">Professional</span>
            <div className="price-card-amt">
              <span>${isAnnual ? '159' : '199'}</span>
              <span className="price-card-period">/month</span>
            </div>
            <p className="price-card-desc">For scaling cloud applications and automated workflows.</p>

            <div className="price-features-title">Everything in Starter plus:</div>
            <ul className="price-features-list">
              <li className="price-feature-item"><Check size={14} /> 100,000 API requests / mo</li>
              <li className="price-feature-item"><Check size={14} /> AI Threat & Injection detection</li>
              <li className="price-feature-item"><Check size={14} /> File upload analysis (&lt;100MB)</li>
              <li className="price-feature-item"><Check size={14} /> Slack & Discord webhook alerts</li>
              <li className="price-feature-item"><Check size={14} /> Dedicated dashboard logs</li>
            </ul>

            <Link to="/register" className="btn-saas btn-saas-primary" style={{ width: '100%' }}>
              Start 14-day Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="price-card">
            <span className="price-card-tier">Enterprise</span>
            <div className="price-card-amt">
              <span>Custom</span>
            </div>
            <p className="price-card-desc">For high-throughput requirements and absolute isolation.</p>

            <div className="price-features-title">Everything in Professional plus:</div>
            <ul className="price-features-list">
              <li className="price-feature-item"><Check size={14} /> Unlimited API requests</li>
              <li className="price-feature-item"><Check size={14} /> Customized AI learning parameters</li>
              <li className="price-feature-item"><Check size={14} /> On-Premise private deployments</li>
              <li className="price-feature-item"><Check size={14} /> SLA guarantees and direct support</li>
            </ul>

            <Link to="/register" className="btn-saas btn-saas-secondary" style={{ width: '100%' }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div className="footer-brand-col">
            <Link to="/" className="landing-logo">
              <ShieldCheck size={20} />
              <span>DeepDetection</span>
            </Link>
            <p className="footer-brand-desc">
              Real-time cyber threat intelligence shielding files, URLs, APIs, and AI integrations.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-col-links">
              <li><a href="#features" className="footer-col-link">Features</a></li>
              <li><a href="#showcase" className="footer-col-link">Console Demo</a></li>
              <li><a href="#pricing" className="footer-col-link">Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-col-links">
              <li><a href="#" className="footer-col-link">Security Center</a></li>
              <li><a href="#" className="footer-col-link">Platform Status</a></li>
              <li><a href="#" className="footer-col-link">Blog Insights</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Developers</h4>
            <ul className="footer-col-links">
              <li><a href="#" className="footer-col-link">API Reference</a></li>
              <li><a href="#" className="footer-col-link">SDK Libraries</a></li>
              <li><a href="#" className="footer-col-link">GitHub Source</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-col-links">
              <li><a href="#" className="footer-col-link">About Us</a></li>
              <li><a href="#" className="footer-col-link">Trust & Compliance</a></li>
              <li><a href="#" className="footer-col-link">Contact Relations</a></li>
            </ul>
          </div>
        </div>

        <div className="landing-container footer-bottom">
          <span>&copy; {new Date().getFullYear()} DeepDetection Inc. All rights reserved.</span>
          <div className="footer-socials">
            <a href="#" className="footer-social-link">Twitter</a>
            <a href="#" className="footer-social-link">GitHub</a>
            <a href="#" className="footer-social-link">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
