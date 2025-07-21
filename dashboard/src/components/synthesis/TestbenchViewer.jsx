import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Download, Settings, FileText, CheckCircle, AlertCircle, BarChart3, Zap } from 'lucide-react';

const TestbenchViewer = () => {
  const [testbenchCode, setTestbenchCode] = useState('');
  const [simulationState, setSimulationState] = useState('idle'); // idle, running, paused, completed
  const [testResults, setTestResults] = useState(null);
  const [selectedTab, setSelectedTab] = useState('testbench');
  const [waveformData, setWaveformData] = useState([]);
  const [coverageData, setCoverageData] = useState(null);

  // Sample testbench template
  const defaultTestbench = `\`timescale 1ns/1ps

module tb_example_design;

    // Testbench signals
    reg clk;
    reg rst_n;
    reg [7:0] a, b;
    reg cin;
    wire [7:0] sum;
    wire cout;
    
    // Test control
    integer test_count = 0;
    integer pass_count = 0;
    integer fail_count = 0;
    
    // DUT instantiation
    example_design dut (
        .clk(clk),
        .rst_n(rst_n),
        .a(a),
        .b(b),
        .cin(cin),
        .sum(sum),
        .cout(cout)
    );
    
    // Clock generation
    initial begin
        clk = 0;
        forever #5 clk = ~clk; // 100MHz clock
    end
    
    // Reset sequence
    initial begin
        rst_n = 0;
        #100 rst_n = 1;
    end
    
    // Test sequence
    initial begin
        // Initialize signals
        a = 0; b = 0; cin = 0;
        
        // Wait for reset
        wait(rst_n);
        repeat(10) @(posedge clk);
        
        // Test cases
        run_directed_tests();
        run_random_tests();
        
        // Final report
        $display("\\n=== Test Summary ===");
        $display("Total tests: %0d", test_count);
        $display("Passed: %0d", pass_count);
        $display("Failed: %0d", fail_count);
        $display("Pass rate: %0.1f%%", (pass_count * 100.0) / test_count);
        
        $finish;
    end
    
    // Directed test cases
    task run_directed_tests;
        begin
            $display("\\n=== Directed Tests ===");
            
            // Test 1: Basic addition
            test_case(8'h00, 8'h00, 1'b0, "Zero addition");
            test_case(8'h01, 8'h01, 1'b0, "Simple addition");
            test_case(8'hFF, 8'h01, 1'b0, "Overflow test");
            test_case(8'hFF, 8'hFF, 1'b1, "Maximum values");
            
            $display("Directed tests completed");
        end
    endtask
    
    // Random test cases
    task run_random_tests;
        integer i;
        begin
            $display("\\n=== Random Tests ===");
            
            for (i = 0; i < 1000; i = i + 1) begin
                test_case($random, $random, $random, $sformatf("Random test %0d", i));
            end
            
            $display("Random tests completed");
        end
    endtask
    
    // Test case execution
    task test_case;
        input [7:0] test_a, test_b;
        input test_cin;
        input string test_name;
        
        reg [8:0] expected;
        reg [8:0] actual;
        
        begin
            a = test_a;
            b = test_b;
            cin = test_cin;
            
            // Wait for computation
            @(posedge clk);
            #1; // Small delay for signal propagation
            
            expected = test_a + test_b + test_cin;
            actual = {cout, sum};
            
            test_count = test_count + 1;
            
            if (actual === expected) begin
                pass_count = pass_count + 1;
                $display("PASS: %s - a=%h, b=%h, cin=%b, result=%h", 
                        test_name, test_a, test_b, test_cin, actual);
            end else begin
                fail_count = fail_count + 1;
                $error("FAIL: %s - a=%h, b=%h, cin=%b, expected=%h, got=%h", 
                       test_name, test_a, test_b, test_cin, expected, actual);
            end
        end
    endtask
    
    // Waveform dumping
    initial begin
        $dumpfile("simulation.vcd");
        $dumpvars(0, tb_example_design);
    end

endmodule`;

  // Sample test results
  const sampleResults = {
    summary: {
      total_tests: 1004,
      passed: 1002,
      failed: 2,
      pass_rate: 99.8,
      simulation_time: "2.5s",
      start_time: "14:32:15",
      end_time: "14:32:17"
    },
    categories: [
      { name: "Directed Tests", total: 4, passed: 4, failed: 0 },
      { name: "Random Tests", total: 1000, passed: 998, failed: 2 },
      { name: "Corner Cases", total: 0, passed: 0, failed: 0 }
    ],
    failures: [
      {
        test_name: "Random test 456",
        expected: "0x101",
        actual: "0x100",
        inputs: "a=0xFF, b=0x01, cin=1",
        line: 67
      },
      {
        test_name: "Random test 789", 
        expected: "0x1FE",
        actual: "0x1FF",
        inputs: "a=0xFF, b=0xFF, cin=0",
        line: 67
      }
    ]
  };

  // Sample coverage data
  const sampleCoverage = {
    functional: {
      overall: 94.5,
      categories: [
        { name: "Input Combinations", coverage: 98.2 },
        { name: "Output Ranges", coverage: 95.7 },
        { name: "Carry Propagation", coverage: 89.3 },
        { name: "Overflow Conditions", coverage: 92.1 }
      ]
    },
    code: {
      overall: 87.3,
      categories: [
        { name: "Statement Coverage", coverage: 95.6 },
        { name: "Branch Coverage", coverage: 89.2 },
        { name: "Condition Coverage", coverage: 78.9 },
        { name: "Toggle Coverage", coverage: 85.4 }
      ]
    }
  };

  // Sample waveform data
  const generateWaveformData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        time: i * 10,
        clk: i % 2,
        rst_n: i > 10 ? 1 : 0,
        a: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
        cin: Math.random() > 0.5 ? 1 : 0,
        sum: Math.floor(Math.random() * 256),
        cout: Math.random() > 0.8 ? 1 : 0
      });
    }
    return data;
  };

  useEffect(() => {
    setTestbenchCode(defaultTestbench);
    setWaveformData(generateWaveformData());
  }, []);

  const handleRunSimulation = async () => {
    setSimulationState('running');
    setTestResults(null);
    setCoverageData(null);
    
    // Simulate compilation and execution time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setTestResults(sampleResults);
    setCoverageData(sampleCoverage);
    setSimulationState('completed');
  };

  const handlePauseSimulation = () => {
    setSimulationState('paused');
  };

  const handleStopSimulation = () => {
    setSimulationState('idle');
    setTestResults(null);
  };

  const WaveformViewer = () => (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Signal Waveforms</h3>
      <div className="bg-black p-4 rounded font-mono text-sm overflow-x-auto">
        <div className="text-green-400 mb-2">Time (ns) | clk | rst_n | a[7:0] | b[7:0] | cin | sum[7:0] | cout</div>
        {waveformData.slice(0, 20).map((sample, idx) => (
          <div key={idx} className="text-gray-300">
            {`${sample.time.toString().padStart(8)} |  ${sample.clk}  |   ${sample.rst_n}   | 0x${sample.a.toString(16).padStart(2, '0').toUpperCase()} | 0x${sample.b.toString(16).padStart(2, '0').toUpperCase()} |  ${sample.cin}  |  0x${sample.sum.toString(16).padStart(2, '0').toUpperCase()}  |   ${sample.cout}`}
          </div>
        ))}
        <div className="text-yellow-400 mt-2">... (showing first 20 of {waveformData.length} samples)</div>
      </div>
    </div>
  );

  const TestResultsPanel = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold">{testResults?.summary.total_tests}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-green-600">{testResults?.summary.passed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{testResults?.summary.failed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">