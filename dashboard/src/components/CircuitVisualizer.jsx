import React, { useEffect, useRef } from 'react';

const CircuitVisualizer = ({ circuitData }) => {
  const canvasRef = useRef(null);
  
  // Draw circuit on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !circuitData) return;
    
    const ctx = canvas.getContext('2d');
    const { nodes, edges } = circuitData;
    
    if (!nodes || !edges) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges (connections)
    ctx.strokeStyle = '#6366F1'; // Indigo color for connections
    ctx.lineWidth = 2;
    
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        // Calculate connection points
        let startX, startY, endX, endY;
        
        if (fromNode.type === 'input') {
          startX = fromNode.x + 80; // Right side of input
          startY = fromNode.y;
        } else {
          startX = fromNode.x + 40; // Right side of gate
          startY = fromNode.y;
        }
        
        if (toNode.type === 'output') {
          endX = toNode.x - 10; // Left side of output
          endY = toNode.y;
        } else {
          endX = toNode.x - 40; // Left side of gate
          endY = toNode.y;
        }
        
        // Draw connection line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // If there's a significant horizontal gap, add a bend
        if (Math.abs(startX - endX) > 50) {
          const midX = (startX + endX) / 2;
          ctx.lineTo(midX, startY);
          ctx.lineTo(midX, endY);
        }
        
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });
    
    // Draw nodes (components)
    nodes.forEach(node => {
      switch(node.type) {
        case 'input':
          drawInput(ctx, node);
          break;
        case 'output':
          drawOutput(ctx, node);
          break;
        case 'gate':
          drawGate(ctx, node);
          break;
        default:
          drawGenericNode(ctx, node);
      }
    });
    
  }, [circuitData]);
  
  // Draw input node
  const drawInput = (ctx, node) => {
    ctx.fillStyle = '#E0F2FE'; // Light blue background
    ctx.strokeStyle = '#0284C7'; // Blue border
    ctx.lineWidth = 2;
    
    // Draw input shape
    ctx.beginPath();
    ctx.roundRect(node.x, node.y - 15, 80, 30, 5);
    ctx.fill();
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#0C4A6E'; // Dark blue text
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x + 40, node.y);
  };
  
  // Draw output node
  const drawOutput = (ctx, node) => {
    ctx.fillStyle = '#DCFCE7'; // Light green background
    ctx.strokeStyle = '#16A34A'; // Green border
    ctx.lineWidth = 2;
    
    // Draw output shape
    ctx.beginPath();
    ctx.roundRect(node.x, node.y - 15, 80, 30, 5);
    ctx.fill();
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#166534'; // Dark green text
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x + 40, node.y);
  };
  
  // Draw logic gate
  const drawGate = (ctx, node) => {
    ctx.fillStyle = '#EEF2FF'; // Light indigo background
    ctx.strokeStyle = '#6366F1'; // Indigo border
    ctx.lineWidth = 2;
    
    // Draw gate shape based on type
    ctx.beginPath();
    
    // Determine gate shape based on label
    if (node.label.includes('AND')) {
      // AND gate (D shape)
      ctx.moveTo(node.x - 30, node.y - 20); // Top left
      ctx.lineTo(node.x + 10, node.y - 20); // Top right before curve
      ctx.arcTo(node.x + 40, node.y - 20, node.x + 40, node.y, 20); // Top right curve
      ctx.arcTo(node.x + 40, node.y + 20, node.x + 10, node.y + 20, 20); // Bottom right curve
      ctx.lineTo(node.x - 30, node.y + 20); // Bottom left
      ctx.closePath();
    } else if (node.label.includes('OR')) {
      // OR gate (curved left side)
      ctx.moveTo(node.x - 30, node.y - 20); // Top left
      ctx.quadraticCurveTo(node.x - 15, node.y, node.x - 30, node.y + 20); // Left curved side
      ctx.lineTo(node.x + 10, node.y + 20); // Bottom right
      ctx.arcTo(node.x + 40, node.y + 20, node.x + 40, node.y, 20); // Bottom right curve
      ctx.arcTo(node.x + 40, node.y - 20, node.x + 10, node.y - 20, 20); // Top right curve
      ctx.lineTo(node.x - 30, node.y - 20); // Back to top left
    } else if (node.label.includes('Counter')) {
      // Counter (rectangle with counter symbol)
      ctx.roundRect(node.x - 40, node.y - 25, 80, 50, 5);
      ctx.fill();
      ctx.stroke();
      
      // Draw counter symbol (up arrow)
      ctx.beginPath();
      ctx.moveTo(node.x - 20, node.y + 10);
      ctx.lineTo(node.x - 10, node.y - 10);
      ctx.lineTo(node.x, node.y + 10);
      ctx.stroke();
      
      // Return early to avoid double-drawing the main shape
      ctx.fillStyle = '#4338CA'; // Dark indigo text
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
      return;
    } else if (node.label.includes('ALU')) {
      // ALU (trapezoid)
      ctx.moveTo(node.x - 40, node.y - 25); // Top left
      ctx.lineTo(node.x + 40, node.y - 25); // Top right
      ctx.lineTo(node.x + 30, node.y + 25); // Bottom right
      ctx.lineTo(node.x - 30, node.y + 25); // Bottom left
      ctx.closePath();
    } else if (node.label.includes('FSM') || node.label.includes('Traffic')) {
      // FSM (circle with state symbol)
      ctx.arc(node.x, node.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw state symbol (small circle within)
      ctx.beginPath();
      ctx.arc(node.x, node.y - 5, 15, 0, Math.PI * 2);
      ctx.stroke();
      
      // Return early to avoid double-drawing
      ctx.fillStyle = '#4338CA'; // Dark indigo text
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y + 15);
      return;
    } else if (node.label.includes('UART')) {
      // UART (rectangle with serial symbol)
      ctx.roundRect(node.x - 40, node.y - 25, 80, 50, 5);
      ctx.fill();
      ctx.stroke();
      
      // Draw serial symbol (wave)
      ctx.beginPath();
      ctx.moveTo(node.x - 25, node.y);
      ctx.lineTo(node.x - 15, node.y - 10);
      ctx.lineTo(node.x - 5, node.y + 10);
      ctx.lineTo(node.x + 5, node.y - 10);
      ctx.lineTo(node.x + 15, node.y + 10);
      ctx.lineTo(node.x + 25, node.y);
      ctx.stroke();
      
      // Return early
      ctx.fillStyle = '#4338CA'; // Dark indigo text
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y - 15);
      return;
    } else {
      // Generic gate (rectangle with rounded corners)
      ctx.roundRect(node.x - 40, node.y - 20, 80, 40, 5);
    }
    
    ctx.fill();
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#4338CA'; // Dark indigo text
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  };
  
  // Draw generic node
  const drawGenericNode = (ctx, node) => {
    ctx.fillStyle = '#FEF3C7'; // Light yellow background
    ctx.strokeStyle = '#D97706'; // Amber border
    ctx.lineWidth = 2;
    
    // Draw shape
    ctx.beginPath();
    ctx.roundRect(node.x - 30, node.y - 15, 60, 30, 5);
    ctx.fill();
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#92400E'; // Dark amber text
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  };
  
  return (
    <div className="circuit-visualizer">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">Circuit Schematic</h3>
        <div className="flex">
          <button className="mr-2 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Zoom
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
        </div>
      </div>
      <div className="border border-gray-200 rounded-md bg-white">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={350}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default CircuitVisualizer;