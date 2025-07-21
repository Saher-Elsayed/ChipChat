// Generate UART design
const generateUARTDesign = (isReceiver, isTransmitter, dataBits, stopBits) => {
  // If neither is specified, assume both
  const isBoth = !isReceiver && !isTransmitter;
  
  // Generate schematic
  const nodes = [
    { id: 'clk', label: 'Clock', x: 50, y: 50, type: 'input' },
    { id: 'rst', label: 'Reset', x: 50, y: 100, type: 'input' }
  ];
  
  const edges = [];
  
  if (isReceiver || isBoth) {
    nodes.push({ id: 'rx', label: 'RX', x: 50, y: 150, type: 'input' });
    nodes.push({ id: 'uart_rx', label: 'UART RX', x: 200, y: 150, type: 'gate' });
    nodes.push({ id: 'rx_data', label: `Data[${dataBits-1}:0]`, x: 350, y: 130, type: 'output' });
    nodes.push({ id: 'rx_valid', label: 'Data Valid', x: 350, y: 170, type: 'output' });
    
    edges.push({ from: 'clk', to: 'uart_rx' });
    edges.push({ from: 'rst', to: 'uart_rx' });
    edges.push({ from: 'rx', to: 'uart_rx' });
    edges.push({ from: 'uart_rx', to: 'rx_data' });
    edges.push({ from: 'uart_rx', to: 'rx_valid' });
  }
  
  if (isTransmitter || isBoth) {
    const yOffset = isReceiver ? 100 : 0;
    nodes.push({ id: 'tx_data', label: `Data[${dataBits-1}:0]`, x: 50, y: 200 + yOffset, type: 'input' });
    nodes.push({ id: 'tx_start', label: 'Start TX', x: 50, y: 250 + yOffset, type: 'input' });
    nodes.push({ id: 'uart_tx', label: 'UART TX', x: 200, y: 225 + yOffset, type: 'gate' });
    nodes.push({ id: 'tx', label: 'TX', x: 350, y: 225 + yOffset, type: 'output' });
    nodes.push({ id: 'tx_busy', label: 'TX Busy', x: 350, y: 275 + yOffset, type: 'output' });
    
    edges.push({ from: 'clk', to: 'uart_tx' });
    edges.push({ from: 'rst', to: 'uart_tx' });
    edges.push({ from: 'tx_data', to: 'uart_tx' });
    edges.push({ from: 'tx_start', to: 'uart_tx' });
    edges.push({ from: 'uart_tx', to: 'tx' });
    edges.push({ from: 'uart_tx', to: 'tx_busy' });
  }
  
  // Generate RTL code for UART
  let moduleType = isReceiver ? "uart_receiver" : isTransmitter ? "uart_transmitter" : "uart";
  let rtlCode = `module ${moduleType} #(\n`;
  rtlCode += `  parameter CLOCK_FREQ = 50000000, // 50 MHz\n`;
  rtlCode += `  parameter BAUD_RATE = 9600,\n`;
  rtlCode += `  parameter DATA_BITS = ${dataBits},\n`;
  rtlCode += `  parameter STOP_BITS = ${stopBits}\n`;
  rtlCode += `) (\n`;
  rtlCode += `  input wire clk,\n`;
  rtlCode += `  input wire rst_n,\n`;
  
  if (isReceiver || isBoth) {
    rtlCode += `  input wire rx,\n`;
    rtlCode += `  output reg [${dataBits-1}:0] rx_data,\n`;
    rtlCode += `  output reg rx_data_valid,\n`;
  }
  
  if (isTransmitter || isBoth) {
    rtlCode += `  input wire [${dataBits-1}:0] tx_data,\n`;
    rtlCode += `  input wire tx_start,\n`;
    rtlCode += `  output reg tx,\n`;
    rtlCode += `  output reg tx_busy${isReceiver && isTransmitter ? ',' : ''}\n`;
  }
  
  rtlCode += `);\n\n`;
  
  rtlCode += `  // Calculate the number of clock cycles per bit\n`;
  rtlCode += `  localparam CYCLES_PER_BIT = CLOCK_FREQ / BAUD_RATE;\n\n`;
  
  if (isReceiver || isBoth) {
    rtlCode += `  // RX state machine states\n`;
    rtlCode += `  localparam RX_IDLE = 0,\n`;
    rtlCode += `             RX_START = 1,\n`;
    rtlCode += `             RX_DATA = 2,\n`;
    rtlCode += `             RX_STOP = 3;\n\n`;
    
    rtlCode += `  reg [1:0] rx_state;\n`;
    rtlCode += `  reg [15:0] rx_clock_count;\n`;
    rtlCode += `  reg [2:0] rx_bit_index;\n\n`;
    
    rtlCode += `  // RX state machine\n`;
    rtlCode += `  always @(posedge clk or negedge rst_n) begin\n`;
    rtlCode += `    if (~rst_n) begin\n`;
    rtlCode += `      rx_state <= RX_IDLE;\n`;
    rtlCode += `      rx_clock_count <= 0;\n`;
    rtlCode += `      rx_bit_index <= 0;\n`;
    rtlCode += `      rx_data <= 0;\n`;
    rtlCode += `      rx_data_valid <= 0;\n`;
    rtlCode += `    end else begin\n`;
    rtlCode += `      case (rx_state)\n`;
    rtlCode += `        RX_IDLE: begin\n`;
    rtlCode += `          rx_data_valid <= 0;\n`;
    rtlCode += `          rx_clock_count <= 0;\n`;
    rtlCode += `          rx_bit_index <= 0;\n`;
    rtlCode += `          if (rx == 1'b0) // Start bit detected\n`;
    rtlCode += `            rx_state <= RX_START;\n`;
    rtlCode += `        end\n\n`;
    
    rtlCode += `        RX_START: begin\n`;
    rtlCode += `          if (rx_clock_count == CYCLES_PER_BIT / 2) begin\n`;
    rtlCode += `            if (rx == 1'b0) begin // Confirm it's still low\n`;
    rtlCode += `              rx_clock_count <= 0;\n`;
    rtlCode += `              rx_state <= RX_DATA;\n`;
    rtlCode += `            end else\n`;
    rtlCode += `              rx_state <= RX_IDLE;\n`;
    rtlCode += `          end else\n`;
    rtlCode += `            rx_clock_count <= rx_clock_count + 1;\n`;
    rtlCode += `        end\n\n`;
    
    rtlCode += `        RX_DATA: begin\n`;
    rtlCode += `          if (rx_clock_count == CYCLES_PER_BIT) begin\n`;
    rtlCode += `            rx_clock_count <= 0;\n`;
    rtlCode += `            rx_data[rx_bit_index] <= rx; // Sample data bit\n`;
    rtlCode += `            if (rx_bit_index < DATA_BITS - 1) begin\n`;
    rtlCode += `              rx_bit_index <= rx_bit_index + 1;\n`;
    rtlCode += `            end else begin\n`;
    rtlCode += `              rx_bit_index <= 0;\n`;
    rtlCode += `              rx_state <= RX_STOP;\n`;
    rtlCode += `            end\n`;
    rtlCode += `          end else\n`;
    rtlCode += `            rx_clock_count <= rx_clock_count + 1;\n`;
    rtlCode += `        end\n\n`;
    
    rtlCode += `        RX_STOP: begin\n`;
    rtlCode += `          if (rx_clock_count == CYCLES_PER_BIT * STOP_BITS) begin\n`;
    rtlCode += `            rx_clock_count <= 0;\n`;
    rtlCode += `            rx_data_valid <= 1;\n`;
    rtlCode += `            rx_state <= RX_IDLE;\n`;
    rtlCode += `          end else\n`;
    rtlCode += `            rx_clock_count <= rx_clock_count + 1;\n`;
    rtlCode += `        end\n`;
    
    rtlCode += `      endcase\n`;
    rtlCode += `    end\n`;
    rtlCode += `  end\n\n`;
  }
  
  if (isTransmitter || isBoth) {
    rtlCode += `  // TX state machine states\n`;
    rtlCode += `  localparam TX_IDLE = 0,\n`;
    rtlCode += `             TX_START = 1,\n`;
    rtlCode += `             TX_DATA = 2,\n`;
    rtlCode += `             TX_STOP = 3;\n\n`;
    
    rtlCode += `  reg [1:0] tx_state;\n`;
    rtlCode += `  reg [15:0] tx_clock_count;\n`;
    rtlCode += `  reg [2:0] tx_bit_index;\n`;
    rtlCode += `  reg [${dataBits-1}:0] tx_data_reg;\n\n`;
    
    rtlCode += `  // TX state machine\n`;
    rtlCode += `  always @(posedge clk or negedge rst_n) begin\n`;
    rtlCode += `    if (~rst_n) begin\n`;
    rtlCode += `      tx_state <= TX_IDLE;\n`;
    rtlCode += `      tx_clock_count <= 0;\n`;
    rtlCode += `      tx_bit_index <= 0;\n`;
    rtlCode += `      tx <= 1; // Idle state is high\n`;
    rtlCode += `      tx_busy <= 0;\n`;
    rtlCode += `    end else begin\n`;
    rtlCode += `      case (tx_state)\n`;
    rtlCode += `        TX_IDLE: begin\n`;
    rtlCode += `          tx <= 1; // Idle state is high\n`;
    rtlCode += `          tx_clock_count <= 0;\n`;
    rtlCode += `          tx_bit_index <= 0;\n`;
    rtlCode += `          if (tx_start) begin\n`;
    rtlCode += `            tx_data_reg <= tx_data;\n`;
    rtlCode += `            tx_state <= TX_START;\n`;
    rtlCode += `            tx_busy <= 1;\n`;
    rtlCode += `          end\n`;
    rtlCode += `        end\n\n`;
    
    rtlCode += `        TX_START: begin\n`;
    rtlCode += `          tx <= 0; // Start bit is low\n`;
    rtlCode += `          if (tx_clock_count == CYCLES_PER_BIT - 1) begin\n`;
    rtlCode += `            tx_clock_count <= 0;\n`;
    rtlCode += `            tx_state <= TX_DATA;\n`;
    rtlCode += `          end else\n`;
    rtlCode += `            tx_clock_count <= tx_clock_count + 1;\n`;
    rtlCode += `        end\n\n`;
    
    rtlCode += `        TX_DATA: begin\n`;
    rtlCode += `          tx <= tx_data_reg[tx_bit_index]; // Send current bit\n`;
    rtlCode += `          if (tx_clock_count == CYCLES_PER_BIT - 1) begin\n`;
    rtlCode += `            tx_clock_count <= 0;\n`;
    rtlCode += `            if (tx_bit_index < DATA_BITS - 1) begin\n`;
    rtlCode += `              tx_bit_index <= tx_bit_index + 1;\n`;
    rtlCode += `            end else begin\n`;
    rtlCode += `              tx_bit_index <= 0;\n`;
    rtlCode += `              tx_state <= TX_STOP;\n`;
    rtlCode += `            end\n`;
    rtlCode += `          end else\n`;
    rtlCode += `            tx_clock_count <= tx_clock_count + 1;\n`;
    rtlCode += `        end\n\n`;
    
    rtlCode += `        TX_STOP: begin\n`;
    rtlCode += `          tx <= 1; // Stop bit is high\n`;
    rtlCode += `          if (tx_clock_count == CYCLES_PER_BIT * STOP_BITS - 1) begin\n`;
    rtlCode += `            tx_clock_count <= 0;\n`;
    rtlCode += `            tx_state <= TX_IDLE;\n`;
    rtlCode += `            tx_busy <= 0;\n`;
    rtlCode += `          end else\n`;
    rtlCode += `            tx_clock_count <= tx_clock_count + 1;\n`;
    rtlCode += `        end\n`;
    
    rtlCode += `      endcase\n`;
    rtlCode += `    end\n`;
    rtlCode += `  end\n`;
  }
  
  rtlCode += `\nendmodule`;
  
  // Generate testbench
  let testbench = `module ${moduleType}_tb;\n`;
  testbench += `  reg clk, rst_n;\n`;
  
  if (isReceiver || isBoth) {
    testbench += `  reg rx;\n`;
    testbench += `  wire [${dataBits-1}:0] rx_data;\n`;
    testbench += `  wire rx_data_valid;\n`;
  }
  
  if (isTransmitter || isBoth) {
    testbench += `  reg [${dataBits-1}:0] tx_data;\n`;
    testbench += `  reg tx_start;\n`;
    testbench += `  wire tx;\n`;
    testbench += `  wire tx_busy;\n`;
  }
  
  testbench += `\n  // Instantiate DUT\n`;
  testbench += `  ${moduleType} #(\n`;
  testbench += `    .CLOCK_FREQ(50000000),\n`;
  testbench += `    .BAUD_RATE(9600),\n`;
  testbench += `    .DATA_BITS(${dataBits}),\n`;
  testbench += `    .STOP_BITS(${stopBits})\n`;
  testbench += `  ) dut (\n`;
  testbench += `    .clk(clk),\n`;
  testbench += `    .rst_n(rst_n),\n`;
  
  if (isReceiver || isBoth) {
    testbench += `    .rx(rx),\n`;
    testbench += `    .rx_data(rx_data),\n`;
    testbench += `    .rx_data_valid(rx_data_valid),\n`;
  }
  
  if (isTransmitter || isBoth) {
    testbench += `    .tx_data(tx_data),\n`;
    testbench += `    .tx_start(tx_start),\n`;
    testbench += `    .tx(tx),\n`;
    testbench += `    .tx_busy(tx_busy)\n`;
  }
  
  testbench += `  );\n\n`;
  
  testbench += `  // Clock generation\n`;
  testbench += `  initial begin\n`;
  testbench += `    clk = 0;\n`;
  testbench += `    forever #10 clk = ~clk; // 50MHz clock\n`;
  testbench += `  end\n\n`;
  
  testbench += `  // Test procedure\n`;
  testbench += `  initial begin\n`;
  testbench += `    // Initialize signals\n`;
  testbench += `    rst_n = 0;\n`;
  
  if (isReceiver || isBoth) {
    testbench += `    rx = 1; // Idle state is high\n`;
  }
  
  if (isTransmitter || isBoth) {
    testbench += `    tx_data = ${dataBits}'h0;\n`;
    testbench += `    tx_start = 0;\n`;
  }
  
  testbench += `\n    // Reset release\n`;
  testbench += `    #100 rst_n = 1;\n`;
  
  if (isTransmitter || isBoth) {
    testbench += `\n    // Transmit a test byte\n`;
    testbench += `    #100;\n`;
    testbench += `    tx_data = ${dataBits}'h55; // 01010101\n`;
    testbench += `    tx_start = 1;\n`;
    testbench += `    #20 tx_start = 0;\n`;
    testbench += `    \n`;
    testbench += `    // Wait for transmission to complete\n`;
    testbench += `    wait(!tx_busy);\n`;
    testbench += `    #1000;\n`;
  }
  
  if (isReceiver || isBoth) {
    testbench += `\n    // Send a test byte to receiver (manually create UART frame)\n`;
    testbench += `    // Start bit\n`;
    testbench += `    rx = 0;\n`;
    testbench += `    #(104167); // 104167ns for 9600 baud\n`;
    testbench += `    \n`;
    testbench += `    // Data bits (0x55 = 01010101)\n`;
    for (let i = 0; i < dataBits; i++) {
      const bitValue = (i % 2) === 0 ? '1' : '0'; // Alternating 1s and 0s
      testbench += `    rx = ${bitValue}; // Bit ${i}\n`;
      testbench += `    #(104167);\n`;
    }
    
    testbench += `    \n    // Stop bit(s)\n`;
    for (let i = 0; i < stopBits; i++) {
      testbench += `    rx = 1; // Stop bit ${i+1}\n`;
      testbench += `    #(104167);\n`;
    }
  }
  
  testbench += `\n    // End simulation\n`;
  testbench += `    #1000 $finish;\n`;
  testbench += `  end\n\n`;
  
  testbench += `  // Monitor\n`;
  testbench += `  initial begin\n`;
  if (isReceiver || isBoth) {
    testbench += `    $monitor("Time: %t, rx_data_valid = %b, rx_data = %h", $time, rx_data_valid, rx_data);\n`;
  }
  if (isTransmitter || isBoth) {
    testbench += `    $monitor("Time: %t, tx = %b, tx_busy = %b", $time, tx, tx_busy);\n`;
  }
  testbench += `  end\n\n`;
  
  testbench += `endmodule`;
  
  // Description and components
  const typeDesc = isReceiver && isTransmitter ? "transceiver" : 
                  isReceiver ? "receiver" : 
                  isTransmitter ? "transmitter" : "transceiver";
  
  const description = `A UART ${typeDesc} with ${dataBits}-bit data and ${stopBits} stop bit${stopBits > 1 ? 's' : ''}. ` +
                     `This module implements standard serial communication with configurable baud rate. ` + 
                     `${isReceiver || isBoth ? 'The receiver detects start bits, samples data bits at the baud rate, and validates stop bits. ' : ''}` +
                     `${isTransmitter || isBoth ? 'The transmitter adds proper framing with start and stop bits around data for reliable transmission.' : ''}`;
  
  const components = ["Clock", "Reset"];
  if (isReceiver || isBoth) {
    components.push("UART Receiver FSM");
    components.push("Data Sampling Logic");
    components.push(`${dataBits}-bit Data Register`);
  }
  if (isTransmitter || isBoth) {
    components.push("UART Transmitter FSM");
    components.push("Bit Timing Generator");
    components.push(`${dataBits}-bit Shift Register`);
  }
  components.push("Baud Rate Generator");
  
  return {
    schematic: { nodes, edges },
    rtlCode,
    testbench,
    description,
    components
  };
};

export default generateUARTDesign;