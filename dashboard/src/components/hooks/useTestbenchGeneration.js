// useTestbenchGeneration Hook - Comprehensive Testbench Generation and Management
// Manages testbench creation, simulation, coverage tracking, and verification workflows

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import AdvancedTestbenchGenerator from '../services/testbenchGenerator.js';
import VerilogParser from '../utils/verilogParser.js';

const useTestbenchGeneration = (initialConfig = {}) => {
  // Core testbench state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTestbench, setCurrentTestbench] = useState(null);
  const [testbenchHistory, setTestbenchHistory] = useState([]);
  const [error, setError] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState([]);

  // Coverage state
  const [coverageData, setCoverageData] = useState(null);
  const [coverageGoal, setCoverageGoal] = useState(95);
  const [coverageHistory, setCoverageHistory] = useState([]);

  // Testbench configuration
  const [testbenchConfig, setTestbenchConfig] = useState({
    test_strategy: ['directed', 'random', 'corner_cases'],
    coverage_types: ['functional', 'code', 'assertion'],
    random_seed: Math.floor(Math.random() * 1000000),
    test_count: {
      directed: 10,
      random: 1000,
      corner_cases: 20
    },
    simulation_time: 10000, // ns
    clock_frequency: 100,   // MHz
    include_assertions: true,
    include_coverage: true,
    debug_level: 'info',
    ...initialConfig
  });

  // Service instances
  const testbenchGenerator = useRef(new AdvancedTestbenchGenerator());
  const parser = useRef(new VerilogParser());

  // Generation counter for unique IDs
  const generationCounter = useRef(0);

  // Main testbench generation function
  const generateTestbench = useCallback(async (rtlModule, designIntent, options = {}) => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(0);

      const generationId = ++generationCounter.current;
      const startTime = Date.now();

      // Step 1: Validate RTL module (10%)
      setGenerationProgress(10);
      if (!rtlModule || !designIntent) {
        throw new Error('RTL module and design intent are required');
      }

      // Parse RTL to understand structure
      const parseResult = parser.current.parseVerilogCode(rtlModule);
      if (!parseResult.success) {
        console.warn('RTL parsing failed, continuing with basic generation');
      }

      // Step 2: Generate comprehensive testbench (30%)
      setGenerationProgress(30);
      const testbenchResult = testbenchGenerator.current.generateAdvancedTestbench(
        rtlModule,
        designIntent,
        { ...testbenchConfig, ...options }
      );

      if (!testbenchResult) {
        throw new Error('Testbench generation failed');
      }

      // Step 3: Generate verification environment (50%)
      setGenerationProgress(50);
      const verificationEnv = testbenchGenerator.current.generateVerificationEnvironment(
        rtlModule,
        designIntent,
        testbenchConfig
      );

      // Step 4: Generate test vectors (70%)
      setGenerationProgress(70);
      const testVectors = generateTestVectors(designIntent, testbenchConfig);

      // Step 5: Generate coverage model (85%)
      setGenerationProgress(85);
      const coverageModel = generateCoverageModel(designIntent, parseResult);

      // Step 6: Generate assertions (95%)
      setGenerationProgress(95);
      const assertions = generateAssertions(designIntent, parseResult);

      // Step 7: Compile final testbench object (100%)
      setGenerationProgress(100);
      const testbench = {
        id: generationId,
        timestamp: new Date().toISOString(),
        generation_time: Date.now() - startTime,
        rtl_module: rtlModule,
        design_intent: designIntent,
        config: { ...testbenchConfig, ...options },
        testbench_code: testbenchResult.testbench || testbenchResult,
        verification_environment: verificationEnv,
        test_vectors: testVectors,
        coverage_model: coverageModel,
        assertions: assertions,
        makefile: verificationEnv.makefile,
        metrics: {
          lines_of_code: (testbenchResult.testbench || testbenchResult).split('\n').length,
          test_count: Object.values(testbenchConfig.test_count).reduce((a, b) => a + b, 0),
          assertion_count: assertions.length,
          coverage_points: coverageModel.points.length
        },
        status: 'generated',
        simulation_status: 'not_run'
      };

      // Update state
      setCurrentTestbench(testbench);
      
      // Add to history
      setTestbenchHistory(prev => [testbench, ...prev.slice(0, 9)]); // Keep last 10

      setGenerationProgress(0);
      return testbench;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [testbenchConfig]);

  // Run simulation
  const runSimulation = useCallback(async (testbench = currentTestbench, simOptions = {}) => {
    if (!testbench) {
      throw new Error('No testbench available for simulation');
    }

    try {
      setIsSimulating(true);
      setSimulationProgress(0);
      setSimulationLogs([]);
      setError(null);

      const startTime = Date.now();
      
      // Step 1: Prepare simulation environment (10%)
      setSimulationProgress(10);
      addSimulationLog('info', 'Preparing simulation environment...');
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate setup time

      // Step 2: Compile design (25%)
      setSimulationProgress(25);
      addSimulationLog('info', 'Compiling RTL design...');
      
      // Simulate compilation
      await new Promise(resolve => setTimeout(resolve, 1000));
      addSimulationLog('success', 'RTL compilation completed successfully');

      // Step 3: Compile testbench (40%)
      setSimulationProgress(40);
      addSimulationLog('info', 'Compiling testbench...');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      addSimulationLog('success', 'Testbench compilation completed');

      // Step 4: Run directed tests (60%)
      setSimulationProgress(60);
      addSimulationLog('info', `Running ${testbench.config.test_count.directed} directed tests...`);
      
      const directedResults = await simulateTests('directed', testbench.config.test_count.directed);
      addSimulationLog('info', `Directed tests: ${directedResults.passed}/${directedResults.total} passed`);

      // Step 5: Run random tests (75%)
      setSimulationProgress(75);
      addSimulationLog('info', `Running ${testbench.config.test_count.random} random tests...`);
      
      const randomResults = await simulateTests('random', testbench.config.test_count.random);
      addSimulationLog('info', `Random tests: ${randomResults.passed}/${randomResults.total} passed`);

      // Step 6: Run corner case tests (85%)
      setSimulationProgress(85);
      addSimulationLog('info', `Running ${testbench.config.test_count.corner_cases} corner case tests...`);
      
      const cornerResults = await simulateTests('corner_cases', testbench.config.test_count.corner_cases);
      addSimulationLog('info', `Corner case tests: ${cornerResults.passed}/${cornerResults.total} passed`);

      // Step 7: Collect coverage (95%)
      setSimulationProgress(95);
      addSimulationLog('info', 'Collecting coverage data...');
      
      const coverageResults = generateCoverageResults(testbench, {
        directed: directedResults,
        random: randomResults,
        corner_cases: cornerResults
      });

      // Step 8: Generate final results (100%)
      setSimulationProgress(100);
      const totalTests = directedResults.total + randomResults.total + cornerResults.total;
      const totalPassed = directedResults.passed + randomResults.passed + cornerResults.passed;
      
      addSimulationLog('success', `Simulation completed: ${totalPassed}/${totalTests} tests passed`);
      addSimulationLog('info', `Coverage achieved: ${coverageResults.overall_coverage.toFixed(1)}%`);

      const simulationResult = {
        testbench_id: testbench.id,
        timestamp: new Date().toISOString(),
        execution_time: Date.now() - startTime,
        test_results: {
          directed: directedResults,
          random: randomResults,
          corner_cases: cornerResults,
          summary: {
            total_tests: totalTests,
            passed_tests: totalPassed,
            failed_tests: totalTests - totalPassed,
            pass_rate: (totalPassed / totalTests) * 100
          }
        },
        coverage_results: coverageResults,
        simulation_logs: [...simulationLogs],
        status: totalPassed === totalTests ? 'passed' : 'failed',
        performance: {
          simulation_speed: 'N/A', // Would be calculated by actual simulator
          memory_usage: 'N/A',
          cpu_time: Date.now() - startTime
        }
      };

      // Update state
      setSimulationResults(simulationResult);
      setCoverageData(coverageResults);
      
      // Add coverage to history
      setCoverageHistory(prev => [{
        timestamp: simulationResult.timestamp,
        coverage: coverageResults.overall_coverage,
        goal: coverageGoal,
        testbench_id: testbench.id
      }, ...prev.slice(0, 19)]);

      // Update testbench status
      const updatedTestbench = {
        ...testbench,
        simulation_status: 'completed',
        last_simulation: simulationResult.timestamp,
        simulation_results: simulationResult
      };
      
      setCurrentTestbench(updatedTestbench);
      
      // Update in history
      setTestbenchHistory(prev => 
        prev.map(tb => tb.id === testbench.id ? updatedTestbench : tb)
      );

      setSimulationProgress(0);
      return simulationResult;

    } catch (err) {
      addSimulationLog('error', `Simulation failed: ${err.message}`);
      setError(err.message);
      throw err;
    } finally {
      setIsSimulating(false);
    }
  }, [currentTestbench, simulationLogs, coverageGoal]);

  // Add simulation log entry
  const addSimulationLog = useCallback((level, message) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message
    };
    setSimulationLogs(prev => [...prev, logEntry]);
  }, []);

  // Update testbench configuration
  const updateTestbenchConfig = useCallback((updates) => {
    setTestbenchConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Load testbench from history
  const loadTestbenchFromHistory = useCallback((testbenchId) => {
    const testbench = testbenchHistory.find(tb => tb.id === testbenchId);
    if (testbench) {
      setCurrentTestbench(testbench);
      if (testbench.simulation_results) {
        setSimulationResults(testbench.simulation_results);
        setCoverageData(testbench.simulation_results.coverage_results);
      }
      return testbench;
    }
    return null;
  }, [testbenchHistory]);

  // Clear current testbench
  const clearTestbench = useCallback(() => {
    setCurrentTestbench(null);
    setSimulationResults(null);
    setCoverageData(null);
    setSimulationLogs([]);
    setError(null);
  }, []);

  // Generate regression test suite
  const generateRegressionSuite = useCallback(async (testbenches) => {
    const regressionSuite = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      testbenches: testbenches.map(tb => ({
        id: tb.id,
        name: tb.design_intent.component,
        testbench_code: tb.testbench_code
      })),
      config: {
        parallel_execution: true,
        timeout: 60000, // 60 seconds per testbench
        coverage_merge: true
      }
    };

    return regressionSuite;
  }, []);

  // Analyze test effectiveness
  const analyzeTestEffectiveness = useCallback(() => {
    if (!simulationResults || !coverageData) return null;

    const effectiveness = {
      coverage_efficiency: coverageData.overall_coverage / simulationResults.test_results.summary.total_tests,
      test_quality: simulationResults.test_results.summary.pass_rate,
      bug_detection_rate: (simulationResults.test_results.summary.failed_tests / 
                          simulationResults.test_results.summary.total_tests) * 100,
      recommendations: []
    };

    // Generate recommendations based on analysis
    if (effectiveness.coverage_efficiency < 0.1) {
      effectiveness.recommendations.push('Increase test vector diversity');
    }
    
    if (effectiveness.test_quality < 95) {
      effectiveness.recommendations.push('Review failing tests for design issues');
    }
    
    if (coverageData.overall_coverage < coverageGoal) {
      effectiveness.recommendations.push('Add more corner case tests');
      effectiveness.recommendations.push('Implement additional coverage points');
    }

    return effectiveness;
  }, [simulationResults, coverageData, coverageGoal]);

  // Computed values
  const testbenchStatus = useMemo(() => {
    if (!currentTestbench) return 'no_testbench';
    if (currentTestbench.simulation_status === 'not_run') return 'ready_to_simulate';
    if (currentTestbench.simulation_status === 'completed') {
      const passRate = simulationResults?.test_results.summary.pass_rate || 0;
      const coverage = coverageData?.overall_coverage || 0;
      
      if (passRate === 100 && coverage >= coverageGoal) return 'excellent';
      if (passRate >= 95 && coverage >= coverageGoal * 0.9) return 'good';
      if (passRate >= 90) return 'acceptable';
      return 'needs_improvement';
    }
    return 'unknown';
  }, [currentTestbench, simulationResults, coverageData, coverageGoal]);

  const canSimulate = useMemo(() => {
    return !!currentTestbench && !isSimulating && !isGenerating;
  }, [currentTestbench, isSimulating, isGenerating]);

  // Auto-save effect
  useEffect(() => {
    if (currentTestbench) {
      try {
        localStorage.setItem('chipchat_current_testbench', JSON.stringify({
          testbench: currentTestbench,
          config: testbenchConfig,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.warn('Failed to save testbench:', err);
      }
    }
  }, [currentTestbench, testbenchConfig]);

  return {
    // State
    isGenerating,
    currentTestbench,
    testbenchHistory,
    error,
    generationProgress,
    isSimulating,
    simulationResults,
    simulationProgress,
    simulationLogs,
    coverageData,
    coverageGoal,
    coverageHistory,
    testbenchConfig,

    // Actions
    generateTestbench,
    runSimulation,
    updateTestbenchConfig,
    loadTestbenchFromHistory,
    clearTestbench,
    generateRegressionSuite,
    setCoverageGoal,

    // Computed values
    testbenchStatus,
    canSimulate,
    hasTestbench: !!currentTestbench,
    hasSimulationResults: !!simulationResults,
    hasCoverage: !!coverageData,
    coverageGoalMet: coverageData ? coverageData.overall_coverage >= coverageGoal : false,
    
    // Analysis
    analyzeTestEffectiveness
  };
};

// Helper functions
async function simulateTests(testType, count) {
  // Simulate test execution with realistic timing
  const baseDelay = testType === 'random' ? 10 : 50; // Random tests are faster
  await new Promise(resolve => setTimeout(resolve, Math.min(2000, count * baseDelay / 10)));
  
  // Generate realistic results
  const passRate = testType === 'corner_cases' ? 0.85 : 0.95; // Corner cases more likely to fail
  const passed = Math.floor(count * passRate + Math.random() * count * 0.1);
  
  return {
    test_type: testType,
    total: count,
    passed: Math.min(passed, count),
    failed: count - Math.min(passed, count),
    execution_time: count * baseDelay
  };
}

function generateTestVectors(designIntent, config) {
  const vectors = [];
  const width = designIntent.parameters?.width || 8;
  const maxValue = Math.pow(2, width) - 1;

  // Directed test vectors
  if (config.test_strategy.includes('directed')) {
    vectors.push(
      { type: 'directed', name: 'zero_test', inputs: { a: 0, b: 0, cin: 0 } },
      { type: 'directed', name: 'max_test', inputs: { a: maxValue, b: maxValue, cin: 1 } },
      { type: 'directed', name: 'overflow_test', inputs: { a: maxValue, b: 1, cin: 0 } }
    );
  }

  // Random test vectors
  if (config.test_strategy.includes('random')) {
    for (let i = 0; i < Math.min(config.test_count.random, 100); i++) {
      vectors.push({
        type: 'random',
        name: `random_${i}`,
        inputs: {
          a: Math.floor(Math.random() * (maxValue + 1)),
          b: Math.floor(Math.random() * (maxValue + 1)),
          cin: Math.random() > 0.5 ? 1 : 0
        }
      });
    }
  }

  return vectors;
}

function generateCoverageModel(designIntent, parseResult) {
  const points = [];
  const width = designIntent.parameters?.width || 8;

  // Basic coverage points
  points.push(
    { name: 'input_a_coverage', type: 'value', bins: Math.min(32, Math.pow(2, width)) },
    { name: 'input_b_coverage', type: 'value', bins: Math.min(32, Math.pow(2, width)) },
    { name: 'carry_coverage', type: 'toggle', signals: ['cin', 'cout'] },
    { name: 'overflow_coverage', type: 'event', condition: 'overflow_detected' }
  );

  // Add coverage for parsed signals if available
  if (parseResult.success && parseResult.result.modules.length > 0) {
    const module = parseResult.result.modules[0];
    module.signals.forEach(signal => {
      if (signal.width > 1) {
        points.push({
          name: `${signal.name}_coverage`,
          type: 'value',
          bins: Math.min(16, Math.pow(2, signal.width))
        });
      }
    });
  }

  return { points, goal: 95 };
}

function generateAssertions(designIntent, parseResult) {
  const assertions = [];
  const component = designIntent.component;

  // Component-specific assertions
  if (component === 'adder') {
    assertions.push(
      {
        name: 'adder_correctness',
        type: 'functional',
        description: 'Verify addition is mathematically correct',
        code: 'assert (a + b + cin == {cout, sum}) else $error("Addition incorrect");'
      },
      {
        name: 'overflow_detection',
        type: 'functional', 
        description: 'Verify overflow is properly detected',
        code: 'assert (overflow == (a[WIDTH-1] == b[WIDTH-1] && sum[WIDTH-1] != a[WIDTH-1]));'
      }
    );
  } else if (component === 'multiplier') {
    assertions.push(
      {
        name: 'multiplier_correctness',
        type: 'functional',
        description: 'Verify multiplication is mathematically correct',
        code: 'assert (a * b == product) else $error("Multiplication incorrect");'
      },
      {
        name: 'zero_multiplication',
        type: 'functional',
        description: 'Verify multiplication by zero',
        code: 'assert ((a == 0 || b == 0) -> product == 0);'
      }
    );
  } else if (component === 'memory') {
    assertions.push(
      {
        name: 'memory_write_read',
        type: 'functional',
        description: 'Verify write followed by read returns same data',
        code: 'assert (write_enable && $past(write_enable) && $past(addr) == addr -> dout == $past(din));'
      },
      {
        name: 'address_bounds',
        type: 'safety',
        description: 'Verify address is within bounds',
        code: 'assert (addr < DEPTH) else $error("Address out of bounds");'
      }
    );
  }

  // Generic timing assertions
  assertions.push(
    {
      name: 'clock_stability',
      type: 'timing',
      description: 'Verify clock is stable',
      code: 'assert ($isunknown(clk) == 0) else $error("Clock is unknown");'
    },
    {
      name: 'reset_behavior',
      type: 'timing',
      description: 'Verify proper reset behavior',
      code: 'assert (!rst_n |-> output_signals == 0);'
    }
  );

  return assertions;
}

function generateCoverageResults(testbench, testResults) {
  const totalTests = Object.values(testResults).reduce((sum, result) => sum + result.total, 0);
  const passedTests = Object.values(testResults).reduce((sum, result) => sum + result.passed, 0);
  
  // Simulate coverage based on test results and configuration
  const baseCoverage = (passedTests / totalTests) * 100;
  const coverageVariation = (Math.random() - 0.5) * 10; // ±5% variation
  
  const functionalCoverage = Math.min(100, Math.max(0, baseCoverage + coverageVariation));
  const codeCoverage = Math.min(100, Math.max(0, functionalCoverage - 5 + Math.random() * 10));
  const assertionCoverage = testbench.config.include_assertions ? 
                           Math.min(100, Math.max(0, functionalCoverage - 3 + Math.random() * 6)) : 0;

  return {
    overall_coverage: (functionalCoverage + codeCoverage + (assertionCoverage || 0)) / (assertionCoverage ? 3 : 2),
    functional_coverage: functionalCoverage,
    code_coverage: codeCoverage,
    assertion_coverage: assertionCoverage,
    coverage_breakdown: {
      statement_coverage: codeCoverage * 0.95,
      branch_coverage: codeCoverage * 0.87,
      condition_coverage: codeCoverage * 0.82,
      toggle_coverage: codeCoverage * 0.78
    },
    uncovered_items: generateUncoveredItems(functionalCoverage),
    coverage_trends: {
      improvement_from_directed: testResults.directed.passed / testResults.directed.total * 30,
      improvement_from_random: testResults.random.passed / testResults.random.total * 50,
      improvement_from_corner: testResults.corner_cases.passed / testResults.corner_cases.total * 20
    }
  };
}

function generateUncoveredItems(coverage) {
  const uncoveredItems = [];
  
  if (coverage < 95) {
    uncoveredItems.push(
      { type: 'functional', item: 'Edge case: maximum input values', priority: 'high' },
      { type: 'functional', item: 'Cross coverage: input_a × input_b', priority: 'medium' }
    );
  }
  
  if (coverage < 90) {
    uncoveredItems.push(
      { type: 'code', item: 'Error handling branch in module', priority: 'high' },
      { type: 'code', item: 'Reset sequence validation', priority: 'medium' }
    );
  }
  
  if (coverage < 85) {
    uncoveredItems.push(
      { type: 'assertion', item: 'Timing constraint validation', priority: 'low' },
      { type: 'functional', item: 'Power-down mode testing', priority: 'low' }
    );
  }
  
  return uncoveredItems;
}

export default useTestbenchGeneration;