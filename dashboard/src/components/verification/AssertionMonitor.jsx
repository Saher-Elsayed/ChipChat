import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Play, Pause, Square, Filter, Download, Eye, Activity } from 'lucide-react';

const AssertionMonitor = () => {
  const [assertions, setAssertions] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [monitoringStats, setMonitoringStats] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);

  // Sample assertions data
  const sampleAssertions = [
    {
      id: 'ASSERT_001',
      name: 'valid_input_range',
      description: 'Input values must be within valid range [0, 255]',
      module: 'input_validator',
      category: 'functional',
      severity: 'error',
      status: 'passing',
      pass_count: 15420,
      fail_count: 0,
      last_triggered: null,
      code: 'assert (input_val >= 0 && input_val <= 255) else $error("Input out of range: %d", input_val);',
      line: 45,
      enabled: true
    },
    {
      id: 'ASSERT_002', 
      name: 'clock_frequency_check',
      description: 'Clock frequency must not exceed 500MHz',
      module: 'clock_manager',
      category: 'timing',
      severity: 'warning',
      status: 'passing',
      pass_count: 8945,
      fail_count: 0,
      last_triggered: null,
      code: 'assert ($realtime - $past($realtime) >= 2.0) else $warning("Clock too fast");',
      line: 78,
      enabled: true
    },
    {
      id: 'ASSERT_003',
      name: 'fifo_overflow_protection',
      description: 'FIFO should not overflow when full',
      module: 'fifo_controller',
      category: 'protocol',
      severity: 'error',
      status: 'failing',
      pass_count: 12340,
      fail_count: 3,
      last_triggered: '2024-01-15 14:32:17.234',
      code: 'assert (!(fifo_full && write_enable)) else $error("FIFO overflow detected");',
      line: 134,
      enabled: true
    },
    {
      id: 'ASSERT_004',
      name: 'reset_sequence_check',
      description: 'Reset must be held for minimum 10 clock cycles',
      module: 'reset_controller',
      category: 'timing',
      severity: 'error',
      status: 'passing',
      pass_count: 567,
      fail_count: 0,
      last_triggered: null,
      code: 'assert ($rose(reset_n) |-> $past(reset_n, 10) == 0) else $error("Reset too short");',
      line: 23,
      enabled: true
    },
    {
      id: 'ASSERT_005',
      name: 'handshake_protocol',
      description: 'Valid signal must be stable when ready is low',
      module: 'axi_interface',
      category: 'protocol',
      severity: 'error',
      status: 'passing',
      pass_count: 23456,
      fail_count: 0,
      last_triggered: null,
      code: 'assert (!ready |-> $stable(valid)) else $error("Valid changed while not ready");',
      line: 89,
      enabled: true
    },
    {
      id: 'ASSERT_006',
      name: 'power_domain_isolation',
      description: 'Signals must be isolated when power domain is off',
      module: 'power_manager',
      category: 'power',
      severity: 'warning',
      status: 'not_triggered',
      pass_count: 0,
      fail_count: 0,
      last_triggered: null,
      code: 'assert (power_off |-> (iso_signals == 0)) else $warning("Isolation failure");',
      line: 156,
      enabled: false
    },
    {
      id: 'ASSERT_007',
      name: 'memory_access_bounds',
      description: 'Memory access must be within allocated bounds',
      module: 'memory_controller',
      category: 'functional',
      severity: 'error',
      status: 'failing',
      pass_count: 8934,
      fail_count: 12,
      last_triggered: '2024-01-15 14:28:43.567',
      code: 'assert (mem_addr < MEM_SIZE) else $error("Memory access out of bounds: 0x%h", mem_addr);',
      line: 203,
      enabled: true
    },
    {
      id: 'ASSERT_008',
      name: 'interrupt_acknowledgment',
      description: 'Interrupt must be acknowledged within timeout',
      module: 'interrupt_controller',
      category: 'timing',
      severity: 'warning',
      status: 'passing',
      pass_count: 4567,
      fail_count: 0,
      last_triggered: null,
      code: 'assert (interrupt |-> ##[1:100] ack) else $warning("Interrupt timeout");',
      line: 67,
      enabled: true
    }
  ];

  const sampleStats = {
    summary: {
      total_assertions: 8,
      enabled_assertions: 7,
      passing_assertions: 5,
      failing_assertions: 2,
      not_triggered: 1,
      total_pass_count: 74229,
      total_fail_count: 15,
      coverage_percentage: 87.5
    },
    categories: {
      'functional': { total: 2, passing: 1, failing: 1 },
      'timing': { total: 3, passing: 3, failing: 0 },
      'protocol': { total: 2, passing: 1, failing: 1 },
      'power': { total: 1, passing: 0, failing: 0 }
    },
    severity_distribution: {
      'error': { count: 5, failing: 2 },
      'warning': { count: 3, failing: 0 }
    },
    recent_failures: [
      {
        assertion_id: 'ASSERT_003',
        timestamp: '2024-01-15 14:32:17.234',
        message: 'FIFO overflow detected',
        context: 'fifo_full=1, write_enable=1',
        simulation_time: '1234567 ns'
      },
      {
        assertion_id: 'ASSERT_007',
        timestamp: '2024-01-15 14:28:43.567', 
        message: 'Memory access out of bounds: 0x10000',
        context: 'mem_addr=0x10000, MEM_SIZE=0x8000',
        simulation_time: '987654 ns'
      }
    ]
  };

  // Real-time monitoring data
  const generateRealTimeData = () => {
    const data = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      data.push({
        time: new Date(now - i * 1000).toLocaleTimeString(),
        pass_rate: 95 + Math.random() * 4,
        active_assertions: 7 + Math.floor(Math.random() * 2),
        failures: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0
      });
    }
    return data;
  };

  useEffect(() => {
    setAssertions(sampleAssertions);
    setMonitoringStats(sampleStats);
    setRealTimeData(generateRealTimeData());
  }, []);

  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(() => {
        setRealTimeData(prev => {
          const newData = [...prev.slice(1)];
          newData.push({
            time: new Date().toLocaleTimeString(),
            pass_rate: 95 + Math.random() * 4,
            active_assertions: 7 + Math.floor(Math.random() * 2),
            failures: Math.random() > 0.9 ? Math.floor(Math.random() * 2) : 0
          });
          return newData;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passing':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failing':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'not_triggered':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'functional': 'bg-blue-100 text-blue-800',
      'timing': 'bg-green-100 text-green-800',
      'protocol': 'bg-purple-100 text-purple-800',
      'power': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredAssertions = assertions.filter(assertion => {
    const categoryMatch = selectedCategory === 'all' || assertion.category === selectedCategory;
    const severityMatch = selectedSeverity === 'all' || assertion.severity === selectedSeverity;
    return categoryMatch && severityMatch;
  });

  const getAssertionStatsData = () => {
    if (!monitoringStats) return [];
    
    return Object.entries(monitoringStats.categories).map(([category, stats]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      total: stats.total,
      passing: stats.passing,
      failing: stats.failing,
      pass_rate: stats.total > 0 ? (stats.passing / stats.total) * 100 : 0
    }));
  };

  const getSeverityData = () => {
    if (!monitoringStats) return [];
    
    return Object.entries(monitoringStats.severity_distribution).map(([severity, data]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: data.count,
      failing: data.failing,
      color: severity === 'error' ? '#EF4444' : '#F59E0B'
    }));
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Assertion Monitor</h1>
            </div>
            <div className="text-sm text-gray-500">
              Real-time SystemVerilog Assertion Monitoring
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isMonitoring ? (
              <button
                onClick={handleStartMonitoring}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Start Monitoring</span>
              </button>
            ) : (
              <button
                onClick={handleStopMonitoring}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Stop Monitoring</span>
              </button>
            )}
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {monitoringStats && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <span className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span>{isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}</span>
              </span>
              <span>Total: {monitoringStats.summary.total_assertions}</span>
              <span className="text-green-600">Passing: {monitoringStats.summary.passing_assertions}</span>
              <span className="text-red-600">Failing: {monitoringStats.summary.failing_assertions}</span>
              <span>Coverage: {monitoringStats.summary.coverage_percentage}%</span>
            </div>
            <div className="text-sm text-gray-600">
              Last Update: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Left Panel - Real-time Monitoring */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Real-time Monitoring</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {monitoringStats?.summary.passing_assertions || 0}
                </div>
                <div className="text-sm text-green-700">Passing</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {monitoringStats?.summary.failing_assertions || 0}
                </div>
                <div className="text-sm text-red-700">Failing</div>
              </div>
            </div>

            {/* Real-time Chart */}
            <div className="h-48">
              <h3 className="text-sm font-medium mb-2">Pass Rate Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="pass_rate" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={false}
                    name="Pass Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Failures */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium mb-3">Recent Failures</h3>
            <div className="space-y-3">
              {monitoringStats?.recent_failures.map((failure, idx) => (
                <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-red-800 text-sm">{failure.assertion_id}</span>
                    <span className="text-xs text-red-600">{failure.timestamp}</span>
                  </div>
                  <p className="text-sm text-red-700 mb-1">{failure.message}</p>
                  <p className="text-xs text-red-600">{failure.context}</p>
                  <p className="text-xs text-red-500">@ {failure.simulation_time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="functional">Functional</option>
                  <option value="timing">Timing</option>
                  <option value="protocol">Protocol</option>
                  <option value="power">Power</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Severity:</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
              
              <div className="flex-1"></div>
              
              <div className="text-sm text-gray-600">
                Showing {filteredAssertions.length} of {assertions.length} assertions
              </div>
            </div>
          </div>

          {/* Assertions List */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              {filteredAssertions.map((assertion) => (
                <div
                  key={assertion.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    assertion.status === 'failing' 
                      ? 'border-red-500 bg-red-50' 
                      : assertion.status === 'passing' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-500 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(assertion.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-medium text-gray-900">{assertion.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(assertion.severity)}`}>
                            {assertion.severity}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(assertion.category)}`}>
                            {assertion.category}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{assertion.description}</p>
                        
                        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm overflow-x-auto mb-3">
                          <pre>{assertion.code}</pre>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Module: {assertion.module}</span>
                          <span>Line: {assertion.line}</span>
                          <span className="text-green-600">Passed: {assertion.pass_count}</span>
                          {assertion.fail_count > 0 && (
                            <span className="text-red-600">Failed: {assertion.fail_count}</span>
                          )}
                          {assertion.last_triggered && (
                            <span className="text-orange-600">Last Failed: {assertion.last_triggered}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const updated = assertions.map(a => 
                            a.id === assertion.id ? {...a, enabled: !a.enabled} : a
                          );
                          setAssertions(updated);
                        }}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          assertion.enabled 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {assertion.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Statistics */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Statistics</h2>
            
            {/* Category Breakdown */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">By Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getAssertionStatsData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="passing" fill="#10B981" name="Passing" />
                  <Bar dataKey="failing" fill="#EF4444" name="Failing" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Severity Distribution */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">By Severity</h3>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={getSeverityData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {getSeverityData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium mb-3">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Pass Count:</span>
                <span className="font-medium">{monitoringStats?.summary.total_pass_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fail Count:</span>
                <span className="font-medium text-red-600">{monitoringStats?.summary.total_fail_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pass Rate:</span>
                <span className="font-medium text-green-600">
                  {monitoringStats ? (
                    (monitoringStats.summary.total_pass_count / 
                     (monitoringStats.summary.total_pass_count + monitoringStats.summary.total_fail_count) * 100).toFixed(2)
                  ) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coverage:</span>
                <span className="font-medium">{monitoringStats?.summary.coverage_percentage}%</span>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enable power domain assertions</li>
                <li>• Add more protocol coverage</li>
                <li>• Investigate FIFO overflow failures</li>
                <li>• Review memory bounds checking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssertionMonitor;