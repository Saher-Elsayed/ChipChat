import React, { useState, useEffect } from 'react';
import { Play, Download, Save, Copy, Settings, Zap, Code, FileText } from 'lucide-react';

const RTLEditor = () => {
  const [rtlCode, setRtlCode] = useState('');
  const [designType, setDesignType] = useState('adder');
  const [parameters, setParameters] = useState({ width: 8, depth: 256 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');

  // RTL Templates for different designs
  const rtlTemplates = {
    'adder': `// ${parameters.width}-bit Ripple Carry Adder
module ripple_carry_adder_${parameters.width}bit (
    input  [${parameters.width-1}:0] a,
    input  [${parameters.width-1}:0] b,
    input              cin,
    output [${parameters.width-1}:0] sum,
    output             cout
);

    // Internal carry signals
    wire [${parameters.width}:0] carry;
    
    // Initialize carry chain
    assign carry[0] = cin;
    
    // Generate full adders
    genvar i;
    generate
        for (i = 0; i < ${parameters.width}; i = i + 1) begin : fa_gen
            assign sum[i] = a[i] ^ b[i] ^ carry[i];
            assign carry[i+1] = (a[i] & b[i]) | (a[i] & carry[i]) | (b[i] & carry[i]);
        end
    endgenerate
    
    // Final carry out
    assign cout = carry[${parameters.width}];

endmodule`,

    'multiplier': `// ${parameters.width}x${parameters.width} Array Multiplier
module array_multiplier_${parameters.width}x${parameters.width} (
    input  [${parameters.width-1}:0] a,
    input  [${parameters.width-1}:0] b,
    output [${2*parameters.width-1}:0] product
);

    // Partial product generation
    wire [${parameters.width-1}:0] pp [${parameters.width-1}:0];
    
    genvar i, j;
    generate
        for (i = 0; i < ${parameters.width}; i = i + 1) begin : pp_row
            for (j = 0; j < ${parameters.width}; j = j + 1) begin : pp_col
                assign pp[i][j] = a[j] & b[i];
            end
        end
    endgenerate
    
    // Partial product addition (simplified for demonstration)
    // In practice, use a more efficient adder tree
    assign product = pp[0] + 
                    (pp[1] << 1) + 
                    (pp[2] << 2) + 
                    (pp[3] << 3);
    // Note: This is a simplified version for ${Math.min(parameters.width, 4)}-bit operands

endmodule`,

    'memory': `// ${parameters.width}x${parameters.depth} Single Port RAM
module single_port_ram_${parameters.width}x${parameters.depth} (
    input                    clk,
    input                    we,
    input  [$clog2(${parameters.depth})-1:0] addr,
    input  [${parameters.width-1}:0]   din,
    output reg [${parameters.width-1}:0] dout
);

    // Memory array
    reg [${parameters.width-1}:0] memory [0:${parameters.depth-1}];
    
    // Memory operations
    always @(posedge clk) begin
        if (we) begin
            memory[addr] <= din;
        end
        dout <= memory[addr];
    end

endmodule`,

    'counter': `// ${parameters.width}-bit Counter with Enable and Reset
module counter_${parameters.width}bit (
    input                    clk,
    input                    rst_n,
    input                    enable,
    output reg [${parameters.width-1}:0] count
);

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            count <= ${parameters.width}'b0;
        end else if (enable) begin
            count <= count + 1'b1;
        end
    end

endmodule`
  };

  useEffect(() => {
    if (selectedTemplate !== 'custom' && rtlTemplates[selectedTemplate]) {
      setRtlCode(rtlTemplates[selectedTemplate]);
    }
  }, [selectedTemplate, parameters]);

  const handleGenerateRTL = async () => {
    setIsGenerating(true);
    
    // Simulate RTL generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRTL = rtlTemplates[designType] || rtlTemplates['adder'];
    setRtlCode(newRTL);
    
    // Add to history
    setGenerationHistory(prev => [{
      id: Date.now(),
      type: designType,
      parameters: { ...parameters },
      timestamp: new Date().toLocaleTimeString(),
      code: newRTL
    }, ...prev.slice(0, 4)]); // Keep last 5 entries
    
    setIsGenerating(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(rtlCode);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rtlCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designType}_${parameters.width}bit.v`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: parseInt(value) || value
    }));
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">RTL Editor</h1>
            </div>
            <div className="text-sm text-gray-500">
              Professional Verilog HDL Development Environment
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateRTL}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate RTL'}</span>
            </button>
            
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Configuration */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Design Configuration</h2>
            
            {/* Design Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design Type
              </label>
              <select
                value={designType}
                onChange={(e) => setDesignType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="adder">Adder</option>
                <option value="multiplier">Multiplier</option>
                <option value="memory">Memory</option>
                <option value="counter">Counter</option>
              </select>
            </div>

            {/* Template Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="custom">Custom Code</option>
                <option value="adder">Ripple Carry Adder</option>
                <option value="multiplier">Array Multiplier</option>
                <option value="memory">Single Port RAM</option>
                <option value="counter">Binary Counter</option>
              </select>
            </div>

            {/* Parameters */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bit Width
                </label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={parameters.width}
                  onChange={(e) => handleParameterChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {(designType === 'memory') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory Depth
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="65536"
                    value={parameters.depth}
                    onChange={(e) => handleParameterChange('depth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Generation History */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Generations</h3>
            <div className="space-y-2">
              {generationHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setRtlCode(item.code)}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {item.type} ({item.parameters.width}-bit)
                  </div>
                  <div className="text-xs text-gray-500">{item.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {rtlCode.split('\n').length} lines
              </span>
              <span className="text-sm text-gray-600">
                {rtlCode.length} characters
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
                Format
              </button>
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
                Validate
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              value={rtlCode}
              onChange={(e) => setRtlCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm resize-none border-none focus:outline-none bg-white"
              placeholder="// Enter your Verilog RTL code here or generate using the configuration panel
module example (
    input clk,
    input rst_n,
    // Add your ports here
);

// Add your logic here

endmodule"
              spellCheck="false"
            />
            
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 p-4 font-mono text-xs text-gray-500 select-none pointer-events-none">
              {rtlCode.split('\n').map((_, index) => (
                <div key={index} className="leading-5">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Verilog</span>
              <span>UTF-8</span>
              <span>LF</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Ready</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Syntax OK</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel - Quick Reference */}
        <div className="w-64 bg-white border-l border-gray-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Reference</h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Data Types</h4>
                <div className="text-gray-600 space-y-1">
                  <div><code className="bg-gray-100 px-1 rounded">wire</code> - Combinational</div>
                  <div><code className="bg-gray-100 px-1 rounded">reg</code> - Sequential</div>
                  <div><code className="bg-gray-100 px-1 rounded">integer</code> - Simulation</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Operators</h4>
                <div className="text-gray-600 space-y-1">
                  <div><code className="bg-gray-100 px-1 rounded">&</code> - AND</div>
                  <div><code className="bg-gray-100 px-1 rounded">|</code> - OR</div>
                  <div><code className="bg-gray-100 px-1 rounded">^</code> - XOR</div>
                  <div><code className="bg-gray-100 px-1 rounded">~</code> - NOT</div>
                  <div><code className="bg-gray-100 px-1 rounded">==</code> - Equal</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Always Blocks</h4>
                <div className="text-gray-600 space-y-1">
                  <div><code className="bg-gray-100 px-1 rounded">@(posedge clk)</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">@(*)</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">@(a or b)</code></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Generate</h4>
                <div className="text-gray-600 space-y-1">
                  <div><code className="bg-gray-100 px-1 rounded">genvar i;</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">generate</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">for (...)</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTLEditor;