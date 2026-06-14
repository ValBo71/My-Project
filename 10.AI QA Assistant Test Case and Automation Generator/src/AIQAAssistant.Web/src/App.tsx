import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Trash2, 
  Copy, 
  Download, 
  ListChecks, 
  Bug, 
  Code, 
  Activity, 
  ShieldAlert, 
  Check, 
  Database,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { api } from './services/api';
import type { 
  TestCaseResponse, 
  EdgeCase, 
  ApiTestScenario, 
  AutomationSkeleton, 
  BugReport, 
  HistoryRecord 
} from './services/api';

type TabType = 'testcase' | 'edgecase' | 'apitest' | 'automation' | 'bugreport';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('testcase');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  
  // Inputs
  const [requirement, setRequirement] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('POST /api/users');
  const [apiPayload, setApiPayload] = useState('{\n  "name": "John Smith",\n  "email": "john@test.com",\n  "password": "Password123"\n}');
  const [bugDescription, setBugDescription] = useState('When I upload a CSV file larger than 10MB, the system returns 500 Internal Server Error.');

  // Result States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Active output (can be from generation or history selection)
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [testCaseResult, setTestCaseResult] = useState<TestCaseResponse | null>(null);
  const [edgeCaseResult, setEdgeCaseResult] = useState<EdgeCase[] | null>(null);
  const [apiTestResult, setApiTestResult] = useState<ApiTestScenario[] | null>(null);
  const [automationResult, setAutomationResult] = useState<AutomationSkeleton | null>(null);
  const [bugReportResult, setBugReportResult] = useState<BugReport | null>(null);

  // Active view inside Automation tabs
  const [activeAutoTab, setActiveAutoTab] = useState<'test' | 'po' | 'selectors' | 'data' | 'explanation'>('test');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const logs = await api.getHistory();
      setHistory(logs);
    } catch (err: any) {
      console.error("Failed to load history", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    clearResults();

    try {
      if (activeTab === 'testcase') {
        const res = await api.generateTestCases(requirement);
        setTestCaseResult(res);
      } else if (activeTab === 'edgecase') {
        const res = await api.generateEdgeCases(requirement);
        setEdgeCaseResult(res);
      } else if (activeTab === 'apitest') {
        const res = await api.generateApiTests(apiEndpoint, apiPayload);
        setApiTestResult(res);
      } else if (activeTab === 'automation') {
        const res = await api.generateAutomation(requirement);
        setAutomationResult(res);
        setActiveAutoTab('test');
      } else if (activeTab === 'bugreport') {
        const res = await api.generateBugReport(bugDescription);
        setBugReportResult(res);
      }
      
      // Reload history to show the newly created item
      await loadHistory();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setActiveResultId(null);
    setTestCaseResult(null);
    setEdgeCaseResult(null);
    setApiTestResult(null);
    setAutomationResult(null);
    setBugReportResult(null);
  };

  const handleSelectHistory = (record: HistoryRecord) => {
    clearResults();
    setActiveResultId(record.id);
    
    // Map QueryType string value to our tab type
    let tabMapped: TabType = 'testcase';
    const rawResult = record.outputResult;

    try {
      if (record.type === 'TestCase') {
        tabMapped = 'testcase';
        const parsed = JSON.parse(rawResult) as TestCaseResponse;
        setTestCaseResult(parsed);
      } else if (record.type === 'EdgeCase') {
        tabMapped = 'edgecase';
        const parsed = JSON.parse(rawResult) as EdgeCase[];
        setEdgeCaseResult(parsed);
      } else if (record.type === 'ApiTest') {
        tabMapped = 'apitest';
        const parsed = JSON.parse(rawResult) as ApiTestScenario[];
        setApiTestResult(parsed);
      } else if (record.type === 'Automation') {
        tabMapped = 'automation';
        const parsed = JSON.parse(rawResult) as AutomationSkeleton;
        setAutomationResult(parsed);
        setActiveAutoTab('test');
      } else if (record.type === 'BugReport') {
        tabMapped = 'bugreport';
        const parsed = JSON.parse(rawResult) as BugReport;
        setBugReportResult(parsed);
      }
      
      setActiveTab(tabMapped);
    } catch (err) {
      setError("Failed to parse historical results JSON: " + err);
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this record from history?")) return;
    try {
      await api.deleteHistory(id);
      if (activeResultId === id) {
        clearResults();
      }
      loadHistory();
    } catch (err: any) {
      alert("Error deleting record: " + err.message);
    }
  };

  const handleCopyToClipboard = () => {
    let textToCopy = '';
    
    if (testCaseResult) {
      textToCopy = JSON.stringify(testCaseResult, null, 2);
    } else if (edgeCaseResult) {
      textToCopy = JSON.stringify(edgeCaseResult, null, 2);
    } else if (apiTestResult) {
      textToCopy = JSON.stringify(apiTestResult, null, 2);
    } else if (automationResult) {
      if (activeAutoTab === 'test') textToCopy = automationResult.testClass;
      else if (activeAutoTab === 'po') textToCopy = automationResult.pageObjectClass;
      else if (activeAutoTab === 'selectors') textToCopy = automationResult.selectorsFile;
      else if (activeAutoTab === 'data') textToCopy = automationResult.testDataFile;
      else textToCopy = automationResult.explanation;
    } else if (bugReportResult) {
      textToCopy = JSON.stringify(bugReportResult, null, 2);
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = async (format: string) => {
    // If we have an activeResultId, we can export directly.
    // If not, we have to look for the most recently created history record matching the result
    let idToExport = activeResultId;
    
    if (!idToExport) {
      // Find the first log in history matching the active tab type
      const mappedType = activeTab === 'testcase' ? 'TestCase' :
                         activeTab === 'edgecase' ? 'EdgeCase' :
                         activeTab === 'apitest' ? 'ApiTest' :
                         activeTab === 'automation' ? 'Automation' : 'BugReport';
      
      const match = history.find(h => h.type === mappedType);
      if (match) idToExport = match.id;
    }

    if (!idToExport) {
      alert("Please generate a result first before exporting.");
      return;
    }

    try {
      await api.exportHistory(idToExport, format, activeTab);
    } catch (err: any) {
      alert("Failed to export: " + err.message);
    }
  };

  const hasResult = testCaseResult || edgeCaseResult || apiTestResult || automationResult || bugReportResult;

  return (
    <div className="app-container">
      {/* SIDEBAR PANEL */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Zap size={20} color="#fff" />
          </div>
          <span className="logo-text">AI QA Assistant</span>
        </div>
        
        <div className="sidebar-content">
          <div className="nav-section">
            <h3 className="section-title">Generators</h3>
            <div className="nav-list">
              <button 
                onClick={() => { setActiveTab('testcase'); clearResults(); }}
                className={`nav-link ${activeTab === 'testcase' ? 'active' : ''}`}
              >
                <ListChecks size={18} />
                <span>Test Cases</span>
              </button>
              <button 
                onClick={() => { setActiveTab('edgecase'); clearResults(); }}
                className={`nav-link ${activeTab === 'edgecase' ? 'active' : ''}`}
              >
                <ShieldAlert size={18} />
                <span>Edge Cases</span>
              </button>
              <button 
                onClick={() => { setActiveTab('apitest'); clearResults(); }}
                className={`nav-link ${activeTab === 'apitest' ? 'active' : ''}`}
              >
                <Database size={18} />
                <span>API Scenarios</span>
              </button>
              <button 
                onClick={() => { setActiveTab('automation'); clearResults(); }}
                className={`nav-link ${activeTab === 'automation' ? 'active' : ''}`}
              >
                <Code size={18} />
                <span>Automation Code</span>
              </button>
              <button 
                onClick={() => { setActiveTab('bugreport'); clearResults(); }}
                className={`nav-link ${activeTab === 'bugreport' ? 'active' : ''}`}
              >
                <Bug size={18} />
                <span>Bug Report</span>
              </button>
            </div>
          </div>

          <div className="nav-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>History</h3>
              <button 
                onClick={loadHistory} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Reload History"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            <div className="history-list" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 420px)' }}>
              {history.length === 0 ? (
                <div style={{ padding: '20px 8px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No queries run yet
                </div>
              ) : (
                history.map((h) => (
                  <div 
                    key={h.id} 
                    className={`history-item ${activeResultId === h.id ? 'active' : ''}`}
                    onClick={() => handleSelectHistory(h)}
                  >
                    <div className="history-meta">
                      <span className={`badge ${h.type.toLowerCase()}`}>{h.type}</span>
                      <span className="history-time">
                        {new Date(h.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="history-text" title={h.inputData}>
                      {h.type === 'ApiTest' ? 'API Integration query' : h.inputData}
                    </div>
                    <button 
                      className="history-delete-btn"
                      onClick={(e) => handleDeleteHistory(e, h.id)}
                      title="Delete log"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <footer className="sidebar-footer">
          Senior QA Portfolio project &copy; 2026
        </footer>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title-container">
            <h1>
              {activeTab === 'testcase' && "Generate Test Cases"}
              {activeTab === 'edgecase' && "Identify Edge Cases"}
              {activeTab === 'apitest' && "Generate API Scenarios"}
              {activeTab === 'automation' && "Generate Automation Skeleton"}
              {activeTab === 'bugreport' && "Create Bug Report"}
            </h1>
            <p>
              {activeTab === 'testcase' && "Transforms requirements into positive, negative, and edge test case structures."}
              {activeTab === 'edgecase' && "Find corner cases and complex conditions hidden in requirements."}
              {activeTab === 'apitest' && "Get security, structure, and schema tests for API endpoints."}
              {activeTab === 'automation' && "Produces a Playwright C# + NUnit Page Object skeleton with separate selectors."}
              {activeTab === 'bugreport' && "Formats raw defect comments into detailed reporting files."}
            </p>
          </div>
        </header>

        <div className="main-scrollable">
          {/* INPUT FORM CARD */}
          <div className="glass-panel section-card">
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeTab === 'testcase' && (
                <div className="form-group">
                  <label htmlFor="req">Requirement / User Story / Acceptance Criteria</label>
                  <textarea 
                    id="req"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. As a user, I want to login with valid email and password, so that I can access my account."
                    required
                  />
                </div>
              )}

              {activeTab === 'edgecase' && (
                <div className="form-group">
                  <label htmlFor="req-ec">Requirement / Feature Description</label>
                  <textarea 
                    id="req-ec"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="Describe the feature requirement to scan for hidden bug scenarios..."
                    required
                  />
                </div>
              )}

              {activeTab === 'apitest' && (
                <>
                  <div className="form-group">
                    <label htmlFor="api-ep">API Endpoint (Method & Route)</label>
                    <input 
                      id="api-ep"
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="POST /api/users"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="api-pl">Example Payload (JSON)</label>
                    <textarea 
                      id="api-pl"
                      value={apiPayload}
                      onChange={(e) => setApiPayload(e.target.value)}
                      placeholder="{}"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'automation' && (
                <div className="form-group">
                  <label htmlFor="req-auto">Feature UI Flow to Automate</label>
                  <textarea 
                    id="req-auto"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. User logs in, clicks dashboard settings, changes profile name to 'QA User', clicks save."
                    required
                  />
                </div>
              )}

              {activeTab === 'bugreport' && (
                <div className="form-group">
                  <label htmlFor="bug-desc">Informal Defect description</label>
                  <textarea 
                    id="bug-desc"
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="Enter what went wrong, what steps were taken..."
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ alignSelf: 'flex-start' }}
              >
                {loading ? (
                  <>
                    <Activity size={18} className="spinner-loader" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Analyzing with Claude...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Generate QA Assets</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* LOADING GLASS CARD */}
          {loading && (
            <div className="glass-panel loading-overlay">
              <div className="spinner"></div>
              <div className="loading-text">Claude AI is drafting response templates...</div>
            </div>
          )}

          {/* ERROR STATUS PANEL */}
          {error && (
            <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <ShieldAlert size={24} color="var(--danger)" />
              <div>
                <h4 style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '4px' }}>Execution Error</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
              </div>
            </div>
          )}

          {/* ACTIVE GENERATED PREVIEW CONTAINER */}
          {hasResult && !loading && (
            <div className="results-container">
              <div className="results-header">
                <h2>Generated QA Assets</h2>
                <div className="export-actions">
                  <button onClick={handleCopyToClipboard} className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
                    {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <div className="dropdown-export" style={{ position: 'relative' }}>
                    <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
                      <Download size={16} />
                      <span>Export File</span>
                    </button>
                    {/* Floating Hover export dropdown options */}
                    <div className="dropdown-menu-glass">
                      <button onClick={() => handleExport('json')}>JSON</button>
                      <button onClick={() => handleExport('markdown')}>Markdown</button>
                      <button onClick={() => handleExport('csv')}>CSV</button>
                      <button onClick={() => handleExport('docx')}>Word (DOCX)</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RENDER DYNAMIC LAYOUT BASED ON MODULE */}
              <div className="glass-panel results-content">
                {/* 1. TEST CASES LAYOUT */}
                {testCaseResult && (
                  <div className="test-cases-grid">
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '8px' }}>
                        Feature: {testCaseResult.feature}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }}>{testCaseResult.summary}</p>
                    </div>
                    {testCaseResult.testCases.map((tc) => (
                      <div key={tc.id} className="tc-card">
                        <div className="tc-header">
                          <div className="tc-title-container">
                            <span className="tc-id">{tc.id}</span>
                            <h4 className="tc-title">{tc.title}</h4>
                          </div>
                          <div className="tc-metadata">
                            <span className={`badge-priority ${tc.priority.toLowerCase()}`}>{tc.priority}</span>
                            <span className="badge testcase">{tc.type}</span>
                          </div>
                        </div>
                        <div className="tc-body">
                          <div className="tc-steps-box">
                            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                              Preconditions &amp; Steps
                            </h5>
                            {tc.preconditions.length > 0 && (
                              <ul style={{ listStyleType: 'disc', paddingLeft: '18px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                {tc.preconditions.map((p, idx) => <li key={idx}>{p}</li>)}
                              </ul>
                            )}
                            <ol>
                              {tc.steps.map((step, idx) => <li key={idx} style={{ color: 'var(--text-secondary)' }}>{step}</li>)}
                            </ol>
                          </div>
                          <div className="tc-details-box">
                            <div>
                              <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Expected Outcome
                              </h5>
                              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{tc.expectedResult}</p>
                            </div>
                            {Object.keys(tc.testData).length > 0 && (
                              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                                  Test Data
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {Object.entries(tc.testData).map(([k, v]) => (
                                    <div key={k} style={{ fontSize: '0.85rem' }}>
                                      <code style={{ color: 'var(--secondary)' }}>{k}</code>: <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. EDGE CASES LAYOUT */}
                {edgeCaseResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {edgeCaseResult.map((ec) => (
                      <div key={ec.id} className="tc-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>{ec.id}</span>
                          <span className={`badge-priority ${ec.priority.toLowerCase()}`}>{ec.priority}</span>
                        </div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{ec.scenario}</h4>
                        <p style={{ color: 'var(--text-secondary)' }}>{ec.description}</p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '0.9rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Potential System Impact: </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{ec.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. API TEST SCENARIOS LAYOUT */}
                {apiTestResult && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="api-scenarios-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Test Scenario</th>
                          <th>Request Verification</th>
                          <th>Response Verification</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiTestResult.map((scenario, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{scenario.category}</td>
                            <td>{scenario.scenario}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{scenario.requestVerification}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{scenario.responseVerification}</td>
                            <td>
                              <span className="status-badge">{scenario.expectedStatusCode}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. AUTOMATION POM CODE LAYOUT */}
                {automationResult && (
                  <div>
                    <div className="tabs-container">
                      <button 
                        onClick={() => setActiveAutoTab('test')} 
                        className={`tab-btn ${activeAutoTab === 'test' ? 'active' : ''}`}
                      >
                        Test Class
                      </button>
                      <button 
                        onClick={() => setActiveAutoTab('po')} 
                        className={`tab-btn ${activeAutoTab === 'po' ? 'active' : ''}`}
                      >
                        Page Object
                      </button>
                      <button 
                        onClick={() => setActiveAutoTab('selectors')} 
                        className={`tab-btn ${activeAutoTab === 'selectors' ? 'active' : ''}`}
                      >
                        Selectors JSON
                      </button>
                      <button 
                        onClick={() => setActiveAutoTab('data')} 
                        className={`tab-btn ${activeAutoTab === 'data' ? 'active' : ''}`}
                      >
                        Test Data
                      </button>
                      <button 
                        onClick={() => setActiveAutoTab('explanation')} 
                        className={`tab-btn ${activeAutoTab === 'explanation' ? 'active' : ''}`}
                      >
                        Explanation
                      </button>
                    </div>

                    <div className="tab-pane">
                      {activeAutoTab === 'test' && (
                        <pre><code>{automationResult.testClass}</code></pre>
                      )}
                      {activeAutoTab === 'po' && (
                        <pre><code>{automationResult.pageObjectClass}</code></pre>
                      )}
                      {activeAutoTab === 'selectors' && (
                        <pre><code>{automationResult.selectorsFile}</code></pre>
                      )}
                      {activeAutoTab === 'data' && (
                        <pre><code>{automationResult.testDataFile}</code></pre>
                      )}
                      {activeAutoTab === 'explanation' && (
                        <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)', padding: '10px' }}>
                          {automationResult.explanation.split('\n').map((line, i) => (
                            <p key={i} style={{ marginBottom: '10px' }}>{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. BUG REPORT LAYOUT */}
                {bugReportResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginBottom: '4px' }}>{bugReportResult.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Environment: {bugReportResult.environment}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge-priority high">Severity: {bugReportResult.severity}</span>
                        <span className="badge-priority medium">Priority: {bugReportResult.priority}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Preconditions</h4>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                        {bugReportResult.preconditions.map((p, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{p}</li>)}
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Steps to Reproduce</h4>
                      <ol style={{ paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                        {bugReportResult.stepsToReproduce.map((step, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>)}
                      </ol>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(15,23,42,0.3)', padding: '16px', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>Actual Result:</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{bugReportResult.actualResult}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '4px' }}>Expected Result:</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{bugReportResult.expectedResult}</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Possible Root Cause</h4>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{bugReportResult.possibleRootCause}</p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Suggested Additional Tests</h4>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                        {bugReportResult.suggestedAdditionalTests.map((t, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{t}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMPTY LANDING STATE */}
          {!hasResult && !loading && (
            <div className="glass-panel empty-state">
              <FolderOpen size={48} />
              <h3>No QA Assets Generated</h3>
              <p>Type in requirements, user stories, or API payloads above and click generate, or choose an item from the history log to inspect.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
