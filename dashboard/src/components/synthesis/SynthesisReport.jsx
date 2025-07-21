import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Cpu, Zap, Clock, Thermometer, Download, RefreshCw, Settings, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const SynthesisReport = () => {
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedFPGA, setSelectedFPGA] = useState('Artix-7');

  // Sample synthesis report data
  const sampleReport = {
    overview: {
      design_name: 'adder_32bit',
      target_device: 'XC7A35T-1CPG236C',
      synthesis_time: '00:02:34',
      status: 'success',
      overall_score: 85,
      timestamp: '2024-01-15 14:32:17'
    },
    resource_utilization: {
      luts: { used: 68, available: 20800, percentage: 0.33 },
      ffs: { used: 96, available: 41600, percentage: 0.23 },
      brams: { used: 0, available: 50, percentage: 0 },
      dsps: { used: 0, available: 90, percentage: 0 },
      ios: { used: 67, available: 210, percentage: 31.9 },
      slices: { used: 25, available: 3300, percentage: 0.76 }
    },
    timing_analysis: {
      worst_negative_slack: 1.234,
      total_negative_slack: 0,
      failing_endpoints: 0,
      total_endpoints: 186,
      max_frequency: 425.3,
      target_frequency: 100,
      setup_slack: 1.234,
      hold_slack: 0.567,
      clock_skew: 0.123,
      critical_path: {
        delay: 2.351,
        logic_delay: 1.456,
        route_delay: 0.895,
        levels: 4,
        start_point: 'input_reg[0]',
        end_point: 'output_reg[31]'
      }
    },
    power_analysis: {
      total_power: 89.3,
      static_power: 28.7,
      dynamic_power: 60.6,
      io_power: 15.2,
      clocking_power: 8.9,
      logic_power: 36.5,
      signal_power: 28.4,
      power_efficiency: 4.76,
      thermal_margin: 45.3
    },
    optimization_opportunities: [
      {
        category: 'timing',
        priority: 'medium',
        description: 'Pipeline critical path to achieve higher frequency',
        estimated_improvement: '2-3x frequency increase',
        effort: 'medium'
      },
      {
        category: 'area',
        priority: 'low',
        description: 'Share arithmetic resources across clock domains',
        estimated_improvement: '15-20% LUT reduction',
        effort: 'high'
      },
      {
        category: 'power',
        priority: 'medium',
        description: 'Implement clock gating for conditional logic',
        estimated_improvement: '10-15% power reduction',
        effort: 'low'
      }
    ],
    warnings: [
      'Clock domain crossing detected between clk_a and clk_b',
      'Inferred latch for signal temp_value in always block',
      'Wide multiplexer may impact timing performance'
    ],
    comparison: {
      previous_runs: [
        { version: 'v1.0', score: 78, frequency: 387.2, power: 95.4, luts: 74 },
        { version: 'v1.1', score: 82, frequency: 412.8, power: 91.7, luts: 71 },
        { version: 'v1.2', score: 85, frequency: 425.3, power: 89.3, luts: 68 }
      ]
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate synthesis process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setReportData(sampleReport);
    setIsGenerating(false);
  };

  const getResourceData = () => {
    if (!reportData) return [];
    
    return [
      { resource: 'LUTs', used: reportData.resource_utilization.luts.used, available: reportData.resource_utilization.luts.available, percentage: reportData.resource_utilization.luts.percentage },
      { resource: 'FFs', used: reportData.resource_utilization.ffs.used, available: reportData.resource_utilization.ffs.available, percentage: reportData.resource_utilization.ffs.percentage },
      { resource: 'BRAMs', used: reportData.resource_utilization.brams.used, available: reportData.resource_utilization.brams.available, percentage: reportData.resource_utilization.brams.percentage },
      { resource: 'DSPs', used: reportData.resource_utilization.dsps.used, available: reportData.resource_utilization.dsps.available, percentage: reportData.resource_utilization.dsps.percentage },
      { resource: 'I/Os', used: reportData.resource_utilization.ios.used, available: reportData.resource_utilization.ios.available, percentage: reportData.resource_utilization.ios.percentage }
    ];
  };

  const getPowerData = () => {
    if (!reportData) return [];
    
    return [
      { name: 'Logic', value: reportData.power_analysis.logic_power, color: '#8884d8' },
      { name: 'Signals', value: reportData.power_analysis.signal_power, color: '#82ca9d' },
      { name: 'I/O', value: reportData.power_analysis.io_power, color: '#ffc658' },
      { name: 'Clocking', value: reportData.power_analysis.clocking_power, color: '#ff7300' }
    ];
  };

  const getPerformanceData = () => {
    if (!reportData) return [];
    
    return [
      { metric: 'Frequency', value: (reportData.timing_analysis.max_frequency / 500) * 100, fullMark: 100 },
      { metric: 'Resource Efficiency', value: Math.max(0, 100 - reportData.resource_utilization.luts.percentage), fullMark: 100 },
      { metric: 'Power Efficiency', value: Math.min(100, reportData.power_analysis.power_efficiency * 15), fullMark: 100 },
      { metric: 'Timing Margin', value: (reportData.timing_analysis.setup_slack / 2) * 100, fullMark: 100 },
      { metric: 'Overall Score', value: reportData.overview.overall_score, fullMark: 100 }
    ];
  };

  const getTrendData = () => {
    if (!reportData) return [];
    
    return reportData.comparison.previous_runs.map((run, idx) => ({
      version: run.version,
      score: run.score,
      frequency: run.frequency,
      power: run.power,
      luts: run.luts
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border-2 ${getScoreColor(reportData.overview.overall_score)}`}>
          <div className="text-center">
            <div className="text-3xl font-bold">{reportData.overview.overall_score}</div>
            <div className="text-sm">Overall Score</div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{reportData.timing_analysis.max_frequency.toFixed(1)}</div>
              <div className="text-sm text-blue-700">Max Frequency (MHz)</div>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{reportData.power_analysis.total_power}</div>
              <div className="text-sm text-purple-700">Total Power (mW)</div>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{reportData.resource_utilization.luts.percentage.toFixed(1)}%</div>
              <div className="text-sm text-green-700">LUT Utilization</div>
            </div>
            <Cpu className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Utilization */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Resource Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getResourceData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="resource" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value, name === 'percentage' ? 'Utilization %' : name]} />
              <Legend />
              <Bar dataKey="percentage" fill="#3B82F6" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={getPerformanceData()}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Warnings and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warnings */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4 text-yellow-700">Synthesis Warnings</h3>
          <div className="space-y-3">
            {reportData.warnings.map((warning, idx) => (
              <div key={idx} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-800">{warning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Opportunities */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4 text-green-700">Optimization Opportunities</h3>
          <div className="space-y-3">
            {reportData.optimization_opportunities.map((opp, idx) => (
              <div key={idx} className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-green-800 capitalize">{opp.category}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    opp.priority === 'high' ? 'bg-red-100 text-red-700' :
                    opp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {opp.priority} priority
                  </span>
                </div>
                <p className="text-sm text-green-700 mb-2">{opp.description}</p>
                <div className="flex justify-between text-xs text-green-600">
                  <span>Impact: {opp.estimated_improvement}</span>
                  <span>Effort: {opp.effort}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TimingTab = () => (
    <div className="space-y-6">
      {/* Timing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Setup Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Worst Negative Slack:</span>
              <span className={`font-medium ${reportData.timing_analysis.worst_negative_slack >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.timing_analysis.worst_negative_slack.toFixed(3)} ns
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Negative Slack:</span>
              <span className={`font-medium ${reportData.timing_analysis.total_negative_slack === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.timing_analysis.total_negative_slack.toFixed(3)} ns
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failing Endpoints:</span>
              <span className={`font-medium ${reportData.timing_analysis.failing_endpoints === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.timing_analysis.failing_endpoints}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Frequency Analysis</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600">
              {reportData.timing_analysis.max_frequency.toFixed(1)} MHz
            </div>
            <div className="text-sm text-gray-600">Maximum Frequency</div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Target:</span>
              <span>{reportData.timing_analysis.target_frequency} MHz</span>
            </div>
            <div className="flex justify-between">
              <span>Margin:</span>
              <span className="text-green-600">
                {((reportData.timing_analysis.max_frequency / reportData.timing_analysis.target_frequency) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Critical Path</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Delay:</span>
              <span className="font-medium">{reportData.timing_analysis.critical_path.delay.toFixed(3)} ns</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Logic Delay:</span>
              <span className="font-medium">{reportData.timing_analysis.critical_path.logic_delay.toFixed(3)} ns</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Route Delay:</span>
              <span className="font-medium">{reportData.timing_analysis.critical_path.route_delay.toFixed(3)} ns</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Logic Levels:</span>
              <span className="font-medium">{reportData.timing_analysis.critical_path.levels}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Path Details */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Critical Path Details</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Start Point:</span>
            <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">{reportData.timing_analysis.critical_path.start_point}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">End Point:</span>
            <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">{reportData.timing_analysis.critical_path.end_point}</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Path Analysis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Logic Percentage:</span>
                <span className="ml-2 font-medium">
                  {((reportData.timing_analysis.critical_path.logic_delay / reportData.timing_analysis.critical_path.delay) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-blue-700">Routing Percentage:</span>
                <span className="ml-2 font-medium">
                  {((reportData.timing_analysis.critical_path.route_delay / reportData.timing_analysis.critical_path.delay) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PowerTab = () => (
    <div className="space-y-6">
      {/* Power Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Total Power</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {reportData.power_analysis.total_power} mW
            </div>
            <div className="text-sm text-gray-600">
              {reportData.power_analysis.power_efficiency.toFixed(2)} MHz/mW efficiency
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Power Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Static:</span>
              <span className="font-medium">{reportData.power_analysis.static_power} mW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dynamic:</span>
              <span className="font-medium">{reportData.power_analysis.dynamic_power} mW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage Dynamic:</span>
              <span className="font-medium">
                {((reportData.power_analysis.dynamic_power / reportData.power_analysis.total_power) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Thermal Analysis</h3>
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-orange-600">
              {reportData.power_analysis.thermal_margin.toFixed(1)}°C
            </div>
            <div className="text-sm text-gray-600">Thermal Margin</div>
          </div>
          <div className="flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Power Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Power Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getPowerData()}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}mW`}
              >
                {getPowerData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Power Optimization</h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Current Efficiency</h4>
              <p className="text-2xl font-bold text-green-600">
                {reportData.power_analysis.power_efficiency.toFixed(2)} MHz/mW
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Optimization Recommendations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Implement clock gating for unused logic blocks</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use lower voltage operation where timing permits</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Optimize switching activity in high-fanout nets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TrendsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Design Evolution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getTrendData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="version" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} name="Overall Score" />
            <Line yAxisId="left" type="monotone" dataKey="frequency" stroke="#82ca9d" strokeWidth={2} name="Max Frequency (MHz)" />
            <Line yAxisId="right" type="monotone" dataKey="power" stroke="#ffc658" strokeWidth={2} name="Power (mW)" />
            <Line yAxisId="right" type="monotone" dataKey="luts" stroke="#ff7300" strokeWidth={2} name="LUTs Used" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-3">Performance Improvement</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{((reportData.timing_analysis.max_frequency / getTrendData()[0].frequency - 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Frequency increase since v1.0</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-3">Power Reduction</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              -{((1 - reportData.power_analysis.total_power / getTrendData()[0].power) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Power reduction since v1.0</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-3">Resource Optimization</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              -{((1 - reportData.resource_utilization.luts.used / getTrendData()[0].luts) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">LUT reduction since v1.0</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Synthesis Report</h1>
            </div>
            <div className="text-sm text-gray-500">
              Comprehensive FPGA Implementation Analysis
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Synthesizing...' : 'Re-synthesize'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {reportData && (
        <div className={`${reportData.overview.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-b px-6 py-2`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-2">
                {reportData.overview.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="capitalize">{reportData.overview.status}</span>
              </span>
              <span>Design: {reportData.overview.design_name}</span>
              <span>Device: {reportData.overview.target_device}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Synthesis Time: {reportData.overview.synthesis_time}</span>
              <span>{reportData.overview.timestamp}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'timing', label: 'Timing', icon: Clock },
            { id: 'power', label: 'Power', icon: Zap },
            { id: 'trends', label: 'Trends', icon: BarChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {isGenerating ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900">Running Synthesis...</p>
              <p className="text-sm text-gray-600">Analyzing design for {selectedFPGA}</p>
            </div>
          </div>
        ) : reportData ? (
          <>
            {selectedTab === 'overview' && <OverviewTab />}
            {selectedTab === 'timing' && <TimingTab />}
            {selectedTab === 'power' && <PowerTab />}
            {selectedTab === 'trends' && <TrendsTab />}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">No Synthesis Data</p>
              <p className="text-sm text-gray-600">Run synthesis to generate a comprehensive report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SynthesisReport;