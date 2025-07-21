// Verilog Synthesis Best Practices Linter
class VerilogSynthesisLinter {
  constructor() {
    this.rules = {
      // Clock domain crossing issues
      cdc_rules: {
        'async_reset_sync_deassert': {
          severity: 'warning',
          description: 'Use synchronous deassertion for reset signals'
        },
        'missing_synchronizer': {
          severity: 'error', 
          description: 'Signals crossing clock domains need synchronizers'
        }
      },
      
      // Combinational logic issues
      combinational_rules: {
        'inferred_latch': {
          severity: 'error',
          description: 'Incomplete case/if statements create latches'
        },
        'combinational_loop': {
          severity: 'error',
          description: 'Combinational feedback loops detected'
        }
      },
      
      // Coding style issues
      style_rules: {
        'blocking_in_sequential': {
          severity: 'warning',
          description: 'Use non-blocking assignments in sequential logic'
        },
        'nonblocking_in_combinational': {
          severity: 'warning', 
          description: 'Use blocking assignments in combinational logic'
        }
      },
      
      // Resource optimization
      resource_rules: {
        'wide_mux': {
          severity: 'info',
          description: 'Consider pipeline stages for wide multiplexers'
        },
        'dsp_inference': {
          severity: 'info',
          description: 'Structure code to infer DSP blocks'
        }
      }
    };
  }

  // Main linting function
  lintVerilogCode(verilogCode) {
    const issues = [];
    const lines = verilogCode.split('\n');
    
    // Run all linting checks
    issues.push(...this.checkClockDomainCrossing(lines));
    issues.push(...this.checkCombinationalLogic(lines));
    issues.push(...this.checkCodingStyle(lines));
    issues.push(...this.checkResourceOptimization(lines));
    issues.push(...this.checkSynthesisAttributes(lines));
    
    return {
      issues: issues,
      summary: this.generateSummary(issues),
      recommendations: this.generateRecommendations(issues)
    };
  }

  checkClockDomainCrossing(lines) {
    const issues = [];
    
    lines.forEach((line, index) => {
      // Check for async reset without sync deassertion
      if (line.match(/always\s*@\s*\(.*negedge\s+\w+.*\)/)) {
        const hasAsyncReset = line.includes('negedge');
        const hasSyncLogic = lines.slice(index, index + 10)
          .some(l => l.includes('posedge'));
          
        if (hasAsyncReset && !hasSyncLogic) {
          issues.push({
            line: index + 1,
            severity: 'warning',
            rule: 'async_reset_sync_deassert',
            message: 'Consider synchronous deassertion for reset',
            suggestion: 'Use: always @(posedge clk or negedge rst_n)'
          });
        }
      }
      
      // Check for potential CDC violations
      if (line.match(/assign.*=.*\w+_clk\w*/)) {
        issues.push({
          line: index + 1,
          severity: 'warning', 
          rule: 'potential_cdc',
          message: 'Potential clock domain crossing detected',
          suggestion: 'Use proper synchronizers for CDC signals'
        });
      }
    });
    
    return issues;
  }

  checkCombinationalLogic(lines) {
    const issues = [];
    let inAlwaysBlock = false;
    let hasElse = false;
    let hasDefault = false;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Track always blocks
      if (trimmed.match(/always\s*@\s*\(\*/)) {
        inAlwaysBlock = true;
        hasElse = false;
        hasDefault = false;
      }
      
      if (trimmed === 'end' && inAlwaysBlock) {
        // Check for incomplete if/case statements
        if (inAlwaysBlock && !hasElse && !hasDefault) {
          const blockLines = lines.slice(Math.max(0, index - 20), index);
          const hasIf = blockLines.some(l => l.includes('if'));
          const hasCase = blockLines.some(l => l.includes('case'));
          
          if (hasIf || hasCase) {
            issues.push({
              line: index + 1,
              severity: 'error',
              rule: 'inferred_latch',
              message: 'Incomplete if/case statement may infer latch',
              suggestion: 'Add else clause or default assignment'
            });
          }
        }
        inAlwaysBlock = false;
      }
      
      // Track else and default statements
      if (trimmed.includes('else')) hasElse = true;
      if (trimmed.includes('default')) hasDefault = true;
      
      // Check for combinational loops
      const assignMatch = trimmed.match(/assign\s+(\w+)\s*=/);
      if (assignMatch) {
        const lhs = assignMatch[1];
        if (line.includes(lhs) && line.indexOf(lhs) !== line.lastIndexOf(lhs)) {
          issues.push({
            line: index + 1,
            severity: 'error',
            rule: 'combinational_loop',
            message: `Potential combinational loop with signal ${lhs}`,
            suggestion: 'Break the feedback path or use registers'
          });
        }
      }
    });
    
    return issues;
  }

  checkCodingStyle(lines) {
    const issues = [];
    let inSequentialBlock = false;
    let inCombinationalBlock = false;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Detect sequential vs combinational blocks
      if (trimmed.match(/always\s*@\s*\(.*posedge|negedge/)) {
        inSequentialBlock = true;
        inCombinationalBlock = false;
      } else if (trimmed.match(/always\s*@\s*\(\*/)) {
        inCombinationalBlock = true;
        inSequentialBlock = false;
      }
      
      if (trimmed === 'end') {
        inSequentialBlock = false;
        inCombinationalBlock = false;
      }
      
      // Check assignment types
      if (trimmed.includes('=') && !trimmed.includes('assign')) {
        const hasBlocking = trimmed.includes(' = ');
        const hasNonBlocking = trimmed.includes(' <= ');
        
        if (inSequentialBlock && hasBlocking) {
          issues.push({
            line: index + 1,
            severity: 'warning',
            rule: 'blocking_in_sequential',
            message: 'Use non-blocking assignments (<=) in sequential logic',
            suggestion: 'Change = to <= for sequential assignments'
          });
        }
        
        if (inCombinationalBlock && hasNonBlocking) {
          issues.push({
            line: index + 1,
            severity: 'warning',
            rule: 'nonblocking_in_combinational', 
            message: 'Use blocking assignments (=) in combinational logic',
            suggestion: 'Change <= to = for combinational assignments'
          });
        }
      }
      
      // Check for missing sensitivity lists
      if (trimmed.match(/always\s*@\s*\(\s*\)/)) {
        issues.push({
          line: index + 1,
          severity: 'error',
          rule: 'empty_sensitivity',
          message: 'Empty sensitivity list',
          suggestion: 'Add appropriate signals to sensitivity list'
        });
      }
    });
    
    return issues;
  }

  checkResourceOptimization(lines) {
    const issues = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check for wide multiplexers
      const caseMatch = trimmed.match(/case\s*\(\s*(\w+)\s*\)/);
      if (caseMatch) {
        // Count case items in next few lines
        let caseCount = 0;
        for (let i = index + 1; i < Math.min(lines.length, index + 50); i++) {
          if (lines[i].includes('endcase')) break;
          if (lines[i].match(/^\s*\d+\s*:/)) caseCount++;
        }
        
        if (caseCount > 8) {
          issues.push({
            line: index + 1,
            severity: 'info',
            rule: 'wide_mux',
            message: `Large multiplexer (${caseCount} inputs) may impact timing`,
            suggestion: 'Consider pipeline stages or hierarchical muxing'
          });
        }
      }
      
      // Check for DSP inference opportunities
      if (trimmed.includes('*') && trimmed.includes('+')) {
        issues.push({
          line: index + 1,
          severity: 'info',
          rule: 'dsp_inference',
          message: 'Potential DSP block inference opportunity',
          suggestion: 'Structure as: (A * B) + C for DSP inference'
        });
      }
      
      // Check for BRAM inference
      if (trimmed.match(/reg\s*\[\d+:\d+\]\s*\w+\s*\[\d+:\d+\]/)) {
        issues.push({
          line: index + 1,
          severity: 'info',
          rule: 'bram_inference',
          message: 'Memory array detected - ensure BRAM inference',
          suggestion: 'Use synchronous read for BRAM inference'
        });
      }
    });
    
    return issues;
  }

  checkSynthesisAttributes(lines) {
    const issues = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check for missing timing constraints
      if (trimmed.includes('input') && trimmed.includes('clk')) {
        // Look for corresponding timing constraints
        const hasConstraint = lines.some(l => 
          l.includes('(* PERIOD') || l.includes('create_clock'));
          
        if (!hasConstraint) {
          issues.push({
            line: index + 1,
            severity: 'warning',
            rule: 'missing_timing_constraint',
            message: 'Clock signal without timing constraint',
            suggestion: 'Add (* PERIOD = "10ns" *) attribute or SDC constraint'
          });
        }
      }
      
      // Check for synthesis attributes
      if (trimmed.includes('reg') && trimmed.includes('[')) {
        const hasKeepAttribute = lines.slice(Math.max(0, index - 2), index + 1)
          .some(l => l.includes('(* keep'));
          
        if (trimmed.includes('debug') && !hasKeepAttribute) {
          issues.push({
            line: index + 1,
            severity: 'info',
            rule: 'debug_signal',
            message: 'Debug signal may be optimized away',
            suggestion: 'Add (* keep = "true" *) attribute'
          });
        }
      }
    });
    
    return issues;
  }

  generateSummary(issues) {
    const summary = {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length
    };
    
    summary.score = Math.max(0, 100 - (summary.errors * 10 + summary.warnings * 5 + summary.info * 1));
    
    return summary;
  }

  generateRecommendations(issues) {
    const recommendations = {
      immediate: [],
      optimization: [],
      best_practices: []
    };

    // Group issues by severity and type
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const infos = issues.filter(i => i.severity === 'info');

    // Immediate fixes (errors)
    if (errors.length > 0) {
      recommendations.immediate.push(
        "Fix all error-level issues before synthesis",
        "Pay special attention to latch inference and combinational loops"
      );
    }

    // Optimization suggestions
    if (infos.some(i => i.rule === 'wide_mux')) {
      recommendations.optimization.push(
        "Consider pipelining wide multiplexers for better timing",
        "Use hierarchical mux structures for large fan-in"
      );
    }

    if (infos.some(i => i.rule === 'dsp_inference')) {
      recommendations.optimization.push(
        "Restructure arithmetic for DSP block inference",
        "Group multiply-accumulate operations"
      );
    }

    // Best practices
    if (warnings.some(i => i.rule.includes('blocking'))) {
      recommendations.best_practices.push(
        "Follow consistent coding style for assignments",
        "Use non-blocking for sequential, blocking for combinational"
      );
    }

    if (issues.some(i => i.rule.includes('timing'))) {
      recommendations.best_practices.push(
        "Add proper timing constraints",
        "Use synthesis attributes where appropriate"
      );
    }

    return recommendations;
  }

  // Generate synthesis report
  generateSynthesisReport(verilogCode, targetFPGA = 'generic') {
    const lintResults = this.lintVerilogCode(verilogCode);
    
    return {
      code_quality: lintResults.summary,
      target_fpga: targetFPGA,
      estimated_resources: this.estimateResources(verilogCode, targetFPGA),
      timing_analysis: this.estimateTiming(verilogCode),
      optimization_suggestions: lintResults.recommendations,
      detailed_issues: lintResults.issues
    };
  }

  estimateResources(verilogCode, targetFPGA) {
    const resources = {
      luts: 0,
      ffs: 0,
      brams: 0,
      dsps: 0,
      ios: 0
    };

    const lines = verilogCode.split('\n');
    
    lines.forEach(line => {
      // Estimate LUTs from combinational logic
      if (line.includes('assign') || line.includes('always @(*)')) {
        const complexity = (line.match(/[&|^]/g) || []).length;
        resources.luts += Math.max(1, complexity);
      }

      // Estimate FFs from registers
      if (line.includes('always @(posedge') || line.includes('always @(negedge')) {
        const regMatch = line.match(/\[(\d+):0\]/);
        if (regMatch) {
          resources.ffs += parseInt(regMatch[1]) + 1;
        } else {
          resources.ffs += 1;
        }
      }

      // Estimate BRAMs from memory arrays
      if (line.match(/reg\s*\[\d+:\d+\]\s*\w+\s*\[\d+:\d+\]/)) {
        resources.brams += 1;
      }

      // Estimate DSPs from multipliers
      if (line.includes('*')) {
        resources.dsps += 1;
      }

      // Count IOs
      if (line.includes('input') || line.includes('output')) {
        const ioMatch = line.match(/\[(\d+):0\]/);
        if (ioMatch) {
          resources.ios += parseInt(ioMatch[1]) + 1;
        } else {
          resources.ios += 1;
        }
      }
    });

    return resources;
  }

  estimateTiming(verilogCode) {
    const timing = {
      max_frequency_mhz: 100, // Conservative estimate
      critical_path_ns: 10,
      setup_slack_ns: 2,
      hold_slack_ns: 1
    };

    // Analyze for timing-critical constructs
    const lines = verilogCode.split('\n');
    let hasComplexLogic = false;
    let hasDeepCombinational = false;

    lines.forEach(line => {
      // Check for complex combinational logic
      if (line.includes('assign') && (line.match(/[&|^]/g) || []).length > 5) {
        hasComplexLogic = true;
      }

      // Check for wide multiplexers
      if (line.includes('case') || line.includes('?')) {
        hasDeepCombinational = true;
      }
    });

    // Adjust estimates based on complexity
    if (hasComplexLogic) {
      timing.max_frequency_mhz *= 0.7;
      timing.critical_path_ns *= 1.5;
    }

    if (hasDeepCombinational) {
      timing.max_frequency_mhz *= 0.8;
      timing.critical_path_ns *= 1.3;
    }

    return timing;
  }

  // Advanced coverage analysis suggestions
  generateCoverageStrategy(verilogCode, intent) {
    const strategy = {
      functional_coverage: [],
      assertion_coverage: [],
      code_coverage: [],
      corner_cases: []
    };

    // Analyze code structure for coverage points
    const lines = verilogCode.split('\n');
    
    lines.forEach(line => {
      // Functional coverage points
      if (line.includes('case')) {
        strategy.functional_coverage.push(
          "Add covergroup for case statement branches",
          "Ensure all case values are exercised"
        );
      }

      if (line.includes('if') && line.includes('else')) {
        strategy.functional_coverage.push(
          "Cover both true and false branches of conditional",
          "Add cross coverage for multiple conditions"
        );
      }

      // Assertion suggestions
      if (line.includes('overflow') || line.includes('carry')) {
        strategy.assertion_coverage.push(
          "Add overflow detection assertions",
          "Verify carry propagation correctness"
        );
      }

      if (line.includes('valid') || line.includes('ready')) {
        strategy.assertion_coverage.push(
          "Add protocol compliance assertions",
          "Verify handshaking behavior"
        );
      }
    });

    // Component-specific corner cases
    if (intent.component === 'adder') {
      strategy.corner_cases.push(
        "Test maximum positive + maximum positive",
        "Test maximum negative + maximum negative", 
        "Test zero + zero with carry",
        "Test alternating bit patterns"
      );
    }

    if (intent.component === 'multiplier') {
      strategy.corner_cases.push(
        "Test 0 * anything = 0",
        "Test 1 * anything = anything",
        "Test maximum values",
        "Test signed/unsigned edge cases"
      );
    }

    return strategy;
  }
}

// Usage example and export
const linter = new VerilogSynthesisLinter();

// Example usage:
/*
const verilogCode = `
module example_adder (
    input [7:0] a, b,
    input cin,
    output [7:0] sum,
    output cout
);
    always @(*) begin
        {cout, sum} = a + b + cin;
    end
endmodule
`;

const results = linter.lintVerilogCode(verilogCode);
console.log(results);
*/

export default VerilogSynthesisLinter;