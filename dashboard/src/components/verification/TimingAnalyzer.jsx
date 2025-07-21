import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, Area, AreaChart } from 'recharts';
import { Clock, Zap, AlertTriangle, TrendingUp, TrendingDown, Target, RefreshCw, Download, Filter, Eye, Activity } from 'lucide-react';

const TimingAnalyzer = () => {
  const [timingData, setTimingData] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('setup');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clockDomain, setClockDomain] = useState('all');

  // Sample timing analysis data
  const sampleTimingData = {
    summary: {
      setup_analysis: {
        wns: 1.234,
        tns: 0,
        failing_endpoints: 0,
        total_endpoints: 1247,
        max_frequency: 425.3,
        target_frequency: 100,
        timing_met: true
      },
      hold_analysis: {
        wns: 0.567,
        tns: 0,
        failing_endpoints: 0,
        total_endpoints: 1247,
        timing_met: true
      },
      clock_summary: {
        'clk_main': {
          frequency: 100,
          period: 10.0,
          skew: 0.123,
          jitter: 0.045,
          setup_slack: 1.234,
          hold_slack: 0.567,
          endpoints: 856
        },
        'clk_ddr': {
          frequency: 200,
          period: 5.0,
          skew: 0.089,
          jitter: 0.032,
          setup_slack: 0.892,
          hold_slack: 0.234,
          endpoints: 391
        }
      }
    },
    critical_paths: [
      {
        id: 'PATH_001',
        type: 'setup',
        slack: 1.234,
        delay: 8.766,
        requirement: 10.0,
        start_point: 'input_reg[0]/CLK',
        end_point: 'output_reg[31]/D',
        clock_domain: 'clk_main',
        logic_levels: 8,
        segments: [
          { type: 'clock', delay: 0.123, cumulative: 0.123, description: 'Clock network delay' },
          { type: 'register', delay: 0.245, cumulative: 0.368, description: 'Register Tcko' },
          { type: 'logic', delay: 1.456, cumulative: 1.824, description: 'Combinational logic' },
          { type: 'net', delay: 0.234, cumulative: 2.058, description: 'Net delay' },
          { type: 'logic', delay: 2.134, cumulative: 4.192, description: 'Adder logic' },
          { type: 'net', delay: 0.189, cumulative: 4.381, description: 'Net delay' },
          { type: 'logic', delay: 1.567, cumulative: 5.948, description: 'Multiplexer' },
          { type: 'net', delay: 0.167, cumulative: 6.115, description: 'Net delay' },
          { type: 'logic', delay: 2.234, cumulative: 8.349, description: 'Output logic' },
          { type: 'setup', delay: 0.417, cumulative: 8.766, description: 'Setup time' }
        ]
      },
      {
        id: 'PATH_002',
        type: 'setup',
        slack: 0.892,
        delay: 4.108,
        requirement: 5.0,
        start_point: 'ddr_reg[15]/CLK',
        end_point: 'ddr_out[7]/D',
        clock_domain: 'clk_ddr',
        logic_levels: 5,
        segments: [
          { type: 'clock', delay: 0.089, cumulative: 0.089, description: 'Clock network delay' },
          { type: 'register', delay: 0.198, cumulative: 0.287, description: 'Register Tcko' },
          { type: 'logic', delay: 1.234, cumulative: 1.521, description: 'DDR logic' },
          { type: 'net', delay: 0.145, cumulative: 1.666, description: 'Net delay' },
          { type: 'logic', delay: 1.892, cumulative: 3.558, description: 'Interface logic' },
          { type: 'net', delay: 0.234, cumulative: 3.792, description: 'Net delay' },
          { type: 'setup', delay: 0.316, cumulative: 4.108, description: 'Setup time' }
        ]
      },
      {
        id: 'PATH_003',
        type: 'hold',
        slack: 0.567,
        delay: 0.433,
        requirement: 1.0,
        start_point: 'ctrl_reg[3]/CLK',
        end_point: 'ctrl_reg[3]/D',
        clock_domain: 'clk_main',
        logic_levels: 2,
        segments: [
          { type: 'clock', delay: 0.123, cumulative: 0.123, description: 'Clock network delay' },
          { type: 'register', delay: 0.156, cumulative: 0.279, description: 'Register Tcko' },
          { type: 'logic', delay: 0.089, cumulative: 0.368, description: 'Feedback logic' },
          { type: 'net', delay: 0.065, cumulative: 0.433, description: 'Net delay' }
        ]
      }
    ],
    slack_histogram: [
      { range: '< 0', count: 0, percentage: 0 },
      { range: '0-0.5', count: 89, percentage: 7.1 },
      { range: '0.5-1.0', count: 234, percentage: 18.8 },
      { range: '1.0-1.5', count: 456, percentage: 36.6 },
      { range: '1.5-2.0', count: 312, percentage: 25.0 },
      { range: '> 2.0', count: 156, percentage: 12.5 }
    ],
    timing_trends: [
      { iteration: 1, wns: 0.234, max_freq: 234.5, failing_paths: 45 },
      { iteration: 2, wns: 0.567, max_freq: 289.3, failing_paths: 23 },
      { iteration: 3, wns: 0.892, max_freq: 345.2, failing_paths: 8 },
      { iteration: 4, wns: 1.123, max_freq: 387.9, failing_paths: 2 },
      { iteration: 5, wns: 1.234, max_freq: 425.3, failing_paths: 0 }
    ],
    clock_domains: {
      'clk_main': {
        paths: 856,
        avg_slack: 1.567,
        min_slack: 0.234,
        max_slack: 3.456,
        violations: 0
      },
      'clk_ddr': {
        paths: 391,
        avg_slack: 1.234,
        min_slack: 0.567,
        max_slack: 2.234,
        violations: 0
      }
    },
    recommendations: [
      {
        category: 'optimization',
        priority: 'medium',
        description: 'Pipeline the adder logic to improve timing margin',
        impact: 'Could improve WNS by 0.5-1.0 ns',
        effort: 'medium'
      },
      {
        category: 'constraints',
        priority: 'low',
        description: 'Tighten clock constraints to match target frequency',
        impact: 'Better timing closure accuracy',
        effort: 'low'
      },
      {
        category: 'floorplan',
        priority: 'low',
        description: 'Place related logic closer to reduce routing delay',
        impact: 'Could improve timing by 0.2-0.4 ns',
        effort: 'high'
      }
    ]
  };

  useEffect(() => {
    handleRunAnalysis();
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate timing analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setTimingData(sampleTimingData);
    setIsAnalyzing(false);
  };

  const getSlackColor = (slack) => {
    if (slack < 0) return 'text-red-600 bg-red-100';
    if (slack < 0.5) return 'text-orange-600 bg-orange-100';
    if (slack < 1.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPathTypeIcon = (type) => {
    switch (type) {
      case 'setup':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'hold':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSegmentColor = (type) => {
    const colors = {
      'clock': '#3B82F6',    // blue
      'register': '#10B981', // green
      'logic': '#F59E0B',    // yellow
      'net': '#8B5CF6',      // purple
      'setup': '#EF4444'     // red
    };
    return colors[type] || '#6B7280';
  };

  const filteredPaths = timingData?.critical_paths.filter(path => {
    const domainMatch = clockDomain === 'all' || path.clock_domain === clockDomain;
    const typeMatch = analysisMode === 'all' || path.type === analysisMode;
    return domainMatch && typeMatch;
  }) || [];

  const getClockSummaryData = () => {
    if (!timingData) return [];
    
    return Object.entries(timingData.summary.clock_summary).map(([clock, data]) => ({
      clock,
      frequency: data.frequency,
      setup_slack: data.setup_slack,
      hold_slack: data.hold_slack,
      skew: data.skew,
      endpoints: data.endpoints
    }));
  };

  const getSlackHistogramData = () => {
    if (!timingData) return [];
    return timingData.slack_histogram;
  };

  const getTrendData = () => {
    if (!timingData) return [];
    return timingData.timing_trends;
  };

  const PathDetailModal = ({ path, onClose }) => {
    if (!path) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Path Details: {path.id}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Path Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{path.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slack:</span>
                  <span className={`font-medium ${path.slack >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {path.slack.toFixed(3)} ns
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delay:</span>
                  <span>{path.delay.toFixed(3)} ns</span>
                </div>
                <div className="flex justify-between">
                  <span>Requirement:</span>
                  <span>{path.requirement.toFixed(3)} ns</span>
                </div>
                <div className="flex justify-between">
                  <span>Logic Levels:</span>
                  <span>{path.logic_levels}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Endpoints</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Start:</span>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                    {path.start_point}
                  </code>
                </div>
                <div>
                  <span className="text-gray-600">End:</span>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                    {path.end_point}
                  </code>
                </div>
                <div>
                  <span className="text-gray-600">Clock Domain:</span>
                  <span className="ml-2 font-medium">{path.clock_domain}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Path Segments</h3>
            <div className="space-y-2">
              {path.segments.map((segment, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getSegmentColor(segment.type) }}
                  ></div>
                  <div className="flex-1">
                    <span className="font-medium capitalize">{segment.type}</span>
                    <span className="ml-2 text-gray-600">{segment.description}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    +{segment.delay.toFixed(3)} ns
                  </div>
                  <div className="text-sm font-medium">
                    {segment.cumulative.toFixed(3)} ns
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Timing Analyzer</h1>
            </div>
            <div className="text-sm text-gray-500">
              Static Timing Analysis and Path Optimization
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      {timingData && (
        <div className={`${timingData.summary.setup_analysis.timing_met ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-b px-6 py-3`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center space-x-2">
                {timingData.summary.setup_analysis.timing_met ? (
                  <Target className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span>{timingData.summary.setup_analysis.timing_met ? 'Timing Met' : 'Timing Violations'}</span>
              </span>
              <span>WNS: {timingData.summary.setup_analysis.wns.toFixed(3)} ns</span>
              <span>Max Freq: {timingData.summary.setup_analysis.max_frequency.toFixed(1)} MHz</span>
              <span>Failing Paths: {timingData.summary.setup_analysis.failing_endpoints}</span>
            </div>
            <div>Last Analysis: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Analysis:</label>
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="setup">Setup</option>
              <option value="hold">Hold</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Clock Domain:</label>
            <select
              value={clockDomain}
              onChange={(e) => setClockDomain(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="clk_main">clk_main</option>
              <option value="clk_ddr">clk_ddr</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-900">Running Timing Analysis...</p>
                <p className="text-sm text-gray-600">Analyzing critical paths and slack distribution</p>
              </div>
            </div>
          ) : timingData ? (
            <div className="space-y-6">
              {/* Overview Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clock Summary */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Clock Domain Summary</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getClockSummaryData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="clock" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="setup_slack" fill="#3B82F6" name="Setup Slack (ns)" />
                      <Bar dataKey="hold_slack" fill="#10B981" name="Hold Slack (ns)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Slack Distribution */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Slack Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getSlackHistogramData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Timing Trends */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Timing Optimization Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="iteration" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="wns" stroke="#3B82F6" strokeWidth={2} name="WNS (ns)" />
                    <Line yAxisId="left" type="monotone" dataKey="max_freq" stroke="#10B981" strokeWidth={2} name="Max Freq (MHz)" />
                    <Line yAxisId="right" type="monotone" dataKey="failing_paths" stroke="#EF4444" strokeWidth={2} name="Failing Paths" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Critical Paths */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Critical Paths</h3>
                <div className="space-y-3">
                  {filteredPaths.map((path) => (
                    <div
                      key={path.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedPath(path)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getPathTypeIcon(path.type)}
                          <span className="font-medium">{path.id}</span>
                          <span className={`px-2 py-1 text-xs rounded ${getSlackColor(path.slack)}`}>
                            {path.slack.toFixed(3)} ns slack
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{path.delay.toFixed(3)} ns delay</span>
                          <span>{path.logic_levels} levels</span>
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="mb-1">
                          <span className="font-medium">From:</span> 
                          <code className="ml-2 bg-gray-100 px-1 rounded text-xs">{path.start_point}</code>
                        </div>
                        <div>
                          <span className="font-medium">To:</span> 
                          <code className="ml-2 bg-gray-100 px-1 rounded text-xs">{path.end_point}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No Timing Data</p>
                <p className="text-sm text-gray-600">Run timing analysis to view results</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Recommendations */}
        {timingData && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-4">Optimization Recommendations</h3>
            
            <div className="space-y-4">
              {timingData.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{rec.category}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                  <div className="text-xs text-gray-600">
                    <div>Impact: {rec.impact}</div>
                    <div>Effort: {rec.effort}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Quick Stats</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>WNS:</span>
                  <span>{timingData.summary.setup_analysis.wns.toFixed(3)} ns</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Freq:</span>
                  <span>{timingData.summary.setup_analysis.max_frequency.toFixed(1)} MHz</span>
                </div>
                <div className="flex justify-between">
                  <span>Endpoints:</span>
                  <span>{timingData.summary.setup_analysis.total_endpoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Violations:</span>
                  <span>{timingData.summary.setup_analysis.failing_endpoints}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Path Detail Modal */}
      {selectedPath && (
        <PathDetailModal 
          path={selectedPath} 
          onClose={() => setSelectedPath(null)} 
        />
      )}
    </div>
  );
};

export default TimingAnalyzer;