// Generate ALU design
const generateALUDesign = (bitWidth, hasLogical, hasShift) => {
  // Generate schematic nodes and edges
  const nodes = [
    { id: 'clk', label: 'Clock', x: 50, y: 50, type: 'input' },
    { id: 'a', label: `A[${bitWidth-1}:0]`, x: 50, y: 100, type: 'input' },
    { id: 'b', label: `B[${bitWidth-1}:0]`, x: 50, y: 150, type: 'input' },
    { id: 'op', label: 'Op[2:0]', x: 50, y: 200, type: 'input' },
    { id: 'alu', label: 'ALU', x: 200, y: 150, type: 'gate' },
    { id: 'result', label: `Result[${bitWidth-1}:0]`, x: 350, y: 130, type: 'output' },
    { id: 'zero', label: 'Zero', x: 350, y: 170, type: 'output' },
    { id: 'overflow', label: 'Overflow', x: 350, y: 210, type: 'output' }
  ];
  
  const edges = [
    { from: 'a', to: 'alu' },
    { from: 'b', to: 'alu' },
    { from: 'op', to: 'alu' },
    { from: 'clk', to: 'alu' },
    { from: 'alu', to: 'result' },
    { from: 'alu', to: 'zero' },
    { from: 'alu', to: 'overflow' }
  ];
  
  // Generate RTL code for ALU
  let rtlCode = `module alu #(\n`;
  rtlCode += `  parameter WIDTH = ${bitWidth}\n`;
  rtlCode += `) (\n`;
  rtlCode += `  input wire clk,\n`;
  rtlCode += `  input wire [WIDTH-1:0] a,\n`;
  rtlCode += `  input wire [WIDTH-1:0] b,\n`;
  rtlCode += `  input wire [2:0] op,\n`;
  rtlCode += `  output reg [WIDTH-1:0] result,\n`;
  rtlCode += `  output wire zero,\n`;
  rtlCode += `  output reg overflow\n`;
  rtlCode += `);\n\n`;
  
  rtlCode += `  // Operation codes\n`;
  rtlCode += `  localparam ADD = 3'b000,\n`;
  rtlCode += `             SUB = 3'b001,\n`;
  
  if (hasLogical) {
    rtlCode += `             AND = 3'b010,\n`;
    rtlCode += `             OR  = 3'b011,\n`;
    rtlCode += `             XOR = 3'b100,\n`;
  }
  
  if (hasShift) {
    rtlCode += `             SLL = 3'b${hasLogical ? '101' : '010'},\n`;  // Shift left logical
    rtlCode += `             SRL = 3'b${hasLogical ? '110' : '011'};\n`;  // Shift right logical
  } else {
    rtlCode = rtlCode.slice(0, -2) + `;\n`;  // Remove trailing comma
  }
  
  rtlCode += `\n  // Zero flag\n`;
  rtlCode += `  assign zero = (result == {WIDTH{1'b0}});\n\n`;
  
  rtlCode += `  // ALU operation\n`;
  rtlCode += `  always @(posedge clk) begin\n`;
  rtlCode += `    overflow <= 1'b0; // Default: no overflow\n\n`;
  rtlCode += `    case (op)\n`;
  rtlCode += `      ADD: begin\n`;
  rtlCode += `        {overflow, result} <= a + b;\n`;  // Detect overflow by capturing carry
  rtlCode += `      end\n\n`;
  
  rtlCode += `      SUB: begin\n`;
  rtlCode += `        result <= a - b;\n`;
  rtlCode += `        // Overflow occurs when subtracting a negative from a positive gives a negative,\n`;
  rtlCode += `        // or subtracting a positive from a negative gives a positive\n`;
  rtlCode += `        overflow <= (a[WIDTH-1] != b[WIDTH-1]) && (result[WIDTH-1] != a[WIDTH-1]);\n`;
  rtlCode += `      end\n\n`;
  
  if (hasLogical) {
    rtlCode += `      AND: begin\n`;
    rtlCode += `        result <= a & b;\n`;
    rtlCode += `      end\n\n`;
    
    rtlCode += `      OR: begin\n`;
    rtlCode += `        result <= a | b;\n`;
    rtlCode += `      end\n\n`;
    
    rtlCode += `      XOR: begin\n`;
    rtlCode += `        result <= a ^ b;\n`;
    rtlCode += `      end\n\n`;
  }
  
  if (hasShift) {
    rtlCode += `      SLL: begin\n`;
    rtlCode += `        result <= a << b[${Math.min(4, bitWidth-1)}:0];\n`;
    rtlCode += `      end\n\n`;
    
    rtlCode += `      SRL: begin\n`;
    rtlCode += `        result <= a >> b[${Math.min(4, bitWidth-1)}:0];\n`;
    rtlCode += `      end\n\n`;
  }
  
  rtlCode += `      default: begin\n`;
  rtlCode += `        result <= {WIDTH{1'b0}};\n`;
  rtlCode += `      end\n`;
  rtlCode += `    endcase\n`;
  rtlCode += `  end\n\n`;
  
  rtlCode += `endmodule`;
  
  // Generate testbench
  let testbench = `module alu_tb;\n`;
  testbench += `  parameter WIDTH = ${bitWidth};\n\n`;
  testbench += `  reg clk;\n`;
  testbench += `  reg [WIDTH-1:0] a, b;\n`;
  testbench += `  reg [2:0] op;\n`;
  testbench += `  wire [WIDTH-1:0] result;\n`;
  testbench += `  wire zero, overflow;\n\n`;
  
  testbench += `  // Instantiate ALU\n`;
  testbench += `  alu #(.WIDTH(WIDTH)) dut (\n`;
  testbench += `    .clk(clk),\n`;
  testbench += `    .a(a),\n`;
  testbench += `    .b(b),\n`;
  testbench += `    .op(op),\n`;
  testbench += `    .result(result),\n`;
  testbench += `    .zero(zero),\n`;
  testbench += `    .overflow(overflow)\n`;
  testbench += `  );\n\n`;
  
  testbench += `  // Clock generation\n`;
  testbench += `  initial begin\n`;
  testbench += `    clk = 0;\n`;
  testbench += `    forever #5 clk = ~clk;\n`;
  testbench += `  end\n\n`;
  
  testbench += `  // Test vectors\n`;
  testbench += `  initial begin\n`;
  testbench += `    $monitor("Time: %t, Op: %d, A: %h, B: %h, Result: %h, Zero: %b, Overflow: %b", \n`;
  testbench += `             $time, op, a, b, result, zero, overflow);\n\n`;
  
  testbench += `    // Test addition\n`;
  testbench += `    a = ${bitWidth}'h5; b = ${bitWidth}'h3; op = 3'b000; #10;\n`;
  testbench += `    // Test overflow in addition\n`;
  testbench += `    a = ${bitWidth}'h7FFF; b = ${bitWidth}'h7FFF; op = 3'b000; #10;\n\n`;
  
  testbench += `    // Test subtraction\n`;
  testbench += `    a = ${bitWidth}'hA; b = ${bitWidth}'h3; op = 3'b001; #10;\n`;
  testbench += `    // Test borrow in subtraction\n`;
  testbench += `    a = ${bitWidth}'h3; b = ${bitWidth}'hA; op = 3'b001; #10;\n\n`;
  
  if (hasLogical) {
    testbench += `    // Test logical operations\n`;
    testbench += `    a = ${bitWidth}'hF0; b = ${bitWidth}'h0F; op = 3'b010; #10; // AND\n`;
    testbench += `    a = ${bitWidth}'hF0; b = ${bitWidth}'h0F; op = 3'b011; #10; // OR\n`;
    testbench += `    a = ${bitWidth}'hF0; b = ${bitWidth}'h0F; op = 3'b100; #10; // XOR\n\n`;
  }
  
  if (hasShift) {
    testbench += `    // Test shift operations\n`;
    const shiftOp1 = hasLogical ? '101' : '010';
    const shiftOp2 = hasLogical ? '110' : '011';
    testbench += `    a = ${bitWidth}'h0004; b = ${bitWidth}'h0002; op = 3'b${shiftOp1}; #10; // Shift left\n`;
    testbench += `    a = ${bitWidth}'h0010; b = ${bitWidth}'h0002; op = 3'b${shiftOp2}; #10; // Shift right\n\n`;
  }
  
  testbench += `    // Test zero flag\n`;
  testbench += `    a = ${bitWidth}'h0; b = ${bitWidth}'h0; op = 3'b000; #10;\n\n`;
  
  testbench += `    // End simulation\n`;
  testbench += `    #10 $finish;\n`;
  testbench += `  end\n`;
  testbench += `endmodule`;
  
  // Description and components
  let description = `A ${bitWidth}-bit Arithmetic Logic Unit (ALU) that performs basic operations including addition and subtraction`;
  if (hasLogical) description += `, logical operations (AND, OR, XOR)`;
  if (hasShift) description += `, and shift operations (left and right)`;
  description += `. The ALU detects overflow conditions and has a zero flag that indicates when the result is zero.`;
  
  const components = [
    "Clock",
    `${bitWidth}-bit Adder/Subtractor`,
    "Overflow Detection Logic",
    "Zero Flag Logic"
  ];
  
  if (hasLogical) {
    components.push("Logical Operations Unit (AND, OR, XOR)");
  }
  
  if (hasShift) {
    components.push("Barrel Shifter");
  }
  
  components.push("Operation Decoder");
  
  return {
    schematic: { nodes, edges },
    rtlCode,
    testbench,
    description,
    components
  };
};

export default generateALUDesign;