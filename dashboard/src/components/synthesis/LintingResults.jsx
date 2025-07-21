import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, RefreshCw, Settings, Filter, Download } from 'lucide-react';

const LintingResults = () => {
  const [lintResults, setLintResults] = useState(null);
  const [isLinting, setIsLinting] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('severity');

  // Sample linting results
  const sampleLintResults = {
    summary: {
      total_issues: 12,
      errors: 2,
      warnings: 7,
      info: 3,
      score: 78,
      grade: 'B'
    },
    issues: [
      {
        id: 1,
        severity: 'error',
        category: 'syntax',
        rule: 'missing_semicolon',
        message: 'Missing semicolon at end of statement',
        line: 25,
        column: 34,
        code_snippet: '    assign sum = a + b + cin',
        suggestion: 'Add semicolon: assign sum = a + b + cin;',
        description: 'Verilog statements must end with a semicolon'
      },
      {
        id: 2,
        severity: 'error',
        category: 'logic',
        rule: 'inferred_latch',
        message: 'Incomplete case statement may infer latch',
        line: 42,
        column: 8,
        code_snippet: 'case (select)\n    2\'b00: out = a;\n    2\'b01: out = b;\nendcase',
        suggestion: 'Add default case or cover all possible values',
        description: 'Incomplete case statements create unintended latches which can cause timing issues'
      },
      {
        id: 3,
        severity: 'warning',
        category: 'style',
        rule: 'blocking_in_sequential',
        message: 'Using blocking assignment in sequential logic',
        line: 18,
        column: 12,
        code_snippet: 'always @(posedge clk)\n    count = count + 1;',
        suggestion: 'Use non-blocking assignment: count <= count + 1;',
        description: 'Sequential logic should use non-blocking assignments to avoid race conditions'
      },
      {
        id: 4,
        severity: 'warning',
        category: 'timing',
        rule: 'long_combinational_path',
        message: 'Combinational path may be too long for timing',
        line: 35,
        column: 5,
        code_snippet: 'assign result = ((a & b) | (c ^ d)) & ((e | f) ^ (g & h));',
        suggestion: 'Consider adding pipeline stages or reducing logic depth',
        description: 'Long combinational paths can limit maximum operating frequency'
      },
      {
        id: 5,
        severity: 'warning',
        category: 'synthesis',
        rule: 'wide_mux',
        message: 'Wide multiplexer detected, consider optimization',
        line: 58,
        column: 1,
        code_snippet: 'case (select_8bit)\n    // 256 case items...',
        suggestion: 'Use hierarchical muxing or pipeline stages',
        description: 'Wide multiplexers can consume excessive resources and impact timing'
      },
      {
        id: 6,
        severity: 'warning',
        rule: 'unused_signal',
        category: 'optimization',
        message: 'Signal declared but never used',
        line: 12,
        column: 9,
        code_snippet: 'wire [7:0] temp_signal;',
        suggestion: 'Remove unused signal or add usage',
        description: 'Unused signals consume unnecessary resources during synthesis'
      },
      {
        id: 7,
        severity: 'warning',
        category: 'style',
        rule: 'mixed_case_style',
        message: 'Inconsistent naming convention',
        line: 8,
        column: 15,
        code_snippet: 'wire ClockDivider_output;',
        suggestion: 'Use consistent naming: clock_divider_output',
        description: 'Consistent naming improves code readability and maintainability'
      },
      {
        id: 8,
        severity: 'warning',
        category: 'synthesis',
        rule: 'missing_timing_constraint',
        message: 'Clock signal without timing constraint',
        line: 5,
        column: 11,
        code_snippet: 'input clk,',
        suggestion: 'Add timing constraint: (* PERIOD = "10ns" *)',
        description: 'Clock signals should have explicit timing constraints for proper synthesis'
      },
      {
        id: 9,
        severity: 'info',
        category: 'optimization',
        rule: 'dsp_inference_opportunity',
        message: 'Arithmetic operation could use DSP block',
        line: 67,
        column: 20,
        code_snippet: 'assign product = a * b + c;',
        suggestion: 'Structure as (a * b) + c for DSP inference',
        description: 'DSP blocks provide efficient implementation for multiply-accumulate operations'
      },
      {
        id: 10,
        severity: 'info',
        category: 'documentation',
        rule: 'missing_module_comment',
        message: 'Module lacks description comment',
        line: 1,
        column: 1,
        code_snippet: 'module adder_32bit (',
        suggestion: 'Add module description comment',
        description: 'Module documentation improves code maintainability'
      },
      {
        id: 11,
        severity: 'info',
        category: 'style',
        rule: 'parameter_naming',
        message: 'Parameter could use descriptive name',
        line: 3,
        column: 15,
        code_snippet: 'parameter W = 8;',
        suggestion: 'Use descriptive name: parameter WIDTH = 8;',
        description: 'Descriptive parameter names improve code clarity'
      },
      {
        id: 12,
        severity: 'warning',
        category: 'portability',
        rule: 'vendor_specific_primitive',
        message: 'Using vendor-specific primitive',
        line: 89,
        column: 5,
        code_snippet: 'BUFG clk_buf (.I(clk_in), .O(clk_out));',
        suggestion: 'Consider using portable alternative or add vendor guards',
        description: 'Vendor-specific primitives limit design portability'
      }
    ],
    recommendations: [
      'Fix all error-level issues before synthesis',
      'Consider pipelining for timing-critical paths',
      'Use consistent coding style throughout the design',
      'Add proper timing constraints for all clocks',
      'Document module functionality and interfaces'
    ],
    rules_summary: {
      'Syntax Errors': { checked: 12, found: 1 },
      'Logic Issues': { checked: 8, found: 1 },
      'Style Guidelines': { checked: 15, found: 3 },
      'Timing Analysis': { checked: 6, found: 1 },
      'Synthesis Optimization': { checked: 10, found: 3 },
      'Documentation': { checked: 5, found: 1 }
    }
  };

  useEffect(() => {
    // Simulate initial linting
    handleRunLinting();
  }, []);

  const handleRunLinting = async () => {
    setIsLinting(true);
    
    // Simulate linting process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLintResults(sampleLintResults);
    setIsLinting(false);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
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

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredIssues = lintResults?.issues.filter(issue => {
    const severityMatch = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory;
    return severityMatch && categoryMatch;
  }).sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    if (sortBy === 'line') {
      return a.line - b.line;
    }
    if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    return 0;
  }) || [];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Linting Results</h1>
            </div>
            <div className="text-sm text-gray-500">
              Code Quality Analysis and Best Practices Validation
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunLinting}
              disabled={isLinting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLinting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isLinting ? 'Analyzing...' : 'Run Analysis'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {lintResults && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg border-2 ${getScoreColor(lintResults.summary.score)}`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{lintResults.summary.score}</div>
                <div className="text-sm">Quality Score</div>
                <div className="text-xs mt-1">Grade: {lintResults.summary.grade}</div>
              </div>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{lintResults.summary.errors}</div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{lintResults.summary.warnings}</div>
                  <div className="text-sm text-yellow-700">Warnings</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{lintResults.summary.info}</div>
                  <div className="text-sm text-blue-700">Info</div>
                </div>
                <Info className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-600">{lintResults.summary.total_issues}</div>
                  <div className="text-sm text-gray-700">Total Issues</div>
                </div>
                <Filter className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="syntax">Syntax</option>
              <option value="logic">Logic</option>
              <option value="style">Style</option>
              <option value="timing">Timing</option>
              <option value="synthesis">Synthesis</option>
              <option value="optimization">Optimization</option>
              <option value="documentation">Documentation</option>
              <option value="portability">Portability</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="severity">Severity</option>
              <option value="line">Line Number</option>
              <option value="category">Category</option>
            </select>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredIssues.length} of {lintResults?.summary.total_issues || 0} issues
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Issues List */}
        <div className="flex-1 overflow-auto p-6">
          {isLinting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-900">Analyzing Code Quality...</p>
                <p className="text-sm text-gray-600">Running comprehensive linting checks</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{issue.message}</h3>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {issue.category}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                            {issue.rule}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          {issue.description}
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            Line {issue.line}, Column {issue.column}:
                          </div>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
                            <pre>{issue.code_snippet}</pre>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="text-sm font-medium text-green-800 mb-1">
                            💡 Suggestion:
                          </div>
                          <div className="text-sm text-green-700">
                            {issue.suggestion}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredIssues.length === 0 && lintResults && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No issues found!</p>
                  <p className="text-sm text-gray-600">Your code meets all the selected criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Summary and Recommendations */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {lintResults && (
            <>
              {/* Rules Summary */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rules Summary</h3>
                <div className="space-y-3">
                  {Object.entries(lintResults.rules_summary).map(([rule, stats]) => (
                    <div key={rule} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{rule}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{stats.checked}</span>
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stats.found === 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${stats.found === 0 ? 100 : Math.min(100, (stats.found / stats.checked) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${
                          stats.found === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stats.found}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="flex-1 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {lintResults.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Fix all error-level issues first</li>
                    <li>2. Address timing-critical warnings</li>
                    <li>3. Improve code style consistency</li>
                    <li>4. Add missing documentation</li>
                    <li>5. Re-run analysis to verify fixes</li>
                  </ol>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Fix All Errors ({lintResults.summary.errors})
                  </button>
                  <button className="w-full px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                    Auto-fix Style Issues
                  </button>
                  <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LintingResults;