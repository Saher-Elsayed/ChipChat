// Verilog Parser Utility for ChipChat
// Comprehensive Verilog HDL parsing and analysis functions

class VerilogParser {
  constructor() {
    // Verilog keywords and operators
    this.keywords = [
      'module', 'endmodule', 'input', 'output', 'inout', 'wire', 'reg',
      'always', 'initial', 'assign', 'begin', 'end', 'if', 'else',
      'case', 'endcase', 'for', 'while', 'generate', 'endgenerate',
      'function', 'endfunction', 'task', 'endtask', 'parameter',
      'localparam', 'genvar', 'integer', 'real', 'time', 'realtime'
    ];

    this.operators = [
      '&&', '||', '==', '!=', '<=', '>=', '<', '>', '!', '&', '|', '^', '~',
      '+', '-', '*', '/', '%', '<<', '>>', '?', ':', '=', '@', '#'
    ];

    this.systemTasks = [
      '$display', '$monitor', '$write', '$finish', '$stop', '$time',
      '$realtime', '$dumpfile', '$dumpvars', '$random', '$urandom'
    ];
  }

  // Main parsing function
  parseVerilogCode(verilogCode) {
    try {
      const lines = verilogCode.split('\n');
      const tokens = this.tokenize(verilogCode);
      
      return {
        success: true,
        modules: this.extractModules(verilogCode),
        ports: this.extractPorts(verilogCode),
        signals: this.extractSignals(verilogCode),
        instances: this.extractInstances(verilogCode),
        always_blocks: this.extractAlwaysBlocks(verilogCode),
        assignments: this.extractAssignments(verilogCode),
        parameters: this.extractParameters(verilogCode),
        statistics: this.generateStatistics(lines, tokens),
        syntax_errors: this.checkSyntax(verilogCode),
        complexity: this.calculateComplexity(verilogCode)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        line: this.findErrorLine(error, verilogCode)
      };
    }
  }

  // Tokenize Verilog code
  tokenize(code) {
    // Remove comments
    code = this.removeComments(code);
    
    // Split into tokens while preserving operators and special characters
    const tokenRegex = /(\w+|\$\w+|\/\/.*|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|[{}();,\[\]@#=<>!&|^~+\-*/%?:]|\d+(?:\.\d+)?)/g;
    const tokens = code.match(tokenRegex) || [];
    
    return tokens.map(token => ({
      value: token.trim(),
      type: this.getTokenType(token.trim())
    })).filter(token => token.value.length > 0);
  }

  // Remove comments from code
  removeComments(code) {
    // Remove single-line comments
    code = code.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return code;
  }

  // Determine token type
  getTokenType(token) {
    if (this.keywords.includes(token)) return 'keyword';
    if (this.operators.includes(token)) return 'operator';
    if (this.systemTasks.includes(token)) return 'system_task';
    if (/^\d+$/.test(token)) return 'number';
    if (/^\d+'[bhdoB][0-9a-fA-F_]+$/.test(token)) return 'number_literal';
    if (/^".*"$/.test(token)) return 'string';
    if (/^[a-zA-Z_]\w*$/.test(token)) return 'identifier';
    if (/^[{}();,\[\]]$/.test(token)) return 'punctuation';
    return 'unknown';
  }

  // Extract module definitions
  extractModules(code) {
    const modules = [];
    const moduleRegex = /module\s+(\w+)\s*(?:\#\s*\([^)]*\))?\s*\(([^)]*)\)\s*;([\s\S]*?)endmodule/g;
    
    let match;
    while ((match = moduleRegex.exec(code)) !== null) {
      const [fullMatch, moduleName, portList, moduleBody] = match;
      
      modules.push({
        name: moduleName,
        ports: this.parsePortList(portList),
        body: moduleBody.trim(),
        line_start: this.findLineNumber(code, match.index),
        line_end: this.findLineNumber(code, match.index + fullMatch.length),
        parameters: this.extractModuleParameters(fullMatch)
      });
    }
    
    return modules;
  }

  // Extract port declarations
  extractPorts(code) {
    const ports = [];
    const portRegex = /(input|output|inout)\s*(?:\[\s*(\d+)\s*:\s*(\d+)\s*\])?\s*(\w+(?:\s*,\s*\w+)*)/g;
    
    let match;
    while ((match = portRegex.exec(code)) !== null) {
      const [, direction, msb, lsb, portNames] = match;
      const width = msb && lsb ? parseInt(msb) - parseInt(lsb) + 1 : 1;
      
      portNames.split(',').forEach(portName => {
        ports.push({
          name: portName.trim(),
          direction: direction,
          width: width,
          msb: msb ? parseInt(msb) : 0,
          lsb: lsb ? parseInt(lsb) : 0,
          line: this.findLineNumber(code, match.index)
        });
      });
    }
    
    return ports;
  }

  // Extract signal declarations
  extractSignals(code) {
    const signals = [];
    const signalRegex = /(wire|reg)\s*(?:\[\s*(\d+)\s*:\s*(\d+)\s*\])?\s*(\w+(?:\s*,\s*\w+)*)/g;
    
    let match;
    while ((match = signalRegex.exec(code)) !== null) {
      const [, signalType, msb, lsb, signalNames] = match;
      const width = msb && lsb ? parseInt(msb) - parseInt(lsb) + 1 : 1;
      
      signalNames.split(',').forEach(signalName => {
        signals.push({
          name: signalName.trim(),
          type: signalType,
          width: width,
          msb: msb ? parseInt(msb) : 0,
          lsb: lsb ? parseInt(lsb) : 0,
          line: this.findLineNumber(code, match.index)
        });
      });
    }
    
    return signals;
  }

  // Extract module instances
  extractInstances(code) {
    const instances = [];
    const instanceRegex = /(\w+)\s+(?:#\s*\([^)]*\)\s*)?(\w+)\s*\(([^;]*)\)\s*;/g;
    
    let match;
    while ((match = instanceRegex.exec(code)) !== null) {
      const [fullMatch, moduleName, instanceName, connections] = match;
      
      // Skip if it's a primitive or keyword
      if (this.keywords.includes(moduleName)) continue;
      
      instances.push({
        module_name: moduleName,
        instance_name: instanceName,
        connections: this.parseConnections(connections),
        line: this.findLineNumber(code, match.index)
      });
    }
    
    return instances;
  }

  // Extract always blocks
  extractAlwaysBlocks(code) {
    const alwaysBlocks = [];
    const alwaysRegex = /always\s*@\s*\(([^)]*)\)\s*(begin\s*[\s\S]*?end|[^;]*;)/g;
    
    let match;
    while ((match = alwaysRegex.exec(code)) !== null) {
      const [fullMatch, sensitivity, body] = match;
      
      alwaysBlocks.push({
        sensitivity_list: sensitivity.trim(),
        body: body.trim(),
        type: this.classifyAlwaysBlock(sensitivity, body),
        line: this.findLineNumber(code, match.index),
        signals_read: this.extractSignalsFromBlock(body, 'read'),
        signals_written: this.extractSignalsFromBlock(body, 'write')
      });
    }
    
    return alwaysBlocks;
  }

  // Extract continuous assignments
  extractAssignments(code) {
    const assignments = [];
    const assignRegex = /assign\s+([^=]+)\s*=\s*([^;]+)\s*;/g;
    
    let match;
    while ((match = assignRegex.exec(code)) !== null) {
      const [fullMatch, lhs, rhs] = match;
      
      assignments.push({
        lhs: lhs.trim(),
        rhs: rhs.trim(),
        line: this.findLineNumber(code, match.index),
        complexity: this.calculateExpressionComplexity(rhs)
      });
    }
    
    return assignments;
  }

  // Extract parameters
  extractParameters(code) {
    const parameters = [];
    const paramRegex = /(parameter|localparam)\s+(?:\[\s*\d+\s*:\s*\d+\s*\])?\s*(\w+)\s*=\s*([^;,]+)/g;
    
    let match;
    while ((match = paramRegex.exec(code)) !== null) {
      const [, paramType, paramName, paramValue] = match;
      
      parameters.push({
        name: paramName.trim(),
        type: paramType,
        value: paramValue.trim(),
        line: this.findLineNumber(code, match.index)
      });
    }
    
    return parameters;
  }

  // Parse port list
  parsePortList(portList) {
    if (!portList) return [];
    
    return portList.split(',').map(port => port.trim()).filter(port => port.length > 0);
  }

  // Parse module parameters
  extractModuleParameters(moduleDeclaration) {
    const paramMatch = moduleDeclaration.match(/#\s*\(([^)]*)\)/);
    if (!paramMatch) return [];
    
    return paramMatch[1].split(',').map(param => {
      const [name, value] = param.split('=').map(p => p.trim());
      return { name, value: value || null };
    });
  }

  // Parse instance connections
  parseConnections(connections) {
    const connectionList = [];
    const namedConnRegex = /\.(\w+)\s*\(([^)]*)\)/g;
    
    let match;
    while ((match = namedConnRegex.exec(connections)) !== null) {
      const [, portName, signal] = match;
      connectionList.push({
        port: portName,
        signal: signal.trim()
      });
    }
    
    return connectionList;
  }

  // Classify always block type
  classifyAlwaysBlock(sensitivity, body) {
    if (sensitivity.includes('posedge') || sensitivity.includes('negedge')) {
      return 'sequential';
    } else if (sensitivity.includes('*') || sensitivity.includes('or')) {
      return 'combinational';
    }
    return 'unknown';
  }

  // Extract signals from block
  extractSignalsFromBlock(block, operation) {
    const signals = [];
    
    if (operation === 'read') {
      // Find signals on RHS of assignments
      const readRegex = /=\s*([^;]+)/g;
      let match;
      while ((match = readRegex.exec(block)) !== null) {
        const rhs = match[1];
        const identifiers = rhs.match(/\b[a-zA-Z_]\w*\b/g) || [];
        signals.push(...identifiers);
      }
    } else if (operation === 'write') {
      // Find signals on LHS of assignments
      const writeRegex = /(\w+)\s*[<]?=/g;
      let match;
      while ((match = writeRegex.exec(block)) !== null) {
        signals.push(match[1]);
      }
    }
    
    return [...new Set(signals)]; // Remove duplicates
  }

  // Calculate expression complexity
  calculateExpressionComplexity(expression) {
    const operators = (expression.match(/[&|^~+\-*/%<>=!]/g) || []).length;
    const parentheses = (expression.match(/[()]/g) || []).length / 2;
    const conditionals = (expression.match(/\?/g) || []).length;
    
    return operators + parentheses + conditionals * 2;
  }

  // Generate code statistics
  generateStatistics(lines, tokens) {
    const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
    const commentLines = lines.filter(line => line.trim().startsWith('//')).length;
    
    const tokenCounts = tokens.reduce((counts, token) => {
      counts[token.type] = (counts[token.type] || 0) + 1;
      return counts;
    }, {});
    
    return {
      total_lines: lines.length,
      code_lines: nonEmptyLines - commentLines,
      comment_lines: commentLines,
      blank_lines: lines.length - nonEmptyLines,
      total_tokens: tokens.length,
      token_distribution: tokenCounts,
      avg_line_length: lines.reduce((sum, line) => sum + line.length, 0) / lines.length
    };
  }

  // Basic syntax checking
  checkSyntax(code) {
    const errors = [];
    const lines = code.split('\n');
    
    // Check for balanced parentheses, brackets, and begin/end
    let parenCount = 0;
    let bracketCount = 0;
    let beginCount = 0;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Count delimiters
      parenCount += (line.match(/\(/g) || []).length;
      parenCount -= (line.match(/\)/g) || []).length;
      bracketCount += (line.match(/\[/g) || []).length;
      bracketCount -= (line.match(/\]/g) || []).length;
      beginCount += (line.match(/\bbegin\b/g) || []).length;
      beginCount -= (line.match(/\bend\b/g) || []).length;
      
      // Check for missing semicolons
      if (line.match(/^\s*(assign|wire|reg|input|output)/) && !line.includes(';') && !line.includes('(')) {
        errors.push({
          type: 'missing_semicolon',
          line: lineNum,
          message: 'Missing semicolon at end of statement'
        });
      }
      
      // Check for incomplete if statements
      if (line.includes('if') && !line.includes('begin') && !lines[index + 1]?.trim().startsWith('begin')) {
        const nextLine = lines[index + 1];
        if (nextLine && !nextLine.includes('else') && !nextLine.trim().endsWith(';')) {
          errors.push({
            type: 'incomplete_if',
            line: lineNum,
            message: 'Incomplete if statement may infer latch'
          });
        }
      }
    });
    
    // Check final balancing
    if (parenCount !== 0) {
      errors.push({
        type: 'unbalanced_parentheses',
        line: null,
        message: `Unbalanced parentheses: ${parenCount > 0 ? 'missing' : 'extra'} ${Math.abs(parenCount)} closing parentheses`
      });
    }
    
    if (bracketCount !== 0) {
      errors.push({
        type: 'unbalanced_brackets',
        line: null,
        message: `Unbalanced brackets: ${bracketCount > 0 ? 'missing' : 'extra'} ${Math.abs(bracketCount)} closing brackets`
      });
    }
    
    if (beginCount !== 0) {
      errors.push({
        type: 'unbalanced_begin_end',
        line: null,
        message: `Unbalanced begin/end: ${beginCount > 0 ? 'missing' : 'extra'} ${Math.abs(beginCount)} end statements`
      });
    }
    
    return errors;
  }

  // Calculate code complexity
  calculateComplexity(code) {
    const modules = this.extractModules(code);
    const alwaysBlocks = this.extractAlwaysBlocks(code);
    const assignments = this.extractAssignments(code);
    
    let totalComplexity = 0;
    
    // Module complexity
    totalComplexity += modules.length * 2;
    
    // Always block complexity
    alwaysBlocks.forEach(block => {
      totalComplexity += 3; // Base complexity
      totalComplexity += (block.body.match(/\bif\b/g) || []).length * 2;
      totalComplexity += (block.body.match(/\bcase\b/g) || []).length * 3;
      totalComplexity += (block.body.match(/\bfor\b/g) || []).length * 4;
    });
    
    // Assignment complexity
    assignments.forEach(assign => {
      totalComplexity += assign.complexity;
    });
    
    return {
      total: totalComplexity,
      per_module: modules.length > 0 ? totalComplexity / modules.length : 0,
      category: this.classifyComplexity(totalComplexity)
    };
  }

  // Classify complexity level
  classifyComplexity(complexity) {
    if (complexity < 10) return 'simple';
    if (complexity < 25) return 'moderate';
    if (complexity < 50) return 'complex';
    return 'very_complex';
  }

  // Find line number for a character position
  findLineNumber(code, position) {
    return code.substring(0, position).split('\n').length;
  }

  // Find error line
  findErrorLine(error, code) {
    // Simple heuristic to find error line
    const errorStr = error.toString();
    const lineMatch = errorStr.match(/line (\d+)/i);
    return lineMatch ? parseInt(lineMatch[1]) : null;
  }

  // Validate module structure
  validateModule(moduleCode) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Check for module declaration
    if (!moduleCode.includes('module')) {
      validation.isValid = false;
      validation.errors.push('Missing module declaration');
    }
    
    // Check for endmodule
    if (!moduleCode.includes('endmodule')) {
      validation.isValid = false;
      validation.errors.push('Missing endmodule statement');
    }
    
    // Check for port list
    const moduleMatch = moduleCode.match(/module\s+\w+\s*\(([^)]*)\)/);
    if (!moduleMatch || !moduleMatch[1].trim()) {
      validation.warnings.push('Module has no ports');
    }
    
    return validation;
  }

  // Extract hierarchy information
  extractHierarchy(code) {
    const modules = this.extractModules(code);
    const hierarchy = {};
    
    modules.forEach(module => {
      const instances = this.extractInstances(module.body);
      hierarchy[module.name] = {
        instances: instances.map(inst => ({
          name: inst.instance_name,
          module: inst.module_name
        })),
        children: instances.map(inst => inst.module_name)
      };
    });
    
    return hierarchy;
  }
}

// Export functions for use in ChipChat
export const parseVerilog = (code) => {
  const parser = new VerilogParser();
  return parser.parseVerilogCode(code);
};

export const validateVerilog = (code) => {
  const parser = new VerilogParser();
  return parser.validateModule(code);
};

export const getVerilogStatistics = (code) => {
  const parser = new VerilogParser();
  const result = parser.parseVerilogCode(code);
  return result.success ? result.statistics : null;
};

export const getVerilogComplexity = (code) => {
  const parser = new VerilogParser();
  return parser.calculateComplexity(code);
};

export const extractVerilogHierarchy = (code) => {
  const parser = new VerilogParser();
  return parser.extractHierarchy(code);
};

export default VerilogParser;