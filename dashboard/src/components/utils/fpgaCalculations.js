// FPGA Calculations Utility - Comprehensive Resource and Performance Calculations
// Supports timing, power, area estimation, and optimization analysis

import * as math from 'mathjs';

class FPGACalculations {
  constructor() {
    // FPGA device specifications database
    this.deviceSpecs = {
      'Artix-7': {
        family: 'Xilinx 7-Series',
        lut_delay: 0.124, // ns
        ff_delay: 0.058,  // ns
        carry_delay: 0.035, // ns per bit
        routing_delay_factor: 0.6, // multiplier for routing delay
        power_base: 150, // mW static
        power_per_lut: 0.05, // mW per LUT
        power_per_ff: 0.02,  // mW per FF
        max_frequency: 450,  // MHz
        temperature_factor: 1.1, // per 10°C
        voltage_factor: 1.8 // power scales with V^2
      },
      'Kintex-7': {
        family: 'Xilinx 7-Series',
        lut_delay: 0.112,
        ff_delay: 0.052,
        carry_delay: 0.032,
        routing_delay_factor: 0.55,
        power_base: 800,
        power_per_lut: 0.045,
        power_per_ff: 0.018,
        max_frequency: 500,
        temperature_factor: 1.1,
        voltage_factor: 1.8
      },
      'Zynq-7020': {
        family: 'Xilinx Zynq',
        lut_delay: 0.118,
        ff_delay: 0.055,
        carry_delay: 0.033,
        routing_delay_factor: 0.58,
        power_base: 400,
        power_per_lut: 0.048,
        power_per_ff: 0.019,
        max_frequency: 450,
        temperature_factor: 1.1,
        voltage_factor: 1.8
      },
      'Cyclone-V': {
        family: 'Intel/Altera',
        lut_delay: 0.134,
        ff_delay: 0.062,
        carry_delay: 0.038,
        routing_delay_factor: 0.65,
        power_base: 200,
        power_per_lut: 0.052,
        power_per_ff: 0.021,
        max_frequency: 400,
        temperature_factor: 1.12,
        voltage_factor: 1.9
      },
      'Stratix-10': {
        family: 'Intel/Altera',
        lut_delay: 0.089,
        ff_delay: 0.042,
        carry_delay: 0.025,
        routing_delay_factor: 0.45,
        power_base: 2000,
        power_per_lut: 0.035,
        power_per_ff: 0.015,
        max_frequency: 600,
        temperature_factor: 1.08,
        voltage_factor: 1.7
      }
    };

    // Design pattern delay models
    this.designPatterns = {
      'adder': {
        'ripple_carry': {
          delay_formula: (width) => width * 0.125, // ns
          lut_usage: (width) => width,
          ff_usage: (width) => width + 1,
          description: 'Linear delay with bit width'
        },
        'carry_lookahead': {
          delay_formula: (width) => Math.log2(width) * 0.3 + 0.5,
          lut_usage: (width) => width * 1.5,
          ff_usage: (width) => width + 1,
          description: 'Logarithmic delay, more LUTs'
        },
        'carry_select': {
          delay_formula: (width) => Math.sqrt(width) * 0.4 + 0.8,
          lut_usage: (width) => width * 2.2,
          ff_usage: (width) => width + 1,
          description: 'Square root delay scaling'
        }
      },
      'multiplier': {
        'array': {
          delay_formula: (width) => width * 0.2,
          lut_usage: (width) => width * width * 0.8,
          ff_usage: (width) => width * 2,
          description: 'Linear delay, quadratic area'
        },
        'booth': {
          delay_formula: (width) => width * 0.15 + 1.0,
          lut_usage: (width) => width * width * 0.6,
          ff_usage: (width) => width * 1.5,
          description: 'Optimized for signed multiplication'
        },
        'wallace_tree': {
          delay_formula: (width) => Math.log2(width) * 1.2 + 2.5,
          lut_usage: (width) => width * width * 1.1,
          ff_usage: (width) => width * 2.5,
          description: 'Fast but resource intensive'
        }
      },
      'memory': {
        'distributed': {
          delay_formula: (depth, width) => 0.8 + Math.log2(depth) * 0.1,
          lut_usage: (depth, width) => depth * width / 32,
          ff_usage: (depth, width) => 0,
          description: 'Uses LUT RAM'
        },
        'block_ram': {
          delay_formula: (depth, width) => 2.5,
          lut_usage: (depth, width) => Math.ceil(width / 8) * 2,
          ff_usage: (depth, width) => width * 2,
          description: 'Dedicated BRAM blocks'
        }
      }
    };
  }

  // Calculate timing for a given design
  calculateTiming(designConfig) {
    try {
      const {
        device = 'Artix-7',
        component = 'adder',
        architecture = 'ripple_carry',
        width = 8,
        depth = null,
        logic_levels = null,
        fanout = 4,
        temperature = 25,
        voltage = 1.0,
        speed_grade = -1
      } = designConfig;

      const deviceSpec = this.deviceSpecs[device];
      if (!deviceSpec) {
        throw new Error(`Unsupported device: ${device}`);
      }

      // Get pattern-specific delay
      let logicDelay = 0;
      if (this.designPatterns[component] && this.designPatterns[component][architecture]) {
        const pattern = this.designPatterns[component][architecture];
        if (component === 'memory' && depth) {
          logicDelay = pattern.delay_formula(depth, width);
        } else {
          logicDelay = pattern.delay_formula(width);
        }
      } else {
        // Generic calculation based on logic levels
        const levels = logic_levels || Math.ceil(Math.log2(width));
        logicDelay = levels * deviceSpec.lut_delay;
      }

      // Calculate routing delay
      const routingDelay = logicDelay * deviceSpec.routing_delay_factor * Math.sqrt(fanout);

      // Apply environmental factors
      const tempFactor = Math.pow(deviceSpec.temperature_factor, (temperature - 25) / 10);
      const speedFactor = this.getSpeedGradeFactor(speed_grade);
      
      const totalDelay = (logicDelay + routingDelay) * tempFactor * speedFactor;
      const maxFrequency = Math.min(1000 / totalDelay, deviceSpec.max_frequency);

      // Calculate slack assuming 100MHz target
      const targetPeriod = 10.0; // ns for 100MHz
      const setupSlack = targetPeriod - totalDelay;
      const holdSlack = 0.5; // Typical hold slack

      return {
        logic_delay: parseFloat(logicDelay.toFixed(3)),
        routing_delay: parseFloat(routingDelay.toFixed(3)),
        total_delay: parseFloat(totalDelay.toFixed(3)),
        max_frequency: parseFloat(maxFrequency.toFixed(1)),
        setup_slack: parseFloat(setupSlack.toFixed(3)),
        hold_slack: parseFloat(holdSlack.toFixed(3)),
        critical_path: {
          levels: logic_levels || Math.ceil(Math.log2(width)),
          fanout: fanout,
          bottleneck: logicDelay > routingDelay ? 'logic' : 'routing'
        }
      };
    } catch (error) {
      throw new Error(`Timing calculation failed: ${error.message}`);
    }
  }

  // Calculate resource utilization
  calculateResources(designConfig) {
    try {
      const {
        device = 'Artix-7',
        component = 'adder',
        architecture = 'ripple_carry',
        width = 8,
        depth = null,
        instances = 1
      } = designConfig;

      let lutUsage = 0;
      let ffUsage = 0;
      let bramUsage = 0;
      let dspUsage = 0;

      // Get pattern-specific resource usage
      if (this.designPatterns[component] && this.designPatterns[component][architecture]) {
        const pattern = this.designPatterns[component][architecture];
        
        if (component === 'memory' && depth) {
          lutUsage = pattern.lut_usage(depth, width);
          ffUsage = pattern.ff_usage(depth, width);
          if (architecture === 'block_ram') {
            bramUsage = Math.ceil((depth * width) / (512 * 36)); // Typical BRAM size
          }
        } else {
          lutUsage = pattern.lut_usage(width);
          ffUsage = pattern.ff_usage(width);
        }

        // Special handling for multipliers and DSP usage
        if (component === 'multiplier' && width >= 8) {
          dspUsage = Math.ceil(width / 18); // DSP48 can handle 18x18
          lutUsage *= 0.3; // Reduce LUT usage when using DSPs
        }
      } else {
        // Generic estimation
        lutUsage = width * 2;
        ffUsage = width;
      }

      // Scale by number of instances
      lutUsage *= instances;
      ffUsage *= instances;
      bramUsage *= instances;
      dspUsage *= instances;

      // Calculate I/O usage (simplified)
      const ioUsage = (width * 2) + 3; // inputs + outputs + control

      return {
        luts: Math.ceil(lutUsage),
        ffs: Math.ceil(ffUsage),
        brams: Math.ceil(bramUsage),
        dsps: Math.ceil(dspUsage),
        ios: Math.ceil(ioUsage),
        total_equivalent_luts: Math.ceil(lutUsage + ffUsage * 0.5 + bramUsage * 10 + dspUsage * 5)
      };
    } catch (error) {
      throw new Error(`Resource calculation failed: ${error.message}`);
    }
  }

  // Calculate power consumption
  calculatePower(designConfig) {
    try {
      const {
        device = 'Artix-7',
        frequency = 100, // MHz
        toggle_rate = 0.25,
        voltage = 1.0,
        temperature = 25,
        utilization = {}
      } = designConfig;

      const deviceSpec = this.deviceSpecs[device];
      if (!deviceSpec) {
        throw new Error(`Unsupported device: ${device}`);
      }

      const resources = utilization.luts || 0;
      const ffs = utilization.ffs || 0;

      // Static power (leakage)
      const tempFactor = Math.pow(deviceSpec.temperature_factor, (temperature - 25) / 10);
      const voltageFactor = Math.pow(voltage, deviceSpec.voltage_factor);
      const staticPower = deviceSpec.power_base * tempFactor * voltageFactor;

      // Dynamic power
      const lutSwitchingPower = resources * deviceSpec.power_per_lut * frequency * toggle_rate;
      const ffSwitchingPower = ffs * deviceSpec.power_per_ff * frequency * toggle_rate;
      const clockPower = frequency * 0.1; // Approximate clock power
      const ioPower = (utilization.ios || 0) * 0.5; // I/O power

      const dynamicPower = lutSwitchingPower + ffSwitchingPower + clockPower + ioPower;
      const totalPower = staticPower + dynamicPower;

      return {
        static_power: parseFloat(staticPower.toFixed(2)),
        dynamic_power: parseFloat(dynamicPower.toFixed(2)),
        total_power: parseFloat(totalPower.toFixed(2)),
        breakdown: {
          logic_power: parseFloat(lutSwitchingPower.toFixed(2)),
          ff_power: parseFloat(ffSwitchingPower.toFixed(2)),
          clock_power: parseFloat(clockPower.toFixed(2)),
          io_power: parseFloat(ioPower.toFixed(2))
        },
        efficiency: parseFloat((frequency / totalPower).toFixed(2)), // MHz/mW
        thermal_design_power: parseFloat((totalPower * 1.3).toFixed(2)) // With margin
      };
    } catch (error) {
      throw new Error(`Power calculation failed: ${error.message}`);
    }
  }

  // Calculate area efficiency
  calculateAreaEfficiency(designConfig, targetDevice) {
    try {
      const resources = this.calculateResources(designConfig);
      const deviceSpec = this.deviceSpecs[targetDevice];
      
      if (!deviceSpec) {
        throw new Error(`Unsupported target device: ${targetDevice}`);
      }

      // Device capacity (typical values)
      const deviceCapacity = {
        'Artix-7': { luts: 20800, ffs: 41600, brams: 50, dsps: 90 },
        'Kintex-7': { luts: 101440, ffs: 202800, brams: 445, dsps: 240 },
        'Zynq-7020': { luts: 53200, ffs: 106400, brams: 140, dsps: 220 },
        'Cyclone-V': { luts: 32070, ffs: 32070, brams: 557, dsps: 87 },
        'Stratix-10': { luts: 933120, ffs: 933120, brams: 11721, dsps: 5760 }
      };

      const capacity = deviceCapacity[targetDevice];
      
      const utilization = {
        lut_percentage: (resources.luts / capacity.luts) * 100,
        ff_percentage: (resources.ffs / capacity.ffs) * 100,
        bram_percentage: (resources.brams / capacity.brams) * 100,
        dsp_percentage: (resources.dsps / capacity.dsps) * 100
      };

      const maxUtilization = Math.max(...Object.values(utilization));
      const scalingFactor = Math.floor(100 / maxUtilization);

      return {
        utilization_percentages: utilization,
        bottleneck_resource: Object.keys(utilization).find(key => 
          utilization[key] === maxUtilization
        ).replace('_percentage', ''),
        scaling_factor: scalingFactor,
        area_efficiency: parseFloat((100 / maxUtilization).toFixed(2)),
        can_fit: maxUtilization <= 100
      };
    } catch (error) {
      throw new Error(`Area efficiency calculation failed: ${error.message}`);
    }
  }

  // Optimization analysis
  analyzeOptimizations(designConfig) {
    try {
      const baselineResources = this.calculateResources(designConfig);
      const baselineTiming = this.calculateTiming(designConfig);
      const baselinePower = this.calculatePower({ ...designConfig, utilization: baselineResources });

      const optimizations = [];

      // Analyze different architectures for the same component
      if (this.designPatterns[designConfig.component]) {
        const architectures = Object.keys(this.designPatterns[designConfig.component]);
        
        architectures.forEach(arch => {
          if (arch !== designConfig.architecture) {
            const optimizedConfig = { ...designConfig, architecture: arch };
            const resources = this.calculateResources(optimizedConfig);
            const timing = this.calculateTiming(optimizedConfig);
            const power = this.calculatePower({ ...optimizedConfig, utilization: resources });

            optimizations.push({
              type: 'architecture_change',
              description: `Switch to ${arch} architecture`,
              changes: {
                architecture: arch
              },
              impact: {
                frequency_change: timing.max_frequency - baselineTiming.max_frequency,
                lut_change: resources.luts - baselineResources.luts,
                power_change: power.total_power - baselinePower.total_power,
                delay_change: timing.total_delay - baselineTiming.total_delay
              },
              score: this.calculateOptimizationScore({
                frequency: timing.max_frequency / baselineTiming.max_frequency,
                area: baselineResources.luts / resources.luts,
                power: baselinePower.total_power / power.total_power
              })
            });
          }
        });
      }

      // Analyze pipelining opportunities
      if (baselineTiming.critical_path.levels > 4) {
        const pipelineStages = Math.ceil(baselineTiming.critical_path.levels / 3);
        const pipelinedFreq = baselineTiming.max_frequency * 2.5;
        const additionalFFs = baselineResources.luts * (pipelineStages - 1);

        optimizations.push({
          type: 'pipelining',
          description: `Add ${pipelineStages} pipeline stages`,
          changes: {
            pipeline_stages: pipelineStages
          },
          impact: {
            frequency_change: pipelinedFreq - baselineTiming.max_frequency,
            lut_change: 0,
            ff_change: additionalFFs,
            latency_increase: pipelineStages
          },
          score: this.calculateOptimizationScore({
            frequency: pipelinedFreq / baselineTiming.max_frequency,
            area: 1.0,
            power: 1.1 // Slight power increase
          })
        });
      }

      // Analyze voltage/frequency scaling
      const lowPowerConfig = {
        ...designConfig,
        frequency: designConfig.frequency * 0.8,
        voltage: 0.9,
        utilization: baselineResources
      };
      const lowPowerResult = this.calculatePower(lowPowerConfig);

      optimizations.push({
        type: 'dvfs',
        description: 'Dynamic Voltage and Frequency Scaling',
        changes: {
          frequency_scaling: 0.8,
          voltage_scaling: 0.9
        },
        impact: {
          frequency_change: -designConfig.frequency * 0.2,
          power_change: lowPowerResult.total_power - baselinePower.total_power,
          lut_change: 0
        },
        score: this.calculateOptimizationScore({
          frequency: 0.8,
          area: 1.0,
          power: baselinePower.total_power / lowPowerResult.total_power
        })
      });

      // Sort optimizations by score
      optimizations.sort((a, b) => b.score - a.score);

      return {
        baseline: {
          resources: baselineResources,
          timing: baselineTiming,
          power: baselinePower
        },
        optimizations: optimizations.slice(0, 5), // Top 5 optimizations
        recommendations: this.generateOptimizationRecommendations(optimizations)
      };
    } catch (error) {
      throw new Error(`Optimization analysis failed: ${error.message}`);
    }
  }

  // Calculate optimization score (higher is better)
  calculateOptimizationScore(factors) {
    const weights = {
      frequency: 0.4,
      area: 0.3,
      power: 0.3
    };

    return (factors.frequency * weights.frequency) +
           (factors.area * weights.area) +
           (factors.power * weights.power);
  }

  // Generate optimization recommendations
  generateOptimizationRecommendations(optimizations) {
    const recommendations = [];

    // Find best frequency optimization
    const bestFreqOpt = optimizations.find(opt => opt.impact.frequency_change > 0);
    if (bestFreqOpt) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        description: bestFreqOpt.description,
        expected_improvement: `+${bestFreqOpt.impact.frequency_change.toFixed(1)} MHz`
      });
    }

    // Find best area optimization
    const bestAreaOpt = optimizations.find(opt => opt.impact.lut_change < 0);
    if (bestAreaOpt) {
      recommendations.push({
        category: 'area',
        priority: 'medium',
        description: bestAreaOpt.description,
        expected_improvement: `${bestAreaOpt.impact.lut_change} LUTs saved`
      });
    }

    // Find best power optimization
    const bestPowerOpt = optimizations.find(opt => opt.impact.power_change < 0);
    if (bestPowerOpt) {
      recommendations.push({
        category: 'power',
        priority: 'medium',
        description: bestPowerOpt.description,
        expected_improvement: `${Math.abs(bestPowerOpt.impact.power_change).toFixed(1)} mW saved`
      });
    }

    return recommendations;
  }

  // Thermal analysis
  calculateThermalAnalysis(powerConfig, environmentalConditions = {}) {
    try {
      const {
        ambient_temperature = 25, // °C
        airflow = 200, // LFM (Linear Feet per Minute)
        heat_sink_efficiency = 0.8,
        package_type = 'BGA'
      } = environmentalConditions;

      const power = this.calculatePower(powerConfig);
      
      // Thermal resistance values (°C/W) - typical values
      const thermalResistance = {
        'BGA': { junction_to_case: 0.2, case_to_ambient: 2.5 },
        'QFP': { junction_to_case: 0.5, case_to_ambient: 8.0 },
        'TQFP': { junction_to_case: 0.3, case_to_ambient: 4.0 }
      };

      const resistance = thermalResistance[package_type] || thermalResistance['BGA'];
      
      // Calculate junction temperature
      const airflowFactor = Math.max(0.5, 1.0 - (airflow - 100) / 1000);
      const effectiveResistance = resistance.case_to_ambient * airflowFactor * heat_sink_efficiency;
      
      const temperatureRise = (power.total_power / 1000) * (resistance.junction_to_case + effectiveResistance);
      const junctionTemperature = ambient_temperature + temperatureRise;
      
      // Calculate thermal margin
      const maxJunctionTemp = 85; // Typical max for commercial grade
      const thermalMargin = maxJunctionTemp - junctionTemperature;

      return {
        junction_temperature: parseFloat(junctionTemperature.toFixed(1)),
        temperature_rise: parseFloat(temperatureRise.toFixed(1)),
        thermal_margin: parseFloat(thermalMargin.toFixed(1)),
        thermal_status: thermalMargin > 10 ? 'safe' : thermalMargin > 0 ? 'marginal' : 'critical',
        recommendations: this.generateThermalRecommendations(thermalMargin, junctionTemperature)
      };
    } catch (error) {
      throw new Error(`Thermal analysis failed: ${error.message}`);
    }
  }

  // Generate thermal recommendations
  generateThermalRecommendations(margin, junctionTemp) {
    const recommendations = [];

    if (margin < 10) {
      recommendations.push('Improve cooling solution');
      recommendations.push('Consider heat sink with better thermal conductivity');
    }

    if (junctionTemp > 70) {
      recommendations.push('Reduce operating frequency to lower power');
      recommendations.push('Implement power gating for unused logic');
    }

    if (margin < 0) {
      recommendations.push('CRITICAL: Reduce power consumption immediately');
      recommendations.push('Consider different FPGA with better thermal characteristics');
    }

    return recommendations;
  }

  // Get speed grade factor
  getSpeedGradeFactor(speedGrade) {
    const factors = {
      '-1': 1.0,   // Slowest
      '-2': 0.85,  // Medium
      '-3': 0.75   // Fastest
    };
    return factors[speedGrade.toString()] || 1.0;
  }

  // Clock domain crossing analysis
  analyzeCDC(clockDomains) {
    try {
      const cdcAnalysis = {
        total_crossings: 0,
        synchronizers_needed: [],
        potential_issues: [],
        recommendations: []
      };

      // Analyze all combinations of clock domains
      for (let i = 0; i < clockDomains.length; i++) {
        for (let j = i + 1; j < clockDomains.length; j++) {
          const domain1 = clockDomains[i];
          const domain2 = clockDomains[j];
          
          if (domain1.frequency !== domain2.frequency) {
            cdcAnalysis.total_crossings++;
            
            const freqRatio = domain1.frequency / domain2.frequency;
            
            if (freqRatio > 2 || freqRatio < 0.5) {
              cdcAnalysis.potential_issues.push({
                from_domain: domain1.name,
                to_domain: domain2.name,
                frequency_ratio: freqRatio,
                issue: 'Large frequency difference may cause metastability'
              });
            }

            cdcAnalysis.synchronizers_needed.push({
              from_domain: domain1.name,
              to_domain: domain2.name,
              recommended_stages: freqRatio > 4 ? 3 : 2,
              synchronizer_type: 'ff_synchronizer'
            });
          }
        }
      }

      // Generate recommendations
      if (cdcAnalysis.total_crossings > 0) {
        cdcAnalysis.recommendations.push('Use multi-stage flip-flop synchronizers for CDC');
        cdcAnalysis.recommendations.push('Add timing constraints for clock domain crossings');
      }

      if (cdcAnalysis.potential_issues.length > 0) {
        cdcAnalysis.recommendations.push('Consider FIFO-based CDC for large frequency ratios');
        cdcAnalysis.recommendations.push('Implement proper handshaking protocols');
      }

      return cdcAnalysis;
    } catch (error) {
      throw new Error(`CDC analysis failed: ${error.message}`);
    }
  }

  // Performance prediction
  predictPerformance(designConfig, targetSpecs) {
    try {
      const current = {
        timing: this.calculateTiming(designConfig),
        resources: this.calculateResources(designConfig),
        power: this.calculatePower({ ...designConfig, utilization: this.calculateResources(designConfig) })
      };

      const predictions = {};

      // Predict if target frequency is achievable
      if (targetSpecs.target_frequency) {
        const requiredPeriod = 1000 / targetSpecs.target_frequency; // ns
        const feasible = current.timing.total_delay <= requiredPeriod;
        
        predictions.frequency_feasibility = {
          achievable: feasible,
          current_max: current.timing.max_frequency,
          target: targetSpecs.target_frequency,
          margin: requiredPeriod - current.timing.total_delay,
          required_optimization: feasible ? 'none' : 'pipelining_or_architecture_change'
        };
      }

      // Predict resource scaling
      if (targetSpecs.instances) {
        const scaledResources = {
          luts: current.resources.luts * targetSpecs.instances,
          ffs: current.resources.ffs * targetSpecs.instances,
          brams: current.resources.brams * targetSpecs.instances,
          dsps: current.resources.dsps * targetSpecs.instances
        };

        predictions.resource_scaling = {
          total_resources: scaledResources,
          feasible: this.checkResourceFeasibility(scaledResources, designConfig.device),
          bottleneck: this.findResourceBottleneck(scaledResources, designConfig.device)
        };
      }

      // Predict power scaling
      if (targetSpecs.frequency_scaling || targetSpecs.instances) {
        const scalingFactor = (targetSpecs.frequency_scaling || 1) * (targetSpecs.instances || 1);
        const scaledPower = current.power.total_power * scalingFactor;
        
        predictions.power_scaling = {
          estimated_power: scaledPower,
          thermal_feasible: scaledPower < 10000, // 10W threshold
          cooling_requirements: this.calculateCoolingRequirements(scaledPower)
        };
      }

      return {
        current_performance: current,
        predictions: predictions,
        recommendations: this.generatePerformancePredictionRecommendations(predictions)
      };
    } catch (error) {
      throw new Error(`Performance prediction failed: ${error.message}`);
    }
  }

  // Check if resources fit in target device
  checkResourceFeasibility(resources, device) {
    const deviceCapacity = {
      'Artix-7': { luts: 20800, ffs: 41600, brams: 50, dsps: 90 },
      'Kintex-7': { luts: 101440, ffs: 202800, brams: 445, dsps: 240 },
      'Zynq-7020': { luts: 53200, ffs: 106400, brams: 140, dsps: 220 },
      'Cyclone-V': { luts: 32070, ffs: 32070, brams: 557, dsps: 87 },
      'Stratix-10': { luts: 933120, ffs: 933120, brams: 11721, dsps: 5760 }
    };

    const capacity = deviceCapacity[device];
    if (!capacity) return false;

    return resources.luts <= capacity.luts &&
           resources.ffs <= capacity.ffs &&
           resources.brams <= capacity.brams &&
           resources.dsps <= capacity.dsps;
  }

  // Find resource bottleneck
  findResourceBottleneck(resources, device) {
    const deviceCapacity = {
      'Artix-7': { luts: 20800, ffs: 41600, brams: 50, dsps: 90 },
      'Kintex-7': { luts: 101440, ffs: 202800, brams: 445, dsps: 240 },
      'Zynq-7020': { luts: 53200, ffs: 106400, brams: 140, dsps: 220 },
      'Cyclone-V': { luts: 32070, ffs: 32070, brams: 557, dsps: 87 },
      'Stratix-10': { luts: 933120, ffs: 933120, brams: 11721, dsps: 5760 }
    };

    const capacity = deviceCapacity[device];
    if (!capacity) return 'unknown';

    const utilizations = {
      luts: resources.luts / capacity.luts,
      ffs: resources.ffs / capacity.ffs,
      brams: resources.brams / capacity.brams,
      dsps: resources.dsps / capacity.dsps
    };

    return Object.keys(utilizations).reduce((a, b) => 
      utilizations[a] > utilizations[b] ? a : b
    );
  }

  // Calculate cooling requirements
  calculateCoolingRequirements(powerMW) {
    if (powerMW < 1000) return 'natural_convection';
    if (powerMW < 5000) return 'forced_air_cooling';
    if (powerMW < 15000) return 'heat_sink_fan';
    return 'liquid_cooling';
  }

  // Generate performance prediction recommendations
  generatePerformancePredictionRecommendations(predictions) {
    const recommendations = [];

    if (predictions.frequency_feasibility && !predictions.frequency_feasibility.achievable) {
      recommendations.push({
        category: 'timing',
        priority: 'high',
        description: 'Target frequency not achievable with current design',
        action: predictions.frequency_feasibility.required_optimization
      });
    }

    if (predictions.resource_scaling && !predictions.resource_scaling.feasible) {
      recommendations.push({
        category: 'resources',
        priority: 'high',
        description: `Resource bottleneck: ${predictions.resource_scaling.bottleneck}`,
        action: 'consider_larger_device_or_optimization'
      });
    }

    if (predictions.power_scaling && !predictions.power_scaling.thermal_feasible) {
      recommendations.push({
        category: 'thermal',
        priority: 'medium',
        description: 'Power consumption may require enhanced cooling',
        action: predictions.power_scaling.cooling_requirements
      });
    }

    return recommendations;
  }
}

// Export the calculations utility
export default FPGACalculations;