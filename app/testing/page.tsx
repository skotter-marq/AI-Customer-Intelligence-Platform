'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration?: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  passed: number;
  failed: number;
  total: number;
}

interface TestSummary {
  last_run: string;
  total_tests: number;
  passed: number;
  failed: number;
  success_rate: number;
  coverage: number;
  performance: {
    avg_response_time: number;
    slow_endpoints: number;
    failed_load_tests: number;
  };
  security: {
    vulnerabilities: number;
    security_tests_passed: number;
    last_security_scan: string;
  };
}

interface SystemHealth {
  status: string;
  components: {
    database: { status: string; response_time: number };
    api: { status: string; response_time: number };
    cache: { status: string; hit_rate: number };
    queue: { status: string; pending_jobs: number };
  };
  metrics: {
    uptime: string;
    cpu_usage: string;
    memory_usage: string;
    disk_usage: string;
  };
}

export default function TestingPage() {
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'coverage' | 'health' | 'run'>('overview');
  const [coverage, setCoverage] = useState<any>(null);
  const [selectedSuite, setSelectedSuite] = useState<string>('all');
  const [parallelExecution, setParallelExecution] = useState(false);

  useEffect(() => {
    loadTestingData();
  }, []);

  const loadTestingData = async () => {
    try {
      setLoading(true);
      
      // Load test summary
      const summaryResponse = await fetch('/api/testing?type=summary');
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.summary);
      }

      // Load system health
      const healthResponse = await fetch('/api/testing?type=health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData.health);
      }

      // Load test coverage
      const coverageResponse = await fetch('/api/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_coverage' })
      });
      if (coverageResponse.ok) {
        const coverageData = await coverageResponse.json();
        setCoverage(coverageData.coverage);
      }

    } catch (error) {
      console.error('Error loading testing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    try {
      setRunning(true);
      setTestResults([]);
      
      const response = await fetch('/api/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedSuite === 'all' ? 'run_tests' : 'run_suite',
          suite: selectedSuite === 'all' ? undefined : selectedSuite,
          parallel: parallelExecution
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (selectedSuite === 'all') {
          setTestResults(result.suites);
        } else {
          setTestResults([result.result]);
        }
        
        // Refresh summary data
        await loadTestingData();
      } else {
        throw new Error('Failed to run tests');
      }
    } catch (error) {
      console.error('Error running tests:', error);
      alert('Failed to run tests. Please check the console for details.');
    } finally {
      setRunning(false);
    }
  };

  const runE2ETests = async () => {
    try {
      setRunning(true);
      
      const response = await fetch('/api/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_e2e' })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`E2E tests completed: ${result.summary.passed}/${result.summary.total_tests} passed`);
        await loadTestingData();
      } else {
        throw new Error('Failed to run E2E tests');
      }
    } catch (error) {
      console.error('Error running E2E tests:', error);
      alert('Failed to run E2E tests. Please check the console for details.');
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 border-green-200';
      case 'failed': return 'bg-red-100 border-red-200';
      case 'running': return 'bg-blue-100 border-blue-200';
      case 'pending': return 'bg-yellow-100 border-yellow-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading testing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">End-to-End Testing Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Comprehensive testing suite for all system components
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {summary && (
                  <div className="text-sm text-gray-500">
                    Last run: {formatDistanceToNow(new Date(summary.last_run), { addSuffix: true })}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Testing System Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'run', label: 'Run Tests', icon: '▶️' },
              { key: 'results', label: 'Results', icon: '📋' },
              { key: 'coverage', label: 'Coverage', icon: '📈' },
              { key: 'health', label: 'System Health', icon: '🏥' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">🧪</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{summary.total_tests}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">✅</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">❌</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📊</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blue-600">{summary.success_rate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="text-sm font-medium text-gray-900">{summary.performance.avg_response_time}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Slow Endpoints</span>
                    <span className="text-sm font-medium text-gray-900">{summary.performance.slow_endpoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Failed Load Tests</span>
                    <span className="text-sm font-medium text-gray-900">{summary.performance.failed_load_tests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Code Coverage</span>
                    <span className="text-sm font-medium text-gray-900">{summary.coverage}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vulnerabilities Found</span>
                    <span className={`text-sm font-medium ${summary.security.vulnerabilities === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.security.vulnerabilities}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Security Tests Passed</span>
                    <span className="text-sm font-medium text-green-600">{summary.security.security_tests_passed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Security Scan</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDistanceToNow(new Date(summary.security.last_security_scan), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Run Tests Tab */}
        {activeTab === 'run' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Run Test Suites</h3>
              
              <div className="space-y-4">
                {/* Test Suite Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Test Suite
                  </label>
                  <select
                    value={selectedSuite}
                    onChange={(e) => setSelectedSuite(e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Test Suites</option>
                    <option value="api_tests">API Tests</option>
                    <option value="integration_tests">Integration Tests</option>
                    <option value="e2e_tests">E2E Tests</option>
                    <option value="performance_tests">Performance Tests</option>
                    <option value="security_tests">Security Tests</option>
                  </select>
                </div>

                {/* Parallel Execution */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={parallelExecution}
                      onChange={(e) => setParallelExecution(e.target.checked)}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Run tests in parallel (faster execution)</span>
                  </label>
                </div>

                {/* Run Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={runTests}
                    disabled={running}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {running ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <span>▶️</span>
                        <span>Run Tests</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={runE2ETests}
                    disabled={running}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>🎯</span>
                    <span>Run E2E Tests</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Test Suite Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Test Suites</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'API Tests', description: 'Tests all API endpoints and responses', icon: '🔗' },
                  { name: 'Integration Tests', description: 'Tests component interactions and workflows', icon: '🔄' },
                  { name: 'E2E Tests', description: 'End-to-end user journey testing', icon: '🎯' },
                  { name: 'Performance Tests', description: 'Load testing and performance metrics', icon: '⚡' },
                  { name: 'Security Tests', description: 'Security vulnerability scanning', icon: '🔒' }
                ].map((suite) => (
                  <div key={suite.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{suite.icon}</span>
                      <h4 className="font-medium text-gray-900">{suite.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{suite.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {testResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🧪</div>
                  <p className="text-gray-600">No test results available. Run tests to see results here.</p>
                </div>
              </div>
            ) : (
              testResults.map((suite) => (
                <div key={suite.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{suite.name.replace('_', ' ')}</h3>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBgColor(suite.status)}`}>
                        {suite.status}
                      </span>
                      <span className="text-sm text-gray-600">{suite.duration}ms</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{suite.passed}</div>
                      <div className="text-sm text-gray-600">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{suite.failed}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{suite.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {suite.tests.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`w-2 h-2 rounded-full ${
                            test.status === 'passed' ? 'bg-green-500' : 
                            test.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></span>
                          <span className="text-sm font-medium text-gray-900">{test.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {test.duration && (
                            <span className="text-sm text-gray-600">{test.duration}ms</span>
                          )}
                          <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Coverage Tab */}
        {activeTab === 'coverage' && coverage && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Code Coverage Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{coverage.overall.statements}%</div>
                  <div className="text-sm text-gray-600">Statements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{coverage.overall.branches}%</div>
                  <div className="text-sm text-gray-600">Branches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{coverage.overall.functions}%</div>
                  <div className="text-sm text-gray-600">Functions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{coverage.overall.lines}%</div>
                  <div className="text-sm text-gray-600">Lines</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage by Module</h3>
              <div className="space-y-4">
                {Object.entries(coverage.by_module).map(([module, stats]: [string, any]) => (
                  <div key={module} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{module}</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Statements: </span>
                        <span className="font-medium">{stats.statements}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Branches: </span>
                        <span className="font-medium">{stats.branches}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Functions: </span>
                        <span className="font-medium">{stats.functions}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Lines: </span>
                        <span className="font-medium">{stats.lines}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && health && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  health.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {health.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Components</h4>
                  <div className="space-y-2">
                    {Object.entries(health.components).map(([component, status]: [string, any]) => (
                      <div key={component} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            status.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{component}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {status.response_time ? `${status.response_time}ms` : 
                           status.hit_rate ? `${status.hit_rate}%` : 
                           status.pending_jobs ? `${status.pending_jobs} jobs` : 'OK'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">System Metrics</h4>
                  <div className="space-y-2">
                    {Object.entries(health.metrics).map(([metric, value]) => (
                      <div key={metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900 capitalize">{metric.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}