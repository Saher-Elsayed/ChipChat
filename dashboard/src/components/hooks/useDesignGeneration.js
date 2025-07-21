// useDesignGeneration Hook - Comprehensive Design Generation State Management
// Manages RTL generation, optimization, and design iteration workflows

import { useState, useCallback, useRef, useEffect } from 'react';
import FPGANLPService from '../services/nlpService.js';
import VerilogLinter from '../services/verilogLinter.js';
import VerilogParser from '../utils/verilogParser.js';
import FPGACalculations from '../utils/fpgaCalculations.js';

const useDesignGeneration = (initialConfig = {}) => {
  // Core state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Design configuration state
  const [designConfig, setDesignConfig] = useState({
    component: 'adder',
    architecture: 'auto',
    parameters: { width: 8, depth: 256 },
    constraints: { frequency: 100, power_budget: 1000 },
    target_device: 'Artix-7',
    optimization_goals: ['performance'],
    ...initialConfig
  });

  // Analysis state
  const [analysisResults, setAnalysisResults] = useState(null);
  const [lintingResults, setLintingResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Service instances (using refs to persist across renders)
  const nlpService = useRef(new FPGANLPService());
  const linter = useRef(new VerilogLinter());
  const parser = useRef(new VerilogParser());
  const calculator = useRef(new FPGACalculations());

  // Generation counter for unique IDs
  const generationCounter = useRef(0);

  // Main design generation function
  const generateDesign = useCallback(async (userInput, options = {}) => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(0);

      const generationId = ++generationCounter.current;
      
      // Step 1: Parse natural language input (20%)
      setProgress(20);
      const nlpResult = await nlpService.current.processNaturalLanguage(userInput);
      
      if (!nlpResult.success) {
        throw new Error(nlpResult.error || 'Failed to process natural language input');
      }

      // Step 2: Generate RTL code (40%)
      setProgress(40);
      const rtlCode = nlpResult.rtl;
      const testbench = nlpResult.testbench;

      // Step 3: Parse and analyze generated RTL (60%)
      setProgress(60);
      const parseResult = parser.current.parseVerilogCode(rtlCode);
      
      if (!parseResult.success) {
        console.warn('RTL parsing failed:', parseResult.error);
      }

      // Step 4: Run linting analysis (70%)
      setProgress(70);
      const lintResult = linter.current.lintVerilogCode(rtlCode);

      // Step 5: Calculate FPGA metrics (80%)
      setProgress(80);
      const timingResult = calculator.current.calculateTiming({
        device: designConfig.target_device,
        component: nlpResult.intent.component,
        architecture: nlpResult.intent.architecture || designConfig.architecture,
        width: nlpResult.intent.parameters.width || designConfig.parameters.width,
        frequency: designConfig.constraints.frequency
      });

      const resourceResult = calculator.current.calculateResources({
        device: designConfig.target_device,
        component: nlpResult.intent.component,
        architecture: nlpResult.intent.architecture || designConfig.architecture,
        width: nlpResult.intent.parameters.width || designConfig.parameters.width
      });

      const powerResult = calculator.current.calculatePower({
        device: designConfig.target_device,
        frequency: designConfig.constraints.frequency,
        utilization: resourceResult
      });

      // Step 6: Generate optimization suggestions (90%)
      setProgress(90);
      const optimizationResult = calculator.current.analyzeOptimizations({
        device: designConfig.target_device,
        component: nlpResult.intent.component,
        architecture: nlpResult.intent.architecture || designConfig.architecture,
        width: nlpResult.intent.parameters.width || designConfig.parameters.width
      });

      // Step 7: Compile final design object (100%)
      setProgress(100);
      const design = {
        id: generationId,
        timestamp: new Date().toISOString(),
        user_input: userInput,
        intent: nlpResult.intent,
        rtl_code: rtlCode,
        testbench: testbench,
        parsing: parseResult,
        linting: lintResult,
        analysis: {
          timing: timingResult,
          resources: resourceResult,
          power: powerResult,
          optimization: optimizationResult
        },
        metrics: {
          quality_score: calculateQualityScore(lintResult, timingResult, resourceResult),
          complexity: parseResult.success ? parseResult.result.metrics.complexity_score : 0,
          maintainability: parseResult.success ? parseResult.result.metrics.comment_ratio : 0
        },
        config: { ...designConfig }
      };

      // Update state
      setCurrentDesign(design);
      setAnalysisResults(design.analysis);
      setLintingResults(lintResult);
      setSuggestions(optimizationResult.recommendations || []);

      // Add to history
      setGenerationHistory(prev => [design, ...prev.slice(0, 9)]); // Keep last 10

      setProgress(0);
      return design;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [designConfig]);

  // Regenerate design with modifications
  const regenerateDesign = useCallback(async (modifications = {}) => {
    if (!currentDesign) {
      throw new Error('No current design to regenerate');
    }

    const newConfig = { ...designConfig, ...modifications };
    setDesignConfig(newConfig);

    return generateDesign(currentDesign.user_input, { 
      forceRegenerate: true,
      modifications 
    });
  }, [currentDesign, designConfig, generateDesign]);

  // Optimize current design
  const optimizeDesign = useCallback(async (optimizationGoals = ['performance']) => {
    if (!currentDesign) {
      throw new Error('No current design to optimize');
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Find best optimization from analysis
      const optimizations = currentDesign.analysis.optimization.optimizations || [];
      const targetOptimization = optimizations.find(opt => 
        optimizationGoals.includes(opt.type) || 
        opt.type === 'architecture_change'
      );

      if (!targetOptimization) {
        throw new Error('No suitable optimization found');
      }

      // Apply optimization
      const modifications = {
        architecture: targetOptimization.changes.architecture,
        optimization_goals: optimizationGoals
      };

      return await regenerateDesign(modifications);

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [currentDesign, regenerateDesign]);

  // Compare designs
  const compareDesigns = useCallback((design1, design2) => {
    if (!design1 || !design2) {
      return null;
    }

    return {
      timing: {
        frequency_diff: design2.analysis.timing.max_frequency - design1.analysis.timing.max_frequency,
        delay_diff: design2.analysis.timing.total_delay - design1.analysis.timing.total_delay
      },
      resources: {
        lut_diff: design2.analysis.resources.luts - design1.analysis.resources.luts,
        ff_diff: design2.analysis.resources.ffs - design1.analysis.resources.ffs,
        power_diff: design2.analysis.power.total_power - design1.analysis.power.total_power
      },
      quality: {
        score_diff: design2.metrics.quality_score - design1.metrics.quality_score,
        complexity_diff: design2.metrics.complexity - design1.metrics.complexity
      },
      recommendation: generateComparisonRecommendation(design1, design2)
    };
  }, []);

  // Load design from history
  const loadDesignFromHistory = useCallback((designId) => {
    const design = generationHistory.find(d => d.id === designId);
    if (design) {
      setCurrentDesign(design);
      setAnalysisResults(design.analysis);
      setLintingResults(design.linting);
      setSuggestions(design.analysis.optimization.recommendations || []);
      setDesignConfig(design.config);
      return design;
    }
    return null;
  }, [generationHistory]);

  // Update design configuration
  const updateConfig = useCallback((updates) => {
    setDesignConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear current design
  const clearDesign = useCallback(() => {
    setCurrentDesign(null);
    setAnalysisResults(null);
    setLintingResults(null);
    setSuggestions([]);
    setError(null);
  }, []);

  // Get design suggestions based on current state
  const getDesignSuggestions = useCallback(() => {
    const suggestions = [];

    if (currentDesign) {
      const analysis = currentDesign.analysis;
      
      // Timing suggestions
      if (analysis.timing.max_frequency < designConfig.constraints.frequency) {
        suggestions.push({
          type: 'timing',
          priority: 'high',
          message: 'Consider pipelining or different architecture for higher frequency',
          action: () => optimizeDesign(['performance'])
        });
      }

      // Resource suggestions
      if (analysis.resources.luts > 1000) {
        suggestions.push({
          type: 'area',
          priority: 'medium',
          message: 'Design uses many LUTs, consider resource sharing',
          action: () => optimizeDesign(['area'])
        });
      }

      // Power suggestions
      if (analysis.power.total_power > designConfig.constraints.power_budget) {
        suggestions.push({
          type: 'power',
          priority: 'medium',
          message: 'Power consumption exceeds budget',
          action: () => optimizeDesign(['power'])
        });
      }

      // Quality suggestions
      if (currentDesign.metrics.quality_score < 80) {
        suggestions.push({
          type: 'quality',
          priority: 'low',
          message: 'Code quality could be improved',
          action: () => regenerateDesign({ focus_on_quality: true })
        });
      }
    }

    return suggestions;
  }, [currentDesign, designConfig, optimizeDesign, regenerateDesign]);

  // Auto-save effect
  useEffect(() => {
    if (currentDesign) {
      const saveData = {
        currentDesign,
        designConfig,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem('chipchat_current_design', JSON.stringify(saveData));
      } catch (err) {
        console.warn('Failed to save design to localStorage:', err);
      }
    }
  }, [currentDesign, designConfig]);

  // Load saved design on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chipchat_current_design');
      if (saved) {
        const saveData = JSON.parse(saved);
        // Only load if saved within last 24 hours
        if (Date.now() - saveData.timestamp < 24 * 60 * 60 * 1000) {
          setCurrentDesign(saveData.currentDesign);
          setDesignConfig(saveData.designConfig);
          if (saveData.currentDesign) {
            setAnalysisResults(saveData.currentDesign.analysis);
            setLintingResults(saveData.currentDesign.linting);
            setSuggestions(saveData.currentDesign.analysis.optimization.recommendations || []);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load saved design:', err);
    }
  }, []);

  return {
    // State
    isGenerating,
    currentDesign,
    generationHistory,
    error,
    progress,
    designConfig,
    analysisResults,
    lintingResults,
    suggestions: [...suggestions, ...getDesignSuggestions()],

    // Actions
    generateDesign,
    regenerateDesign,
    optimizeDesign,
    compareDesigns,
    loadDesignFromHistory,
    updateConfig,
    clearDesign,

    // Computed values
    hasDesign: !!currentDesign,
    canOptimize: !!currentDesign && !isGenerating,
    designScore: currentDesign?.metrics.quality_score || 0,
    
    // Utilities
    getDesignSuggestions
  };
};

// Helper functions
function calculateQualityScore(lintResult, timingResult, resourceResult) {
  let score = 100;
  
  // Deduct for linting issues
  if (lintResult) {
    score -= (lintResult.summary.errors * 10);
    score -= (lintResult.summary.warnings * 5);
    score -= (lintResult.summary.info * 1);
  }
  
  // Bonus for good timing
  if (timingResult && timingResult.setup_slack > 1.0) {
    score += 5;
  }
  
  // Deduct for high resource usage (assuming 1000 LUT baseline)
  if (resourceResult && resourceResult.luts > 1000) {
    score -= Math.min(20, (resourceResult.luts - 1000) / 100);
  }
  
  return Math.max(0, Math.min(100, score));
}

function generateComparisonRecommendation(design1, design2) {
  const comparison = {
    frequency_better: design2.analysis.timing.max_frequency > design1.analysis.timing.max_frequency,
    resource_better: design2.analysis.resources.luts < design1.analysis.resources.luts,
    power_better: design2.analysis.power.total_power < design1.analysis.power.total_power,
    quality_better: design2.metrics.quality_score > design1.metrics.quality_score
  };
  
  const improvements = Object.values(comparison).filter(Boolean).length;
  
  if (improvements >= 3) {
    return { recommendation: 'strong_prefer_design2', confidence: 'high' };
  } else if (improvements >= 2) {
    return { recommendation: 'prefer_design2', confidence: 'medium' };
  } else if (improvements === 1) {
    return { recommendation: 'mixed_results', confidence: 'low' };
  } else {
    return { recommendation: 'prefer_design1', confidence: 'medium' };
  }
}

export default useDesignGeneration;