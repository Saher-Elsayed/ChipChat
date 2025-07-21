import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Target, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Download, Filter, Eye, BarChart3 } from 'lucide-react';

const CoverageViewer = () => {
  const [coverageData, setCoverageData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('functional');
  const [selectedModule, setSelectedModule] = useState('all');
  const [coverageGoal, setCoverageGoal] = useState(95);
  const [isRunning, setIsRunning] = useState(false);

  // Sample coverage data
  const sampleCoverageData = {
    summary: {
      overall_score: 87.3,
      functional_coverage: 92.1,
      code_coverage: 84.7,
      assertion_coverage: 89.2,
      total_bins: 2847,
      hit_bins: 2485,
      uncovered_bins: 362,
      total_tests: 15420,
      passing_tests: 15398
    },
    modules: {
      'adder_32bit': {
        functional: 95.7,
        code: 89.3,
        assertion: 92.1,
        line: 87.4,
        branch: 91.2,
        condition: 85.6,
        toggle: 88.9
      },
      'multiplier_16x16': {
        functional: 88.4,
        code: 82.1,
        assertion: 86.7,
        line: 84.2,
        branch: 79.8,
        condition: 82.4,
        toggle: 81.9
      },
      'memory_controller': {
        functional: 91.2,
        code: 87.9,
        assertion: 90.3,
        line: 89.1,
        branch: 86.7,
        condition: 87.8,
        toggle: 88.2
      },
      'uart_interface': {
        functional: 89.6,
        code: 85.4,
        assertion: 88.1,
        line: 86.3,
        branch: 84.5,
        condition: 85.2,
        toggle: 85.9
      }
    },
    functional_details: {
      'Input Combinations': {
        total_bins: 512,
        hit_bins: 487,
        coverage: 95.1,
        priority: 'high',
        uncovered: ['max_value + overflow', 'negative_zero_case', 'boundary_condition_3']
      },
      'Output Ranges': {
        total_bins: 256,
        hit_bins: 234,
        coverage: 91.4,
        priority: 'high',
        uncovered: ['saturated_positive', 'saturated_negative']
      },
      'State Transitions': {
        total_bins: 64,
        hit_bins: 59,
        coverage: 92.2,
        priority: 'medium',
        uncovered: ['error_to_reset', 'timeout_recovery']
      },
      'Cross Coverage': {
        total_bins: 1024,
        hit_bins: 892,
        coverage: 87.1,
        priority: 'medium',
        uncovered: ['input_a_max × input_b_max', 'carry_in × overflow']
      },
      'Corner Cases': {
        total_bins: 128,
        hit_bins: 115,
        coverage: 89.8,
        priority: 'high',
        uncovered: ['simultaneous_reset_enable', 'clock_edge_metastability']
      }
    },
    code_details: {
      'Statement Coverage': {
        total: 2847,
        covered: 2642,
        coverage: 92.8,
        uncovered_lines: [45, 67, 89, 123, 156]
      },
      'Branch Coverage': {
        total: 1256,
        covered: 1089,
        coverage: 86.7,
        uncovered_branches: ['if (error_flag) line 78', 'case (3\'b111) line 134']
      },
      'Condition Coverage': {
        total: 892,
        covered: 734,
        coverage: 82.3,
        uncovered_conditions: ['a && b && c (line 45)', '!reset || enable (line 89)']
      },
      'Toggle Coverage': {
        total: 3456,
        covered: 3021,
        coverage: 87.4,
        untoggled_signals: ['temp_reg[15:12]', 'debug_signals[7:4]']
      }
    },
    trends: [
      { iteration: 1, functional: 75.2, code: 68.9, assertion: 72.1 },
      { iteration: 2, functional: 82.1, code: 76.3, assertion: 79.8 },
      { iteration: 3, functional: 87.9, code: 81.2, assertion: 84.6 },
      { iteration: 4, functional: 90.5, code: 83.8, assertion: 87.2 },
      { iteration: 5, functional: 92.1, code: 84.7, assertion: 89.2 }
    ],
    recommendations: [
      {
        category: 'functional',
        priority: 'high',
        description: 'Add test cases for overflow conditions',
        impact: 'Will increase functional coverage by ~3%',
        effort: 'low'
      },
      {
        category: 'code',
        priority: 'medium',
        description: 'Exercise error handling paths in memory controller',
        impact: 'Will increase branch coverage by ~5%',
        effort: 'medium'
      },
      {
        category: 'assertion',
        priority: 'high',
        description: 'Add protocol compliance assertions for UART',
        impact: 'Will increase assertion coverage by ~4%',
        effort: 'low'
      }
    ]
  };

  useEffect(() => {
    handleRefreshCoverage();
  }, []);

  const handleRefreshCoverage = async () => {
    setIsRunning(true);
    
    // Simulate coverage collection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCoverageData(sampleCoverageData);
    setIsRunning(false);
  };

  const getOverallCoverageData = () => {
    if (!coverageData) return [];
    
    return [
      { name: 'Functional', value: coverageData.summary.functional_coverage, target: coverageGoal },
      { name: 'Code', value: coverageData.summary.code_coverage, target: coverageGoal },
      { name: 'Assertion', value: coverageData.summary.assertion_coverage, target: coverageGoal }
    ];
  };

  const getModuleCoverageData = () => {
    if (!coverageData) return [];
    
    return Object.entries(coverageData.modules).map(([module, metrics]) => ({
      module: module.replace(/_/g, ' '),
      functional: metrics.functional,
      code: metrics.code,
      assertion: metrics.assertion,
      overall: (metrics.functional + metrics.code + metrics.assertion) / 3
    }));
  };

  const getFunctionalDetailsData = () => {
    if (!coverageData) return [];
    
    return Object.entries(coverageData.functional_details).map(([category, details]) => ({
      category,
      coverage: details.coverage,
      hit_bins: details.hit_bins,
      total_bins: details.total_bins,
      priority: details.priority
    }));
  };

  const getCodeDetailsData = () => {
    if (!coverageData) return [];
    
    return Object.entries(coverageData.code_details).map(([type, details]) => ({
      type: type.replace(' Coverage', ''),
      coverage: details.coverage,
      covered: details.covered,
      total: details.total
    }));
  };

  const getTrendData = () => {
    if (!coverageData) return [];
    return coverageData.trends;
  };

  const getCoverageColor = (coverage) => {
    if (coverage >= coverageGoal) return 'text-green-600 bg-green-100';
    if (coverage >= coverageGoal - 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const FunctionalCoverageTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border-2 ${getCoverageColor(coverageData.summary.functional_coverage)}`}>
          <div className="text-center">
            <div className="text-3xl font-bold">{coverageData.summary.functional_coverage.toFixed(1)}%</div>
            <div className="text-sm">Functional Coverage</div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{coverageData.summary.hit_bins}</div>
            <div className="text-sm text-blue-700">Bins Hit</div>
            <div className="text-xs text-blue-600">of {coverageData.summary.total_bins}</div>
          </div>
        </div>
        
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{coverageData.summary.uncovered_bins}</div>
            <div className="text-sm text-purple-700">Uncovered Bins</div>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{coverageData.summary.passing_tests}</div>
            <div className="text-sm text-green-700">Passing Tests</div>
            <div className="text-xs text-green-600">of {coverageData.summary.total_tests}</div>
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Coverage Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getFunctionalDetailsData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="coverage" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Coverage Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Covered', value: coverageData.summary.hit_bins, color: '#10B981' },
                  { name: 'Uncovered', value: coverageData.summary.uncovered_bins, color: '#EF4444' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
              >
                <Cell fill="#10B981" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Uncovered Items */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Uncovered Coverage Points</h3>
        <div className="space-y-4">
          {Object.entries(coverageData.functional_details).map(([category, details]) => (
            details.uncovered.length > 0 && (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{category}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(details.priority)}`}>
                      {details.priority} priority
                    </span>
                    <span className="text-sm text-gray-600">
                      {details.coverage.toFixed(1)}% covered
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {details.uncovered.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{item}</code>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );

  const CodeCoverageTab = () => (
    <div className="space-y-6">
      {/* Code Coverage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {getCodeDetailsData().map((metric) => (
          <div key={metric.type} className={`p-4 rounded-lg border ${getCoverageColor(metric.coverage)}`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{metric.coverage.toFixed(1)}%</div>
              <div className="text-sm">{metric.type}</div>
              <div className="text-xs mt-1">
                {metric.covered}/{metric.total}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Code Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Code Coverage by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCodeDetailsData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="coverage" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Module Coverage Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getModuleCoverageData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="module" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="functional" fill="#3B82F6" name="Functional" />
              <Bar dataKey="code" fill="#10B981" name="Code" />
              <Bar dataKey="assertion" fill="#F59E0B" name="Assertion" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Uncovered Code Details */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Uncovered Code Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-red-700 mb-3">Uncovered Lines</h4>
            <div className="space-y-2">
              {coverageData.code_details['Statement Coverage'].uncovered_lines.map((line) => (
                <div key={line} className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Line {line}: Statement not executed</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-yellow-700 mb-3">Uncovered Branches</h4>
            <div className="space-y-2">
              {coverageData.code_details['Branch Coverage'].uncovered_branches.map((branch, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{branch}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TrendsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Coverage Evolution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getTrendData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="iteration" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="functional" stroke="#3B82F6" strokeWidth={2} name="Functional Coverage" />
            <Line type="monotone" dataKey="code" stroke="#10B981" strokeWidth={2} name="Code Coverage" />
            <Line type="monotone" dataKey="assertion" stroke="#F59E0B" strokeWidth={2} name="Assertion Coverage" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-3">Functional Progress</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              +{(coverageData.summary.functional_coverage - coverageData.trends[0].functional).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Improvement since start</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-3">Code Progress</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{(coverageData.summary.code_coverage - coverageData.trends[0].code).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Improvement since start</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-3">Assertion Progress</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              +{(coverageData.summary.assertion_coverage - coverageData.trends[0].assertion).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Improvement since start</div>
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
              <Target className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Coverage Viewer</h1>
            </div>
            <div className="text-sm text-gray-500">
              Comprehensive Verification Coverage Analysis
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Goal:</label>
              <input
                type="number"
                min="50"
                max="100"
                value={coverageGoal}
                onChange={(e) => setCoverageGoal(parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
            
            <button
              onClick={handleRefreshCoverage}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isRunning ? 'Collecting...' : 'Refresh'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      {coverageData && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Coverage Progress</span>
            <span className="text-sm text-gray-600">
              {coverageData.summary.overall_score.toFixed(1)}% (Goal: {coverageGoal}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                coverageData.summary.overall_score >= coverageGoal ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, coverageData.summary.overall_score)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'functional', label: 'Functional Coverage', icon: Target },
            { id: 'code', label: 'Code Coverage', icon: Eye },
            { id: 'trends', label: 'Trends', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                selectedMetric === tab.id
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
        {isRunning ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900">Collecting Coverage Data...</p>
              <p className="text-sm text-gray-600">Analyzing verification results</p>
            </div>
          </div>
        ) : coverageData ? (
          <>
            {selectedMetric === 'functional' && <FunctionalCoverageTab />}
            {selectedMetric === 'code' && <CodeCoverageTab />}
            {selectedMetric === 'trends' && <TrendsTab />}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">No Coverage Data</p>
              <p className="text-sm text-gray-600">Run verification to collect coverage metrics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverageViewer;