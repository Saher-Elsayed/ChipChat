import React, { useState, useEffect } from 'react';
import CircuitVisualizer from './CircuitVisualizer';
import generateUARTDesign from './generateUARTDesign';
import generateALUDesign from './generateALUDesign';
import { processDesignPrompt, translateToDesignConfig } from '../services/nlpService';

const FPGADesignGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [activeTab, setActiveTab] = useState('schematic');
  
  // Example prompts for users
  const examplePrompts = [
    "Create a 4-bit counter with enable and reset inputs",
    "Design a traffic light controller for a 4-way intersection",
    "Build a UART receiver with 8-bit data and 1 stop bit",
    "Design a simple ALU with add, subtract, and logical operations"
  ];

  // Generate design based on prompt
  const generateDesign = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Use the NLP service to process the prompt
      const nlpResult = await processDesignPrompt(prompt);
      console.log("NLP Result:", nlpResult);
      
      // Convert NLP result to design configuration
      const designConfig = translateToDesignConfig(nlpResult);
      console.log("Design Config:", designConfig);
      
      // Generate the appropriate design based on the configuration
      let design;
      
      switch (designConfig.type) {
        case 'counter':
          design = generateCounterDesign(
            designConfig.bits, 
            designConfig.hasEnable, 
            designConfig.hasReset
          );
          break;
          
        case 'traffic_light':
          design = generateTrafficLightDesign(
            designConfig.isIntersection, 
            designConfig.wayCount
          );
          break;
          
        case 'uart':
          design = generateUARTDesign(
            designConfig.isReceiver, 
            designConfig.isTransmitter, 
            designConfig.dataBits, 
            designConfig.stopBits
          );
          break;
          
        case 'alu':
          design = generateALUDesign(
            designConfig.bitWidth, 
            designConfig.hasLogical, 
            designConfig.hasShift
          );
          break;
          
        case 'custom':
          // For custom designs that don't match predefined types,
          // we can either try to map to the closest matching generator
          // or provide a more detailed explanation
          design = handleCustomDesign(designConfig.params);
          break;
          
        default:
          // Default to a counter if we can't determine the type
          design = generateCounterDesign(4, false, true);
      }
      
      setGeneratedDesign(design);
    } catch (error) {
      console.error("Error generating design:", error);
      // Fallback to the rule-based approach if the NLP service fails
      const design = parsePromptAndGenerateDesign(prompt);
      setGeneratedDesign(design);
    } finally {
      setIsGenerating(false);
    }
  };

  // This function is used as a fallback for the NLP-based approach
  const parsePromptAndGenerateDesign = (promptText) => {
    const lowerPrompt = promptText.toLowerCase();
    
    // NLP-based design parameter extraction
    const extractDesignType = (prompt) => {
      // Rule-based keyword detection for design types with scoring
      const keywords = {
        counter: ["counter", "count", "increment", "binary", "flip-flop", "sequential"],
        traffic: ["traffic", "light", "signal", "intersection", "crossroad", "fsm", "stoplight"],
        uart: ["uart", "serial", "communication", "transmit", "receive", "tx", "rx", "rs232"],
        alu: ["alu", "arithmetic", "add", "subtract", "logic", "operation", "processor"]
      };
      
      // Score each design type based on keyword matches
      let scores = {
        counter: 0,
        traffic: 0,
        uart: 0,
        alu: 0
      };
      
      // Calculate scores
      Object.keys(keywords).forEach(type => {
        keywords[type].forEach(word => {
          if (prompt.includes(word)) {
            scores[type] += 1;
          }
        });
      });
      
      // Determine highest score
      let maxScore = 0;
      let bestMatch = "counter"; // Default
      
      Object.keys(scores).forEach(type => {
        if (scores[type] > maxScore) {
          maxScore = scores[type];
          bestMatch = type;
        }
      });
      
      return { type: bestMatch, confidence: maxScore };
    };
    
    const designInfo = extractDesignType(lowerPrompt);
    console.log(`Detected design type: ${designInfo.type} (confidence: ${designInfo.confidence})`);
    
    // Extract common parameters regardless of design type
    const bitWidth = extractBitWidth(lowerPrompt) || 
                     (designInfo.type === 'counter' ? 4 : 
                      designInfo.type === 'uart' ? 8 : 
                      designInfo.type === 'alu' ? 8 : 4);
    
    // Generate design based on detected type
    switch(designInfo.type) {
      case "counter":
        const hasEnable = lowerPrompt.includes('enable') || 
                          lowerPrompt.includes('en') || 
                          lowerPrompt.includes('control');
        const hasReset = lowerPrompt.includes('reset') || 
                         lowerPrompt.includes('rst') || 
                         lowerPrompt.includes('clear');
        
        return generateCounterDesign(bitWidth, hasEnable, hasReset);
        
      case "traffic":
        const isIntersection = lowerPrompt.includes('intersection') || 
                              lowerPrompt.includes('cross') || 
                              lowerPrompt.includes('junction');
        const wayCount = extractWayCount(lowerPrompt) || 
                        (lowerPrompt.includes('4-way') ? 4 : 
                         lowerPrompt.includes('3-way') ? 3 : 
                         lowerPrompt.includes('2-way') ? 2 : 4);
        
        return generateTrafficLightDesign(isIntersection, wayCount);
        
      case "uart":
        const isReceiver = lowerPrompt.includes('receiver') || 
                          lowerPrompt.includes('rx') || 
                          lowerPrompt.includes('receive') ||
                          (!lowerPrompt.includes('transmitter') && !lowerPrompt.includes('tx'));
        
        const isTransmitter = lowerPrompt.includes('transmitter') || 
                             lowerPrompt.includes('tx') || 
                             lowerPrompt.includes('transmit') ||
                             (!lowerPrompt.includes('receiver') && !lowerPrompt.includes('rx'));
        
        const dataBits = extractBitWidth(lowerPrompt) || 
                        (lowerPrompt.includes('7-bit') ? 7 : 
                         lowerPrompt.includes('9-bit') ? 9 : 8);
        
        const stopBits = lowerPrompt.includes('2 stop') || 
                         lowerPrompt.includes('two stop') ? 2 : 1;
        
        return generateUARTDesign(isReceiver, isTransmitter, dataBits, stopBits);
        
      case "alu":
        const hasLogical = !lowerPrompt.includes('no logical') && 
                          (lowerPrompt.includes('logical') || 
                           lowerPrompt.includes('logic') || 
                           lowerPrompt.includes('boolean') ||
                           lowerPrompt.includes('and') || 
                           lowerPrompt.includes('or') || 
                           lowerPrompt.includes('xor'));
        
        const hasShift = !lowerPrompt.includes('no shift') && 
                        (lowerPrompt.includes('shift') || 
                         lowerPrompt.includes('sll') || 
                         lowerPrompt.includes('srl') || 
                         lowerPrompt.includes('rotation'));
        
        return generateALUDesign(bitWidth, hasLogical, hasShift);
        
      default:
        // If confidence is too low, default to a simple counter
        return generateCounterDesign(4, false, true);
    }
  };

  // Handle custom designs that don't fit into predefined categories
  const handleCustomDesign = (params) => {
    console.log("Attempting to handle custom design:", params);
    
    // For the purpose of this implementation, we'll try to map the custom design 
    // to one of our existing generators based on the available parameters
    
    if (params.isSequential) {
      // Sequential designs are likely similar to counters
      return generateCounterDesign(
        params.bitWidth || 4,
        true,  // Enable control for flexibility
        true   // Reset for safety
      );
    } else if (params.isCombinational) {
      // Combinational designs might be similar to ALUs
      return generateALUDesign(
        params.bitWidth || 8,
        true,  // Include logical operations
        false  // Skip shift operations for simplicity
      );
    } else {
      // For completely custom designs, we'll create a generic description
      // and return a minimal implementation
      
      // Create nodes and edges for a simple circuit visualization
      const nodes = [
        { id: 'clk', label: 'Clock', x: 50, y: 50, type: 'input' },
        { id: 'in1', label: 'Input 1', x: 50, y: 100, type: 'input' },
        { id: 'in2', label: 'Input 2', x: 50, y: 150, type: 'input' },
        { id: 'custom', label: 'Custom Logic', x: 200, y: 100, type: 'gate' },
        { id: 'out', label: 'Output', x: 350, y: 100, type: 'output' }
      ];
      
      const edges = [
        { from: 'clk', to: 'custom' },
        { from: 'in1', to: 'custom' },
        { from: 'in2', to: 'custom' },
        { from: 'custom', to: 'out' }
      ];
      
      // Generate placeholder RTL code based on the description
      let rtlCode = `module custom_design #(\n`;
      rtlCode += `  parameter WIDTH = ${params.bitWidth || 8}\n`;
      rtlCode += `) (\n`;
      rtlCode += `  input wire clk,\n`;
      rtlCode += `  input wire [WIDTH-1:0] in1,\n`;
      rtlCode += `  input wire [WIDTH-1:0] in2,\n`;
      rtlCode += `  output reg [WIDTH-1:0] out\n`;
      rtlCode += `);\n\n`;
      
      rtlCode += `  // This is a custom design based on the following description:\n`;
      rtlCode += `  // ${params.description}\n\n`;
      
      rtlCode += `  // Implement custom logic here\n`;
      rtlCode += `  always @(posedge clk) begin\n`;
      rtlCode += `    // Placeholder implementation\n`;
      rtlCode += `    out <= in1 ^ in2;  // XOR operation as placeholder\n`;
      rtlCode += `  end\n\n`;
      
      rtlCode += `endmodule`;
      
      // Generate simple testbench
      let testbench = `module custom_design_tb;\n`;
      testbench += `  parameter WIDTH = ${params.bitWidth || 8};\n\n`;
      testbench += `  reg clk;\n`;
      testbench += `  reg [WIDTH-1:0] in1, in2;\n`;
      testbench += `  wire [WIDTH-1:0] out;\n\n`;
      
      testbench += `  // Instantiate design\n`;
      testbench += `  custom_design #(.WIDTH(WIDTH)) dut (\n`;
      testbench += `    .clk(clk),\n`;
      testbench += `    .in1(in1),\n`;
      testbench += `    .in2(in2),\n`;
      testbench += `    .out(out)\n`;
      testbench += `  );\n\n`;
      
      testbench += `  // Clock generation\n`;
      testbench += `  initial begin\n`;
      testbench += `    clk = 0;\n`;
      testbench += `    forever #5 clk = ~clk;\n`;
      testbench += `  end\n\n`;
      
      testbench += `  // Test vectors\n`;
      testbench += `  initial begin\n`;
      testbench += `    in1 = 0; in2 = 0;\n`;
      testbench += `    #10 in1 = 8'hAA; in2 = 8'h55;\n`;
      testbench += `    #10 in1 = 8'hFF; in2 = 8'h00;\n`;
      testbench += `    #10 in1 = 8'h12; in2 = 8'h34;\n`;
      testbench += `    #10 $finish;\n`;
      testbench += `  end\n\n`;
      
      testbench += `  // Monitor\n`;
      testbench += `  initial begin\n`;
      testbench += `    $monitor("Time: %t, in1 = %h, in2 = %h, out = %h", $time, in1, in2, out);\n`;
      testbench += `  end\n`;
      testbench += `endmodule`;
      
      // Description and components
      const description = `A custom design based on: "${params.description}". ` +
                         `This is an experimental implementation with a complexity level rated as ${params.complexity}.`;
      
      const components = [
        "Clock",
        "Input Registers",
        "Custom Logic Block",
        "Output Register"
      ];
      
      return {
        schematic: { nodes, edges },
        rtlCode,
        testbench,
        description,
        components
      };
    }
  };
  
  // Helper to extract bit width from prompt
  const extractBitWidth = (prompt) => {
    const matches = prompt.match(/(\d+)[\s-]*bit/);
    return matches ? parseInt(matches[1]) : null;
  };
  
  // Helper to extract way count for traffic lights
  const extractWayCount = (prompt) => {
    const matches = prompt.match(/(\d+)[\s-]*way/);
    return matches ? parseInt(matches[1]) : null;
  };
  
  // Generate counter design
  const generateCounterDesign = (bits, hasEnable, hasReset) => {
    // Generate schematic nodes and edges for the circuit visualizer
    const nodes = [
      { id: 'clk', label: 'Clock', x: 50, y: 100, type: 'input' }
    ];
    
    const edges = [];
    let yPos = 150;
    
    if (hasReset) {
      nodes.push({ id: 'rst', label: 'Reset', x: 50, y: yPos, type: 'input' });
      edges.push({ from: 'rst', to: 'counter' });
      yPos += 50;
    }
    
    if (hasEnable) {
      nodes.push({ id: 'en', label: 'Enable', x: 50, y: yPos, type: 'input' });
      edges.push({ from: 'en', to: 'counter' });
      yPos += 50;
    }
    
    nodes.push({ id: 'counter', label: `${bits}-bit Counter`, x: 200, y: 150, type: 'gate' });
    nodes.push({ id: 'out', label: `Count[${bits-1}:0]`, x: 350, y: 150, type: 'output' });
    
    edges.push({ from: 'clk', to: 'counter' });
    edges.push({ from: 'counter', to: 'out' });
    
    // Generate RTL code
    let rtlCode = `module counter_${bits}bit (\n`;
    rtlCode += `  input wire clk,\n`;
    if (hasReset) rtlCode += `  input wire rst_n,\n`;
    if (hasEnable) rtlCode += `  input wire enable,\n`;
    rtlCode += `  output reg [${bits-1}:0] count\n);\n\n`;
    
    rtlCode += `  always @(posedge clk${hasReset ? ' or negedge rst_n' : ''}) begin\n`;
    if (hasReset) {
      rtlCode += `    if (~rst_n)\n`;
      rtlCode += `      count <= ${bits}'d0;\n`;
      if (hasEnable) {
        rtlCode += `    else if (enable)\n`;
        rtlCode += `      count <= count + 1'b1;\n`;
      } else {
        rtlCode += `    else\n`;
        rtlCode += `      count <= count + 1'b1;\n`;
      }
    } else if (hasEnable) {
      rtlCode += `    if (enable)\n`;
      rtlCode += `      count <= count + 1'b1;\n`;
    } else {
      rtlCode += `    count <= count + 1'b1;\n`;
    }
    rtlCode += `  end\n\nendmodule`;
    
    // Generate testbench
    let testbench = `module counter_${bits}bit_tb;\n`;
    testbench += `  reg clk;\n`;
    if (hasReset) testbench += `  reg rst_n;\n`;
    if (hasEnable) testbench += `  reg enable;\n`;
    testbench += `  wire [${bits-1}:0] count;\n\n`;
    
    testbench += `  counter_${bits}bit dut (\n`;
    testbench += `    .clk(clk),\n`;
    if (hasReset) testbench += `    .rst_n(rst_n),\n`;
    if (hasEnable) testbench += `    .enable(enable),\n`;
    testbench += `    .count(count)\n`;
    testbench += `  );\n\n`;
    
    testbench += `  initial begin\n    clk = 0;\n    forever #5 clk = ~clk;\n  end\n\n`;
    
    testbench += `  initial begin\n`;
    if (hasReset) testbench += `    rst_n = 0;\n`;
    if (hasEnable) testbench += `    enable = 0;\n`;
    if (hasReset) testbench += `    #10 rst_n = 1;\n`;
    if (hasEnable) testbench += `    #20 enable = 1;\n    #80 enable = 0;\n    #20 enable = 1;\n`;
    testbench += `    #100 $finish;\n`;
    testbench += `  end\n\n`;
    
    testbench += `  initial begin\n`;
    testbench += `    $monitor("Time: %t, Count: %h", $time, count);\n`;
    testbench += `  end\n`;
    testbench += `endmodule`;
    
    // Description and components
    const description = `A ${bits}-bit binary counter${hasEnable ? ' with enable control' : ''}${hasReset ? ' and synchronous reset' : ''}. ` +
                       `The counter increments by 1 on each positive clock edge${hasEnable ? ' when enable is high' : ''}. ` +
                       `${hasReset ? 'When reset is active (low), the counter is cleared to zero.' : ''}`;
    
    const components = ["Clock"];
    if (hasReset) components.push("Reset");
    if (hasEnable) components.push("Enable");
    components.push(`D Flip-Flops (${bits})`);
    components.push("Incrementer");
    
    return {
      schematic: { nodes, edges },
      rtlCode,
      testbench,
      description,
      components,
    };
  };
  
  // Select an example prompt
  const selectExamplePrompt = (example) => {
    setPrompt(example);
  };

  // Generate traffic light controller design
  const generateTrafficLightDesign = (isIntersection, wayCount) => {
    // Generate schematic
    const nodes = [
      { id: 'clk', label: 'Clock', x: 50, y: 50, type: 'input' },
      { id: 'rst', label: 'Reset', x: 50, y: 100, type: 'input' },
      { id: 'fsm', label: 'Traffic FSM', x: 200, y: 150, type: 'gate' }
    ];
    
    const edges = [
      { from: 'clk', to: 'fsm' },
      { from: 'rst', to: 'fsm' }
    ];
    
    // Add outputs for each traffic light
    for (let i = 0; i < wayCount; i++) {
      const yOffset = 75 + i * 50;
      nodes.push({ id: `red${i}`, label: `Red ${i+1}`, x: 350, y: yOffset, type: 'output' });
      nodes.push({ id: `yellow${i}`, label: `Yellow ${i+1}`, x: 350, y: yOffset+15, type: 'output' });
      nodes.push({ id: `green${i}`, label: `Green ${i+1}`, x: 350, y: yOffset+30, type: 'output' });
      
      edges.push({ from: 'fsm', to: `red${i}` });
      edges.push({ from: 'fsm', to: `yellow${i}` });
      edges.push({ from: 'fsm', to: `green${i}` });
    }
    
    // Generate RTL code for traffic light controller
    let rtlCode = `module traffic_light_controller (\n`;
    rtlCode += `  input wire clk,\n`;
    rtlCode += `  input wire rst_n,\n`;
    
    // Add outputs for each direction
    for (let i = 0; i < wayCount; i++) {
      rtlCode += `  output reg red${i+1},\n`;
      rtlCode += `  output reg yellow${i+1},\n`;
      rtlCode += `  output reg green${i+1}${i < wayCount-1 ? ',' : ''}\n`;
    }
    rtlCode += `);\n\n`;
    
    // State definitions
    rtlCode += `  // State definitions\n`;
    rtlCode += `  localparam [${Math.ceil(Math.log2(wayCount*2))-1}:0]\n`;
    for (let i = 0; i < wayCount; i++) {
      rtlCode += `    STATE_GREEN${i+1} = ${Math.ceil(Math.log2(wayCount*2))}'d${i*2},\n`;
      rtlCode += `    STATE_YELLOW${i+1} = ${Math.ceil(Math.log2(wayCount*2))}'d${i*2+1}${i < wayCount-1 ? ',' : ''};\n`;
    }
    rtlCode += `\n`;
    
    // Timer and state registers
    rtlCode += `  // Timer for state transitions\n`;
    rtlCode += `  reg [7:0] timer;\n`;
    rtlCode += `  reg [${Math.ceil(Math.log2(wayCount*2))-1}:0] state, next_state;\n\n`;
    
    // State transition logic
    rtlCode += `  // State register\n`;
    rtlCode += `  always @(posedge clk or negedge rst_n) begin\n`;
    rtlCode += `    if (~rst_n) begin\n`;
    rtlCode += `      state <= STATE_GREEN1;\n`;
    rtlCode += `      timer <= 8'd0;\n`;
    rtlCode += `    end\n`;
    rtlCode += `    else begin\n`;
    rtlCode += `      if (timer == 8'd100) begin  // Transition after 100 clock cycles\n`;
    rtlCode += `        state <= next_state;\n`;
    rtlCode += `        timer <= 8'd0;\n`;
    rtlCode += `      end\n`;
    rtlCode += `      else\n`;
    rtlCode += `        timer <= timer + 8'd1;\n`;
    rtlCode += `    end\n`;
    rtlCode += `  end\n\n`;
    
    // Next state logic
    rtlCode += `  // Next state logic\n`;
    rtlCode += `  always @(*) begin\n`;
    rtlCode += `    case (state)\n`;
    for (let i = 0; i < wayCount; i++) {
      rtlCode += `      STATE_GREEN${i+1}: next_state = STATE_YELLOW${i+1};\n`;
      rtlCode += `      STATE_YELLOW${i+1}: next_state = STATE_GREEN${(i+1) % wayCount + 1};\n`;
    }
    rtlCode += `      default: next_state = STATE_GREEN1;\n`;
    rtlCode += `    endcase\n`;
    rtlCode += `  end\n\n`;
    
    // Output logic
    rtlCode += `  // Output logic\n`;
    rtlCode += `  always @(*) begin\n`;
    for (let i = 0; i < wayCount; i++) {
      if (i === 0) {
        rtlCode += `    // Default all signals to off\n`;
        for (let j = 0; j < wayCount; j++) {
          rtlCode += `    red${j+1} = 1'b1; yellow${j+1} = 1'b0; green${j+1} = 1'b0;\n`;
        }
        rtlCode += `\n    case (state)\n`;
      }
      rtlCode += `      STATE_GREEN${i+1}: begin\n`;
      rtlCode += `        red${i+1} = 1'b0;\n`;
      rtlCode += `        green${i+1} = 1'b1;\n`;
      rtlCode += `      end\n`;
      rtlCode += `      STATE_YELLOW${i+1}: begin\n`;
      rtlCode += `        red${i+1} = 1'b0;\n`;
      rtlCode += `        yellow${i+1} = 1'b1;\n`;
      rtlCode += `      end\n`;
    }
    rtlCode += `    endcase\n`;
    rtlCode += `  end\n\n`;
    
    rtlCode += `endmodule`;
    
    // Generate testbench
    let testbench = `module traffic_light_controller_tb;\n`;
    testbench += `  reg clk, rst_n;\n`;
    
    for (let i = 0; i < wayCount; i++) {
      testbench += `  wire red${i+1}, yellow${i+1}, green${i+1};\n`;
    }
    testbench += `\n`;
    
    testbench += `  traffic_light_controller dut (\n`;
    testbench += `    .clk(clk),\n`;
    testbench += `    .rst_n(rst_n),\n`;
    
    for (let i = 0; i < wayCount; i++) {
      testbench += `    .red${i+1}(red${i+1}),\n`;
      testbench += `    .yellow${i+1}(yellow${i+1}),\n`;
      testbench += `    .green${i+1}(green${i+1})${i < wayCount-1 ? ',' : ''}\n`;
    }
    testbench += `  );\n\n`;
    
    testbench += `  initial begin\n`;
    testbench += `    clk = 0;\n`;
    testbench += `    forever #5 clk = ~clk;\n`;
    testbench += `  end\n\n`;
    
    testbench += `  initial begin\n`;
    testbench += `    rst_n = 0;\n`;
    testbench += `    #10 rst_n = 1;\n`;
    testbench += `    #2000 $finish;\n`;
    testbench += `  end\n\n`;
    
    testbench += `  initial begin\n`;
    testbench += `    $monitor("Time: %t, State: %d", $time, dut.state);\n`;
    for (let i = 0; i < wayCount; i++) {
      testbench += `    $monitor("Way ${i+1}: R=%b Y=%b G=%b", red${i+1}, yellow${i+1}, green${i+1});\n`;
    }
    testbench += `  end\n`;
    testbench += `endmodule`;
    
    // Description and components
    const description = `A ${wayCount}-way traffic light controller${isIntersection ? ' for an intersection' : ''}. ` +
                       `Uses a finite state machine to cycle through green, yellow, and red states for each direction. ` +
                       `Each state transition occurs after a fixed time period. Only one direction has a green or yellow light at any time, while all other directions have red lights.`;
    
    const components = [
      "Clock",
      "Reset",
      "FSM Controller",
      `Traffic Lights (${wayCount * 3})`,
      "Timer Counter"
    ];
    
    return {
      schematic: { nodes, edges },
      rtlCode,
      testbench,
      description,
      components
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">FPGA Design Generator</h2>
      
      {/* Prompt input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your circuit in natural language
        </label>
        <div className="flex">
          <textarea
            className="form-textarea flex-grow p-3 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="E.g., Design a 4-bit counter with synchronous reset..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <button
            className="ml-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
            onClick={generateDesign}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : "Generate Design"}
          </button>
        </div>
        
        {/* Example prompts */}
        <div className="mt-3">
          <span className="text-xs text-gray-500">Example prompts:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded"
                onClick={() => selectExamplePrompt(example)}
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Generated design output */}
      {generatedDesign && (
        <div className="border border-gray-200 rounded-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('schematic')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'schematic'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Schematic
              </button>
              <button
                onClick={() => setActiveTab('rtl')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'rtl'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                RTL Code
              </button>
              <button
                onClick={() => setActiveTab('testbench')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'testbench'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Testbench
              </button>
              <button
                onClick={() => setActiveTab('explanation')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'explanation'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Explanation
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'schematic' && (
              <div className="h-96">
                <CircuitVisualizer circuitData={generatedDesign.schematic} />
              </div>
            )}
            
            {activeTab === 'rtl' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Verilog Code</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto h-80 text-sm font-mono">
                  {generatedDesign.rtlCode}
                </pre>
                <div className="mt-4 flex justify-end">
                  <button className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded">
                    Copy Code
                  </button>
                  <button className="ml-2 px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded">
                    Download File
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'testbench' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Testbench Code</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto h-80 text-sm font-mono">
                  {generatedDesign.testbench}
                </pre>
                <div className="mt-4 flex justify-end">
                  <button className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded">
                    Copy Code
                  </button>
                  <button className="ml-2 px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded">
                    Download File
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'explanation' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Design Explanation</h3>
                <div className="bg-gray-50 p-4 rounded-md h-80 overflow-auto">
                  <p className="text-sm text-gray-700 mb-4">
                    {generatedDesign.description}
                  </p>
                  
                  <h4 className="font-medium text-gray-700 mb-2">Components Used:</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {generatedDesign.components.map((component, index) => (
                      <li key={index}>{component}</li>
                    ))}
                  </ul>
                  
                  <h4 className="font-medium text-gray-700 mt-4 mb-2">Learning Resources:</h4>
                  <ul className="text-sm text-blue-600">
                    {prompt.toLowerCase().includes('counter') && (
                      <>
                        <li><a href="#" className="hover:underline">Understanding Binary Counters</a></li>
                        <li><a href="#" className="hover:underline">D Flip-Flop Implementation</a></li>
                        <li><a href="#" className="hover:underline">Synchronous vs Asynchronous Reset</a></li>
                      </>
                    )}
                    {prompt.toLowerCase().includes('traffic') && (
                      <>
                        <li><a href="#" className="hover:underline">FSM Design Principles</a></li>
                        <li><a href="#" className="hover:underline">Traffic Light Controller Examples</a></li>
                        <li><a href="#" className="hover:underline">State Machine Verification</a></li>
                      </>
                    )}
                    {prompt.toLowerCase().includes('uart') && (
                      <>
                        <li><a href="#" className="hover:underline">Serial Communication Basics</a></li>
                        <li><a href="#" className="hover:underline">UART Protocol and Timing</a></li>
                        <li><a href="#" className="hover:underline">Baud Rate Calculation</a></li>
                      </>
                    )}
                    {prompt.toLowerCase().includes('alu') && (
                      <>
                        <li><a href="#" className="hover:underline">ALU Design Principles</a></li>
                        <li><a href="#" className="hover:underline">Overflow Detection in Digital Circuits</a></li>
                        <li><a href="#" className="hover:underline">Digital Logic Optimization</a></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FPGADesignGenerator;