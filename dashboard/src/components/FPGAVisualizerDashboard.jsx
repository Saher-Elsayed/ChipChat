import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

const FPGAVisualizerDashboard = () => {
  const [selectedFPGA, setSelectedFPGA] = useState('Artix-7');
  const [selectedDesign, setSelectedDesign] = useState('adder');
  const [viewMode, setViewMode] = useState('utilization');
  const [analysisData, setAnalysisData] = useState(null);

  // FPGA device specifications database
  const fpgaSpecs = {
    'Artix-7': {
      family: 'Xilinx 7-Series',
      part: 'XC7A35T-1CPG236C',
      luts: 20800,
      ffs: 41600,
      brams: 50,
      dsps: 90,
      ios: 210,
      slices: 3300,
      maxFreq: 450,
      powerBase: 150
    },
    'Kintex-7': {
      family: 'Xilinx 7-Series', 
      part: 'XC7K325T-2FFG676C',
      luts: 101440,
      ffs: 202800,
      brams: 445,
      dsps: 240,
      ios: 500,
      slices: 15850,
      maxFreq: 500,
      powerBase: 800
    },
    'Zynq-7020': {
      family: 'Xilinx Zynq',
      part: 'XC7Z020-1CLG484C',
      luts: 53200,
      ffs: 106400,
      brams: 140,
      dsps: 220,
      ios: 200,
      slices: 8150,
      maxFreq: 450,
      powerBase: 400
    },
    'Cyclone-V': {
      family: 'Intel/Altera',
      part: '5CGXFC7C7F23C8',
      luts: 32070,
      ffs: 32070,
      brams: 557,
      dsps: 87,
      ios: 224,
      slices: 12070,
      maxFreq: 400,
      powerBase: 200
    }
  };

  // Sample design data for different components
  const designDatabase = {
    'adder': {
      name: '32-bit Carry Lookahead Adder',
      description: 'Fast parallel adder with carry lookahead logic',
      resources: { luts: 68, ffs: 96, brams: 0, dsps: 0, ios: 67 },
      timing: { maxFreq: 425, criticalPath: 2.35, setupSlack: 0.89, holdSlack: 0.45 },
      power: { static: 15, dynamic: 42, total: 57 },
      complexity: 'medium'
    },
    'multiplier': {
      name: '16x16 Wallace Tree Multiplier',
      description: 'High-speed parallel multiplier using Wallace tree reduction',
      resources: { luts: 245, ffs: 64, brams: 0, dsps: 1, ios: 48 },
      timing: { maxFreq: 380, criticalPath: 2.63, setupSlack: 0.52, holdSlack: 0.38 },
      power: { static: 12, dynamic: 58, total: 70 },
      complexity: 'high'
    },
    'memory': {
      name: '1024x8 Dual Port RAM',
      description: 'Synchronous dual-port memory with independent read/write',
      resources: { luts: 16, ffs: 24, brams: 1, dsps: 0, ios: 35 },
      timing: { maxFreq: 480, criticalPath: 2.08, setupSlack: 1.15, holdSlack: 0.62 },
      power: { static: 22, dynamic: 28, total: 50 },
      complexity: 'low'
    },
    'filter': {
      name: '8-tap FIR Filter',
      description: 'Digital finite impulse response filter with 8 coefficients',
      resources: { luts: 156, ffs: 128, brams: 0, dsps: 4, ios: 25 },
      timing: { maxFreq: 350, criticalPath: 2.86, setupSlack: 0.28, holdSlack: 0.33 },
      power: { static: 18, dynamic: 95, total: 113 },
      complexity: 'high'
    },
    'uart': {
      name: 'UART Controller',
      description: 'Universal asynchronous receiver-transmitter with FIFO',
      resources: { luts: 89, ffs: 156, brams: 0, dsps: 0, ios: 12 },
      timing: { maxFreq: 400, criticalPath: 2.50, setupSlack: 0.75, holdSlack: 0.55 },
      power: { static: 8, dynamic: 18, total: 26 },
      complexity: 'medium'
    }
  };

  useEffect(() => {
    // Simulate analysis calculation
    const designData = designDatabase[selectedDesign];
    const fpgaData = fpgaSpecs[selectedFPGA];
    
    if (designData && fpgaData) {
      const analysis = calculateAnalysis(designData, fpgaData);
      setAnalysisData(analysis);
    }
  }, [selectedFPGA, selectedDesign]);

  const calculateAnalysis = (design, fpga) => {
    // Calculate utilization percentages
    const utilization = {
      luts: (design.resources.luts / fpga.luts) * 100,
      ffs: (design.resources.ffs / fpga.ffs) * 100,
      brams: (design.resources.brams / fpga.brams) * 100,
      dsps: (design.resources.dsps / fpga.dsps) * 100,
      ios: (design.resources.ios / fpga.ios) * 100
    };

    // Calculate overall metrics
    const avgUtilization = (utilization.luts + utilization.ffs + utilization.brams + utilization.dsps) / 4;
    const frequencyRatio = (design.timing.maxFreq / fpga.maxFreq) * 100;
    const powerEfficiency = design.timing.maxFreq / design.power.total;

    return {
      design,
      fpga,
      utilization,
      metrics: {
        avgUtilization: Math.round(avgUtilization * 100) / 100,
        frequencyRatio: Math.round(frequencyRatio * 100) / 100,
        powerEfficiency: Math.round(powerEfficiency * 100) / 100,
        overallScore: Math.round((frequencyRatio + (100 - avgUtilization) + powerEfficiency) / 3)
      }
    };
  };

  const getUtilizationData = () => {
    if (!analysisData) return [];
    
    return [
      { resource: 'LUTs', used: analysisData.design.resources.luts, available: analysisData.fpga.luts, utilization: analysisData.utilization.luts },
      { resource: 'FFs', used: analysisData.design.resources.ffs, available: analysisData.fpga.ffs, utilization: analysisData.utilization.ffs },
      { resource: 'BRAMs', used: analysisData.design.resources.brams, available: analysisData.fpga.brams, utilization: analysisData.utilization.brams },
      { resource: 'DSPs', used: analysisData.design.resources.dsps, available: analysisData.fpga.dsps, utilization: analysisData.utilization.dsps },
      { resource: 'I/Os', used: analysisData.design.resources.ios, available: analysisData.fpga.ios, utilization: analysisData.utilization.ios }
    ];
  };

  const getPerformanceData = () => {
    if (!analysisData) return [];
    
    return [
      { metric: 'Frequency', value: analysisData.metrics.frequencyRatio, fullMark: 100 },
      { metric: 'Resource Efficiency', value: Math.max(0, 100 - analysisData.metrics.avgUtilization), fullMark: 100 },
      { metric: 'Power Efficiency', value: Math.min(100, analysisData.metrics.powerEfficiency * 10), fullMark: 100 },
      { metric: 'Timing Margin', value: (analysisData.design.timing.setupSlack / 2) * 100, fullMark: 100 },
      { metric: 'Overall Score', value: analysisData.metrics.overallScore, fullMark: 100 }
    ];
  };

  const getPowerBreakdown = () => {
    if (!analysisData) return [];
    
    return [
      { name: 'Static Power', value: analysisData.design.power.static, color: '#8884d8' },
      { name: 'Dynamic Power', value: analysisData.design.power.dynamic, color: '#82ca9d' }
    ];
  };

  const getTimingData = () => {
    if (!analysisData) return [];
    
    return [
      { metric: 'Setup Slack', value: analysisData.design.timing.setupSlack, target: 1.0, status: analysisData.design.timing.setupSlack >= 0.5 ? 'good' : 'warning' },
      { metric: 'Hold Slack', value: analysisData.design.timing.holdSlack, target: 0.5, status: analysisData.design.timing.holdSlack >= 0.2 ? 'good' : 'warning' },
      { metric: 'Critical Path', value: analysisData.design.timing.criticalPath, target: 3.0, status: analysisData.design.timing.criticalPath <= 3.0 ? 'good' : 'warning' }
    ];
  };

  const FPGAFloorplan = () => {
    if (!analysisData) return <div className="p-8 text-center text-gray-500">No data available</div>;
    
    const utilizationLevel = analysisData.metrics.avgUtilization;
    
    return (
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">FPGA Floorplan - {selectedFPGA}</h3>
        
        <div className="grid grid-cols-12 gap-1 w-full max-w-lg mx-auto">
          {Array.from({ length: 144 }, (_, i) => {
            const isUsed = Math.random() * 100 < utilizationLevel;
            const blockType = Math.random();
            let blockColor = 'bg-gray-700';
            
            if (isUsed) {
              if (blockType < 0.1 && analysisData.design.resources.dsps > 0) {
                blockColor = 'bg-purple-500'; // DSP blocks
              } else if (blockType < 0.2 && analysisData.design.resources.brams > 0) {
                blockColor = 'bg-yellow-500'; // BRAM blocks
              } else {
                blockColor = 'bg-blue-500'; // Logic blocks
              }
            }
            
            return (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm border border-gray-600 ${blockColor}`}
                title={`Block ${i}: ${isUsed ? 'Used' : 'Available'}`}
              />
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-300">Logic</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span className="text-gray-300">BRAM</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span className="text-gray-300">DSP</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-700 border border-gray-600 rounded mr-2"></div>
            <span className="text-gray-300">Available</span>
          </div>
        </div>
        
        <div className="mt-4 text-center text-gray-300 text-sm">
          <p>Utilization: {analysisData.metrics.avgUtilization.toFixed(1)}%</p>
          <p>Frequency: {analysisData.design.timing.maxFreq} MHz</p>
        </div>
      </div>
    );
  };

  const TimingAnalysisPanel = () => {
    const timingData = getTimingData();
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Timing Analysis</h3>
        
        <div className="space-y-4">
          {timingData.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{item.metric}</span>
                <span className={`${item.status === 'good' ? 'text-green-600' : 'text-orange-600'}`}>
                  {item.value} ns
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.status === 'good' ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (item.value / item.target) * 100)}%`
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Target: {item.target} ns
              </div>
            </div>
          ))}
        </div>
        
        {analysisData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Performance Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Max Frequency:</span>
                <span className="ml-2 font-medium">{analysisData.design.timing.maxFreq} MHz</span>
              </div>
              <div>
                <span className="text-blue-600">Critical Path:</span>
                <span className="ml-2 font-medium">{analysisData.design.timing.criticalPath} ns</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PowerAnalysisPanel = () => {
    const powerData = getPowerBreakdown();
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Power Analysis</h3>
        
        {analysisData && (
          <>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-800">
                {analysisData.design.power.total} mW
              </div>
              <div className="text-sm text-gray-600">Total Power Consumption</div>
              <div className="text-sm text-blue-600 mt-1">
                {analysisData.metrics.powerEfficiency.toFixed(1)} MHz/mW efficiency
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={powerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}mW`}
                >
                  {powerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Static Power:</span>
                <span>{analysisData.design.power.static} mW ({Math.round((analysisData.design.power.static/analysisData.design.power.total)*100)}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Dynamic Power:</span>
                <span>{analysisData.design.power.dynamic} mW ({Math.round((analysisData.design.power.dynamic/analysisData.design.power.total)*100)}%)</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ChipChat FPGA Visualizer
          </h1>
          <p className="text-gray-600">
            Comprehensive FPGA design analysis and resource visualization
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target FPGA</label>
            <select
              value={selectedFPGA}
              onChange={(e) => setSelectedFPGA(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.keys(fpgaSpecs).map(fpga => (
                <option key={fpga} value={fpga}>{fpga}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Design Type</label>
            <select
              value={selectedDesign}
              onChange={(e) => setSelectedDesign(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(designDatabase).map(([key, design]) => (
                <option key={key} value={key}>{design.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="utilization">Resource Utilization</option>
              <option value="floorplan">Floorplan View</option>
              <option value="timing">Timing Analysis</option>
              <option value="power">Power Analysis</option>
            </select>
          </div>
        </div>

        {/* FPGA Info Card */}
        {analysisData && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedFPGA} - {analysisData.fpga.family}
                </h2>
                <p className="text-gray-600">{analysisData.fpga.part}</p>
                <p className="text-sm text-gray-500 mt-1">{analysisData.design.description}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg text-center ${getScoreColor(analysisData.metrics.overallScore)}`}>
                <div className="text-2xl font-bold">{analysisData.metrics.overallScore}</div>
                <div className="text-xs">Overall Score</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisData.fpga.luts.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">LUTs Available</div>
                <div className="text-xs text-blue-500">
                  {analysisData.utilization.luts.toFixed(1)}% used
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysisData.fpga.ffs.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Flip-Flops</div>
                <div className="text-xs text-green-500">
                  {analysisData.utilization.ffs.toFixed(1)}% used
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analysisData.fpga.brams}
                </div>
                <div className="text-sm text-gray-600">BRAMs</div>
                <div className="text-xs text-yellow-500">
                  {analysisData.utilization.brams.toFixed(1)}% used
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analysisData.fpga.dsps}
                </div>
                <div className="text-sm text-gray-600">DSPs</div>
                <div className="text-xs text-purple-500">
                  {analysisData.utilization.dsps.toFixed(1)}% used
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {analysisData.design.timing.maxFreq} MHz
                </div>
                <div className="text-sm text-gray-600">Max Frequency</div>
                <div className="text-xs text-red-500">
                  {analysisData.metrics.frequencyRatio.toFixed(1)}% of max
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Based on View Mode */}
        {viewMode === 'utilization' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Utilization Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getUtilizationData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="resource" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'utilization' ? `${value.toFixed(1)}%` : value,
                      name === 'utilization' ? 'Utilization' : name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="used" fill="#3B82F6" name="used" />
                  <Bar dataKey="utilization" fill="#EF4444" name="utilization" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Radar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
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
        )}

        {viewMode === 'floorplan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FPGAFloorplan />
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Placement Analysis</h3>
              {analysisData && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Logic Resources</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      {analysisData.design.resources.luts} LUTs, {analysisData.design.resources.ffs} FFs
                    </p>
                    <div className="text-xs text-blue-500 mt-1">
                      Utilization: {analysisData.utilization.luts.toFixed(1)}% LUTs, {analysisData.utilization.ffs.toFixed(1)}% FFs
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Memory Resources</h4>
                    <p className="text-sm text-yellow-600 mt-1">
                      {analysisData.design.resources.brams} BRAM blocks allocated
                    </p>
                    <div className="text-xs text-yellow-500 mt-1">
                      {analysisData.utilization.brams.toFixed(1)}% of available BRAMs
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">DSP Resources</h4>
                    <p className="text-sm text-purple-600 mt-1">
                      {analysisData.design.resources.dsps} DSP slices utilized
                    </p>
                    <div className="text-xs text-purple-500 mt-1">
                      {analysisData.utilization.dsps.toFixed(1)}% of available DSPs
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800">Implementation Notes</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Automatic placement and routing</li>
                      <li>• Optimized for timing performance</li>
                      <li>• Resource sharing where possible</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'timing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimingAnalysisPanel />
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Optimization Suggestions</h3>
              {analysisData && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Timing Optimizations</h4>
                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                      <li>• Current frequency: {analysisData.design.timing.maxFreq} MHz</li>
                      <li>• Add pipeline stages for higher performance</li>
                      <li>• Use faster speed grade if needed</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Resource Optimizations</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Consider DSP block usage for arithmetic</li>
                      <li>• Implement resource sharing</li>
                      <li>• Use dedicated routing resources</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Implementation Tips</h4>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Set proper timing constraints</li>
                      <li>• Use appropriate synthesis settings</li>
                      <li>• Consider floorplanning for critical paths</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'power' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PowerAnalysisPanel />
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Power Optimization</h3>
              {analysisData && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Current Efficiency</h4>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {analysisData.metrics.powerEfficiency.toFixed(1)} MHz/mW
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Performance per watt consumed
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800">Power Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Static Power:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{width: `${(analysisData.design.power.static/analysisData.design.power.total)*100}%`}}
                            ></div>
                          </div>
                          <span className="font-medium">{analysisData.design.power.static} mW</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Dynamic Power:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{width: `${(analysisData.design.power.dynamic/analysisData.design.power.total)*100}%`}}
                            ></div>
                          </div>
                          <span className="font-medium">{analysisData.design.power.dynamic} mW</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Power Saving Tips</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Implement clock gating for unused logic</li>
                      <li>• Use lower voltage operation when possible</li>
                      <li>• Optimize switching activity</li>
                      <li>• Consider power islands for large designs</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">Thermal Considerations</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Current power density allows for standard cooling solutions. 
                      Monitor junction temperature during operation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Educational Insights Panel */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Educational Insights</h3>
          {analysisData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Design Understanding</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your {analysisData.design.name.toLowerCase()} uses {analysisData.metrics.avgUtilization.toFixed(1)}% of FPGA resources</li>
                  <li>• This means you could fit approximately {Math.floor(100/Math.max(analysisData.metrics.avgUtilization, 1))} similar designs on this chip</li>
                  <li>• The design achieves {analysisData.design.timing.maxFreq} MHz, which is {analysisData.metrics.frequencyRatio.toFixed(1)}% of the FPGA's maximum</li>
                  <li>• Power efficiency of {analysisData.metrics.powerEfficiency.toFixed(1)} MHz/mW indicates {analysisData.metrics.powerEfficiency > 5 ? 'excellent' : analysisData.metrics.powerEfficiency > 3 ? 'good' : 'moderate'} energy efficiency</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Learning Opportunities</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Try different FPGA devices to see how specifications affect your design</li>
                  <li>• Experiment with design complexity and observe resource scaling</li>
                  <li>• Compare timing vs. area trade-offs across different architectures</li>
                  <li>• Learn about power optimization techniques for battery-powered applications</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 text-left border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="font-medium text-blue-900">Generate RTL</div>
              <div className="text-sm text-blue-600 mt-1">Create Verilog code for this design</div>
            </button>
            
            <button className="p-4 text-left border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <div className="font-medium text-green-900">Export Report</div>
              <div className="text-sm text-green-600 mt-1">Download detailed analysis report</div>
            </button>
            
            <button className="p-4 text-left border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
              <div className="font-medium text-purple-900">Compare FPGAs</div>
              <div className="text-sm text-purple-600 mt-1">Analyze across multiple devices</div>
            </button>
            
            <button className="p-4 text-left border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
              <div className="font-medium text-orange-900">Optimize Design</div>
              <div className="text-sm text-orange-600 mt-1">Get AI-powered suggestions</div>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>ChipChat FPGA Visualizer - Making FPGA design accessible through AI and visualization</p>
          <p className="mt-1">Analysis based on estimated resource usage and timing models</p>
        </div>
      </div>
    </div>
  );
};

export default FPGAVisualizerDashboard;