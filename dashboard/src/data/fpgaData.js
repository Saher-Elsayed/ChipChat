// FPGA Component Library Data
export const fpgaComponents = [
  {
    id: 1,
    name: "Basic Logic Gates",
    components: [
      { id: "and", name: "AND Gate", description: "Basic AND logic gate", complexity: 1 },
      { id: "or", name: "OR Gate", description: "Basic OR logic gate", complexity: 1 },
      { id: "not", name: "NOT Gate", description: "Basic NOT logic gate (inverter)", complexity: 1 },
      { id: "nand", name: "NAND Gate", description: "NAND logic gate", complexity: 1 },
      { id: "nor", name: "NOR Gate", description: "NOR logic gate", complexity: 1 },
      { id: "xor", name: "XOR Gate", description: "Exclusive OR gate", complexity: 2 },
      { id: "xnor", name: "XNOR Gate", description: "Exclusive NOR gate", complexity: 2 }
    ]
  },
  {
    id: 2,
    name: "Sequential Logic",
    components: [
      { id: "dff", name: "D Flip-Flop", description: "D-type flip-flop", complexity: 3 },
      { id: "jkff", name: "JK Flip-Flop", description: "JK-type flip-flop", complexity: 3 },
      { id: "tff", name: "T Flip-Flop", description: "Toggle flip-flop", complexity: 3 },
      { id: "sr_latch", name: "SR Latch", description: "Set-Reset latch", complexity: 2 },
      { id: "register", name: "Register", description: "N-bit register", complexity: 4 },
      { id: "counter", name: "Counter", description: "N-bit counter", complexity: 5 }
    ]
  },
  {
    id: 3,
    name: "Arithmetic Units",
    components: [
      { id: "half_adder", name: "Half Adder", description: "1-bit adder without carry-in", complexity: 2 },
      { id: "full_adder", name: "Full Adder", description: "1-bit adder with carry-in", complexity: 3 },
      { id: "alu", name: "ALU", description: "Arithmetic Logic Unit", complexity: 7 },
      { id: "multiplier", name: "Multiplier", description: "Binary multiplier", complexity: 6 },
      { id: "divider", name: "Divider", description: "Binary divider", complexity: 8 }
    ]
  },
  {
    id: 4,
    name: "Memory Elements",
    components: [
      { id: "ram", name: "RAM", description: "Random Access Memory", complexity: 8 },
      { id: "rom", name: "ROM", description: "Read-Only Memory", complexity: 6 },
      { id: "fifo", name: "FIFO", description: "First-In-First-Out buffer", complexity: 6 },
      { id: "lifo", name: "LIFO", description: "Last-In-First-Out buffer (Stack)", complexity: 5 }
    ]
  },
  {
    id: 5,
    name: "Interface Components",
    components: [
      { id: "uart", name: "UART", description: "Universal Asynchronous Receiver/Transmitter", complexity: 7 },
      { id: "spi", name: "SPI", description: "Serial Peripheral Interface", complexity: 6 },
      { id: "i2c", name: "I2C", description: "Inter-Integrated Circuit bus", complexity: 6 },
      { id: "ps2", name: "PS/2", description: "PS/2 Interface for keyboard/mouse", complexity: 5 },
      { id: "vga", name: "VGA", description: "Video Graphics Array controller", complexity: 8 }
    ]
  }
];

// Sample generated designs
export const recentDesigns = [
  {
    id: "design1",
    name: "4-bit Counter with Display",
    description: "A 4-bit counter with 7-segment display output",
    date: "2025-07-15",
    complexity: "Medium",
    thumbnail: "counter_design"
  },
  {
    id: "design2",
    name: "UART Communication Module",
    description: "Serial communication interface with buffer",
    date: "2025-07-10",
    complexity: "High",
    thumbnail: "uart_design"
  },
  {
    id: "design3",
    name: "Traffic Light Controller",
    description: "FSM-based traffic light controller system",
    date: "2025-07-05",
    complexity: "Medium",
    thumbnail: "traffic_design"
  },
  {
    id: "design4",
    name: "Simple CPU Design",
    description: "Basic CPU with ALU, register file and control unit",
    date: "2025-06-28",
    complexity: "Very High",
    thumbnail: "cpu_design"
  }
];

// Sample metrics for dashboard
export const designMetrics = [
  {
    title: "Generated Designs",
    value: "24",
    change: "+6",
    trend: "up",
    icon: {
      path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      bgColor: "bg-indigo-500"
    }
  },
  {
    title: "Components Used",
    value: "142",
    change: "+28",
    trend: "up",
    icon: {
      path: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      bgColor: "bg-green-500"
    }
  },
  {
    title: "Simulation Accuracy",
    value: "98.2%",
    change: "+2.4%",
    trend: "up",
    icon: {
      path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      bgColor: "bg-blue-500"
    }
  },
  {
    title: "Learning Progress",
    value: "67%",
    change: "+5%",
    trend: "up",
    icon: {
      path: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      bgColor: "bg-purple-500"
    }
  }
];

// Complexity Distribution Data for Charts
export const complexityData = [
  { name: 'Simple', value: 35 },
  { name: 'Medium', value: 45 },
  { name: 'Complex', value: 15 },
  { name: 'Very Complex', value: 5 },
];

// Resource Usage Data for Charts
export const resourceUsageData = [
  { name: 'LUTs', used: 1420, total: 5000 },
  { name: 'FFs', used: 870, total: 5000 },
  { name: 'DSPs', used: 12, total: 80 },
  { name: 'BRAMs', used: 6, total: 60 },
];

// Weekly Generation Activity
export const activityData = [
  { day: 'Mon', designs: 3, components: 12 },
  { day: 'Tue', designs: 5, components: 25 },
  { day: 'Wed', designs: 2, components: 8 },
  { day: 'Thu', designs: 7, components: 32 },
  { day: 'Fri', designs: 4, components: 18 },
  { day: 'Sat', designs: 2, components: 7 },
  { day: 'Sun', designs: 1, components: 3 },
];

// Sample RTL Code Output
export const sampleVerilogCode = `
module counter_4bit (
  input wire clk,
  input wire rst_n,
  output reg [3:0] count
);

  always @(posedge clk or negedge rst_n) begin
    if (~rst_n)
      count <= 4'b0000;
    else
      count <= count + 1'b1;
  end

endmodule
`;

// Learning progression tracking
export const learningProgressData = [
  { topic: 'Basic Logic', progress: 100 },
  { topic: 'Sequential Logic', progress: 85 },
  { topic: 'FSM Design', progress: 70 },
  { topic: 'Memory Interfaces', progress: 60 },
  { topic: 'Arithmetic Units', progress: 45 },
  { topic: 'SoC Design', progress: 25 },
];

// Circuit diagram placeholder - in a real app these would be SVG paths
export const circuitDiagramElements = {
  nodes: [
    { id: 'n1', label: 'Input A', x: 50, y: 100, type: 'input' },
    { id: 'n2', label: 'Input B', x: 50, y: 200, type: 'input' },
    { id: 'n3', label: 'AND Gate', x: 200, y: 150, type: 'gate' },
    { id: 'n4', label: 'Output Y', x: 350, y: 150, type: 'output' },
  ],
  edges: [
    { from: 'n1', to: 'n3' },
    { from: 'n2', to: 'n3' },
    { from: 'n3', to: 'n4' },
  ]
};