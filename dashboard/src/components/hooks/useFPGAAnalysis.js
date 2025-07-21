// useFPGAAnalysis Hook - Comprehensive FPGA Analysis State Management
// Manages timing, power, resource analysis, and optimization workflows

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import FPGAAnalyzer from '../services/fpgaAnalyzer.js';
import FPGACalculations from '../utils/fpgaCalculations.js';
import VerilogLinter from '../services/verilogLinter.js';

const useFPGAAnalysis = (initialConfig = {}) => {
  // Core analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Configuration state
  const [analysisConfig, setAnalysisConfig] = useState({
    target_device: 'Artix-7',
    target_frequency: 100, // MHz
    operating_conditions: {
      temperature: 25, // Celsius
      voltage: 1.0,    // V
      speed_grade: -1
    },
    analysis_scope: ['timing', 'power', 'resources'],
    optimization_goals: ['performance', 'area', 'power'],
    ...initialConfig
  });

  // Real-time monitoring state
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringData, setMonitoringData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Comparison state
  const [comparisonResults, setComparisonResults] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);

  // Service instances
  const analyzer = useRef(new FPGAAnalyzer());
  const calculator = useRef(new FPGACalculations());
  const linter = useRef(new VerilogLinter());

  // Analysis counter for unique IDs
  const analysisCounter = useRef(0);

  // Main analysis function
  const runAnalysis = useCallback(async (verilogCode, designIntent, options = {}) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setAnalysisProgress(0);

      const analysisId = ++analysisCounter.current;
      const startTime = Date.now();

      // Step 1: Validate inputs (10%)
      setAnalysisProgress(10);
      if (!verilogCode || !designIntent) {
        throw new Error('Verilog code and design intent are required');
      }

      // Step 2: Run comprehensive FPGA analysis (30%)
      setAnalysisProgress(30);
      const fpgaAnalysis = await analyzer.current.analyzeDesign(
        verilogCode,
        designIntent,
        analysisConfig.target_device,
        {
          frequency: analysisConfig.target_frequency,
          temperature: analysisConfig.operating_conditions.temperature,
          voltage: analysisConfig.operating_conditions.voltage,
          speed_grade: analysisConfig.operating_conditions.speed_grade
        }
      );

      if (!fpgaAnalysis.success) {
        throw new Error(fpgaAnalysis.error || 'FPGA analysis failed');
      }

      // Step 3: Run detailed timing analysis (50%)
      setAnalysisProgress(50);
      const timingAnalysis = calculator.current.calculateTiming({
        device: analysisConfig.target_device,
        component: designIntent.component,
        width: designIntent.parameters?.width || 8,
        frequency: analysisConfig.target_frequency,
        temperature: analysisConfig.operating_conditions.temperature,
        voltage: analysisConfig.operating_conditions.voltage,
        speed_grade: analysisConfig.operating_conditions.speed_grade
      });

      // Step 4: Run power analysis (60%)
      setAnalysisProgress(60);
      const powerAnalysis = calculator.current.calculatePower({
        device: analysisConfig.target_device,
        frequency: analysisConfig.target_frequency,
        temperature: analysisConfig.operating_conditions.temperature,
        voltage: analysisConfig.operating_conditions.voltage,
        utilization: fpgaAnalysis.analysis.resource_analysis
      });

      // Step 5: Run thermal analysis (70%)
      setAnalysisProgress(70);
      const thermalAnalysis = calculator.current.calculateThermalAnalysis(
        {
          device: analysisConfig.target_device,
          frequency: analysisConfig.target_frequency,
          utilization: fpgaAnalysis.analysis.resource_analysis
        },
        {
          ambient_temperature: analysisConfig.operating_conditions.temperature,
          package_type: 'BGA'
        }
      );

      // Step 6: Run optimization analysis (80%)
      setAnalysisProgress(80);
      const optimizationAnalysis = calculator.current.analyzeOptimizations({
        device: analysisConfig.target_device,
        component: designIntent.component,
        architecture: designIntent.architecture || 'auto',
        width: designIntent.parameters?.width || 8,
        frequency: analysisConfig.target_frequency
      });

      // Step 7: Run code quality analysis (90%)
      setAnalysisProgress(90);
      const qualityAnalysis = linter.current.lintVerilogCode(verilogCode);

      // Step 8: Compile comprehensive results (100%)
      setAnalysisProgress(100);
      const analysisResult = {
        id: analysisId,
        timestamp: new Date().toISOString(),
        execution_time: Date.now() - startTime,
        config: { ...analysisConfig },
        design_info: {
          intent: designIntent,
          code_metrics: {
            lines_of_code: verilogCode.split('\n').length,
            complexity: qualityAnalysis.summary?.score || 0
          }
        },
        fpga_analysis: fpgaAnalysis.analysis,
        timing_analysis: timingAnalysis,
        power_analysis: powerAnalysis,
        thermal_analysis: thermalAnalysis,
        optimization_analysis: optimizationAnalysis,
        quality_analysis: qualityAnalysis,
        overall_score: calculateOverallScore({
          timing: timingAnalysis,
          power: powerAnalysis,
          thermal: thermalAnalysis,
          quality: qualityAnalysis,
          optimization: optimizationAnalysis
        }),
        recommendations: generateRecommendations({
          fpga: fpgaAnalysis.analysis,
          timing: timingAnalysis,
          power: powerAnalysis,
          thermal: thermalAnalysis,
          optimization: optimizationAnalysis,
          quality: qualityAnalysis
        }),
        alerts: generateAlerts({
          timing: timingAnalysis,
          power: powerAnalysis,
          thermal: thermalAnalysis,
          config: analysisConfig
        })
      };

      // Update state
      setAnalysisResults(analysisResult);
      setAlerts(analysisResult.alerts);
      
      // Add to history
      setAnalysisHistory(prev => [analysisResult, ...prev.slice(0, 19)]); // Keep last 20

      setAnalysisProgress(0);
      return analysisResult;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisConfig]);

  // Compare multiple FPGA devices
  const compareDevices = useCallback(async (verilogCode, designIntent, devices) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const results = {};
      
      for (const device of devices) {
        const deviceConfig = { ...analysisConfig, target_device: device };
        
        // Run analysis for each device
        const deviceAnalysis = await analyzer.current.analyzeDesign(
          verilogCode,
          designIntent,
          device,
          deviceConfig
        );

        if (deviceAnalysis.success) {
          const timing = calculator.current.calculateTiming({
            device: device,
            component: designIntent.component,
            width: designIntent.parameters?.width || 8,
            frequency: analysisConfig.target_frequency
          });

          const power = calculator.current.calculatePower({
            device: device,
            frequency: analysisConfig.target_frequency,
            utilization: deviceAnalysis.analysis.resource_analysis
          });

          results[device] = {
            device: device,
            analysis: deviceAnalysis.analysis,
            timing: timing,
            power: power,
            score: calculateDeviceScore(deviceAnalysis.analysis, timing, power)
          };
        }
      }

      const comparison = {
        timestamp: new Date().toISOString(),
        devices: Object.keys(results),
        results: results,
        recommendations: generateDeviceRecommendations(results),
        best_for: {
          performance: findBestDevice(results, 'performance'),
          area: findBestDevice(results, 'area'), 
          power: findBestDevice(results, 'power'),
          cost: findBestDevice(results, 'cost')
        }
      };

      setComparisonResults(comparison);
      return comparison;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisConfig]);

  // Start real-time monitoring
  const startMonitoring = useCallback((verilogCode, designIntent, interval = 5000) => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    setMonitoringData([]);

    const monitoringInterval = setInterval(async () => {
      try {
        // Simulate varying conditions for monitoring
        const conditions = {
          ...analysisConfig.operating_conditions,
          temperature: analysisConfig.operating_conditions.temperature + (Math.random() - 0.5) * 10,
          voltage: analysisConfig.operating_conditions.voltage + (Math.random() - 0.5) * 0.1
        };

        const timing = calculator.current.calculateTiming({
          device: analysisConfig.target_device,
          component: designIntent.component,
          width: designIntent.parameters?.width || 8,
          frequency: analysisConfig.target_frequency,
          temperature: conditions.temperature,
          voltage: conditions.voltage
        });

        const power = calculator.current.calculatePower({
          device: analysisConfig.target_device,
          frequency: analysisConfig.target_frequency,
          temperature: conditions.temperature,
          voltage: conditions.voltage
        });

        const dataPoint = {
          timestamp: Date.now(),
          conditions: conditions,
          metrics: {
            frequency: timing.max_frequency,
            power: power.total_power,
            temperature: conditions.temperature,
            slack: timing.setup_slack
          }
        };

        setMonitoringData(prev => [...prev.slice(-29), dataPoint]); // Keep last 30 points

      } catch (err) {
        console.error('Monitoring error:', err);
      }
    }, interval);

    // Store interval ID for cleanup
    return () => {
      clearInterval(monitoringInterval);
      setIsMonitoring(false);
    };
  }, [analysisConfig, isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Update analysis configuration
  const updateAnalysisConfig = useCallback((updates) => {
    setAnalysisConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Get performance trends
  const getPerformanceTrends = useCallback(() => {
    if (analysisHistory.length < 2) return null;

    const latest = analysisHistory[0];
    const previous = analysisHistory[1];

    return {
      frequency_trend: latest.timing_analysis.max_frequency - previous.timing_analysis.max_frequency,
      power_trend: latest.power_analysis.total_power - previous.power_analysis.total_power,
      score_trend: latest.overall_score - previous.overall_score,
      recommendation: generateTrendRecommendation(latest, previous)
    };
  }, [analysisHistory]);

  // Predict performance for different conditions
  const predictPerformance = useCallback((conditions) => {
    if (!analysisResults) return null;

    return calculator.current.predictPerformance(
      {
        device: analysisConfig.target_device,
        component: analysisResults.design_info.intent.component,
        width: analysisResults.design_info.intent.parameters?.width || 8,
        ...conditions
      },
      {
        target_frequency: conditions.frequency || analysisConfig.target_frequency,
        instances: conditions.instances || 1
      }
    );
  }, [analysisResults, analysisConfig]);

  // Memoized computed values
  const analysisStatus = useMemo(() => {
    if (!analysisResults) return 'no_analysis';
    
    const alerts = analysisResults.alerts || [];
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
    const warningAlerts = alerts.filter(alert => alert.severity === 'warning').length;

    if (criticalAlerts > 0) return 'critical';
    if (warningAlerts > 0) return 'warning';
    if (analysisResults.overall_score >= 80) return 'excellent';
    if (analysisResults.overall_score >= 60) return 'good';
    return 'needs_improvement';
  }, [analysisResults]);

  const canAnalyze = useMemo(() => {
    return !isAnalyzing && analysisConfig.target_device;
  }, [isAnalyzing, analysisConfig.target_device]);

  // Load analysis from history
  const loadAnalysisFromHistory = useCallback((analysisId) => {
    const analysis = analysisHistory.find(a => a.id === analysisId);
    if (analysis) {
      setAnalysisResults(analysis);
      setAlerts(analysis.alerts);
      return analysis;
    }
    return null;
  }, [analysisHistory]);

  // Clear current analysis
  const clearAnalysis = useCallback(() => {
    setAnalysisResults(null);
    setAlerts([]);
    setError(null);
    setComparisonResults(null);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (analysisResults) {
      try {
        localStorage.setItem('chipchat_analysis_results', JSON.stringify({
          results: analysisResults,
          config: analysisConfig,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.warn('Failed to save analysis results:', err);
      }
    }
  }, [analysisResults, analysisConfig]);

  return {
    // State
    isAnalyzing,
    analysisResults,
    analysisHistory,
    error,
    analysisProgress,
    analysisConfig,
    isMonitoring,
    monitoringData,
    alerts,
    comparisonResults,
    benchmarkData,

    // Actions
    runAnalysis,
    compareDevices,
    startMonitoring,
    stopMonitoring,
    updateAnalysisConfig,
    loadAnalysisFromHistory,
    clearAnalysis,
    predictPerformance,

    // Computed values
    analysisStatus,
    canAnalyze,
    hasAnalysis: !!analysisResults,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    warningAlerts: alerts.filter(a => a.severity === 'warning').length,
    
    // Utilities
    getPerformanceTrends
  };
};

// Helper functions
function calculateOverallScore(analyses) {
  const weights = {
    timing: 0.3,
    power: 0.25,
    thermal: 0.2,
    quality: 0.15,
    optimization: 0.1
  };

  let score = 0;
  let totalWeight = 0;

  // Timing score (based on frequency achievement)
  if (analyses.timing) {
    const timingScore = Math.min(100, (analyses.timing.max_frequency / 500) * 100);
    score += timingScore * weights.timing;
    totalWeight += weights.timing;
  }

  // Power score (inverse of power consumption)
  if (analyses.power) {
    const powerScore = Math.max(0, 100 - (analyses.power.total_power / 10));
    score += powerScore * weights.power;
    totalWeight += weights.power;
  }

  // Thermal score
  if (analyses.thermal) {
    const thermalScore = analyses.thermal.thermal_margin > 10 ? 100 : 
                        analyses.thermal.thermal_margin > 0 ? 70 : 30;
    score += thermalScore * weights.thermal;
    totalWeight += weights.thermal;
  }

  // Quality score
  if (analyses.quality && analyses.quality.summary) {
    const qualityScore = Math.max(0, 100 - analyses.quality.summary.errors * 10 - 
                                             analyses.quality.summary.warnings * 5);
    score += qualityScore * weights.quality;
    totalWeight += weights.quality;
  }

  // Optimization score
  if (analyses.optimization) {
    const optimizationScore = analyses.optimization.optimizations?.length > 0 ? 
                             Math.min(100, analyses.optimization.optimizations[0].score * 100) : 50;
    score += optimizationScore * weights.optimization;
    totalWeight += weights.optimization;
  }

  return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
}

function generateRecommendations(analyses) {
  const recommendations = [];

  // Timing recommendations
  if (analyses.timing && analyses.timing.max_frequency < 200) {
    recommendations.push({
      category: 'timing',
      priority: 'high',
      title: 'Improve Timing Performance',
      description: 'Consider pipelining or architectural optimizations to increase maximum frequency',
      actions: ['Add pipeline stages', 'Optimize critical path', 'Use faster architecture']
    });
  }

  // Power recommendations
  if (analyses.power && analyses.power.total_power > 1000) {
    recommendations.push({
      category: 'power',
      priority: 'medium',
      title: 'Reduce Power Consumption',
      description: 'Implement power optimization techniques to reduce overall consumption',
      actions: ['Clock gating', 'Voltage scaling', 'Power islands']
    });
  }

  // Thermal recommendations
  if (analyses.thermal && analyses.thermal.thermal_margin < 10) {
    recommendations.push({
      category: 'thermal',
      priority: analyses.thermal.thermal_margin < 0 ? 'critical' : 'high',
      title: 'Thermal Management Required',
      description: 'Improve cooling or reduce power to maintain safe operating temperature',
      actions: ['Enhance cooling', 'Reduce frequency', 'Lower voltage']
    });
  }

  // Quality recommendations
  if (analyses.quality && analyses.quality.summary && analyses.quality.summary.errors > 0) {
    recommendations.push({
      category: 'quality',
      priority: 'high',
      title: 'Fix Code Quality Issues',
      description: 'Address syntax errors and warnings to improve design reliability',
      actions: ['Fix syntax errors', 'Address warnings', 'Improve coding style']
    });
  }

  // Optimization recommendations
  if (analyses.optimization && analyses.optimization.optimizations) {
    const topOptimization = analyses.optimization.optimizations[0];
    if (topOptimization && topOptimization.score > 1.2) {
      recommendations.push({
        category: 'optimization',
        priority: 'medium',
        title: `Consider ${topOptimization.description}`,
        description: `This optimization could improve your design significantly`,
        actions: [topOptimization.description]
      });
    }
  }

  return recommendations;
}

function generateAlerts(analyses) {
  const alerts = [];

  // Critical timing alerts
  if (analyses.timing && analyses.timing.setup_slack < 0) {
    alerts.push({
      severity: 'critical',
      category: 'timing',
      message: 'Negative setup slack detected - timing violation',
      value: analyses.timing.setup_slack,
      threshold: 0,
      timestamp: Date.now()
    });
  }

  // Power alerts
  if (analyses.power && analyses.power.total_power > analyses.config?.power_budget) {
    alerts.push({
      severity: 'warning',
      category: 'power',
      message: 'Power consumption exceeds budget',
      value: analyses.power.total_power,
      threshold: analyses.config.power_budget,
      timestamp: Date.now()
    });
  }

  // Thermal alerts
  if (analyses.thermal) {
    if (analyses.thermal.thermal_margin < 0) {
      alerts.push({
        severity: 'critical',
        category: 'thermal',
        message: 'Junction temperature exceeds maximum rating',
        value: analyses.thermal.junction_temperature,
        threshold: 85,
        timestamp: Date.now()
      });
    } else if (analyses.thermal.thermal_margin < 10) {
      alerts.push({
        severity: 'warning',
        category: 'thermal',
        message: 'Low thermal margin - consider cooling improvements',
        value: analyses.thermal.thermal_margin,
        threshold: 10,
        timestamp: Date.now()
      });
    }
  }

  return alerts;
}

function calculateDeviceScore(analysis, timing, power) {
  const resourceUtilization = analysis.resource_analysis?.overall_utilization || 50;
  const frequencyScore = Math.min(100, (timing.max_frequency / 500) * 100);
  const powerScore = Math.max(0, 100 - (power.total_power / 10));
  const areaScore = Math.max(0, 100 - resourceUtilization);

  return (frequencyScore * 0.4 + powerScore * 0.3 + areaScore * 0.3);
}

function findBestDevice(results, criteria) {
  const devices = Object.keys(results);
  if (devices.length === 0) return null;

  let bestDevice = devices[0];
  let bestValue = getDeviceValue(results[bestDevice], criteria);

  for (const device of devices.slice(1)) {
    const value = getDeviceValue(results[device], criteria);
    if ((criteria === 'power' && value < bestValue) || 
        (criteria !== 'power' && value > bestValue)) {
      bestDevice = device;
      bestValue = value;
    }
  }

  return { device: bestDevice, value: bestValue };
}

function getDeviceValue(result, criteria) {
  switch (criteria) {
    case 'performance':
      return result.timing?.max_frequency || 0;
    case 'power':
      return result.power?.total_power || Infinity;
    case 'area':
      return 100 - (result.analysis?.resource_analysis?.overall_utilization || 100);
    case 'cost':
      return result.score || 0; // Higher score = better value
    default:
      return result.score || 0;
  }
}

function generateDeviceRecommendations(results) {
  const recommendations = [];
  const devices = Object.keys(results);

  if (devices.length < 2) return recommendations;

  // Find best performers
  const bestPerf = findBestDevice(results, 'performance');
  const bestPower = findBestDevice(results, 'power');
  const bestArea = findBestDevice(results, 'area');

  recommendations.push({
    category: 'performance',
    message: `${bestPerf.device} offers the best performance at ${bestPerf.value.toFixed(1)} MHz`
  });

  recommendations.push({
    category: 'power',
    message: `${bestPower.device} has the lowest power consumption at ${bestPower.value.toFixed(1)} mW`
  });

  recommendations.push({
    category: 'area',
    message: `${bestArea.device} provides the most efficient resource utilization`
  });

  return recommendations;
}

function generateTrendRecommendation(latest, previous) {
  const freqImprovement = latest.timing_analysis.max_frequency > previous.timing_analysis.max_frequency;
  const powerImprovement = latest.power_analysis.total_power < previous.power_analysis.total_power;
  const scoreImprovement = latest.overall_score > previous.overall_score;

  const improvements = [freqImprovement, powerImprovement, scoreImprovement].filter(Boolean).length;

  if (improvements >= 2) {
    return { trend: 'improving', confidence: 'high', message: 'Design is showing good improvement trends' };
  } else if (improvements === 1) {
    return { trend: 'mixed', confidence: 'medium', message: 'Some improvements seen, continue optimization' };
  } else {
    return { trend: 'declining', confidence: 'medium', message: 'Design metrics are declining, review changes' };
  }
}

export default useFPGAAnalysis;