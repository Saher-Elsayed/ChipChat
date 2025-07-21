// NLP Service for FPGA Design Generator
// This service provides more advanced natural language processing capabilities
// to better interpret user intentions for FPGA design generation

/**
 * Processes natural language prompt to extract FPGA design requirements
 * @param {string} promptText - The user's natural language prompt
 * @returns {Object} Design parameters extracted from the prompt
 */
export const processDesignPrompt = async (promptText) => {
  // In a production environment, this would call an actual LLM API
  // For now, we'll implement a more sophisticated rule-based system
  
  const lowerPrompt = promptText.toLowerCase();
  
  // Detect the primary design type
  const designType = detectDesignType(lowerPrompt);
  
  // Extract parameters based on the detected design type
  const params = extractDesignParameters(lowerPrompt, designType);
  
  return {
    type: designType,
    parameters: params,
    prompt: promptText,
    processed: true
  };
};

/**
 * Detects the primary design type from the prompt
 * @param {string} prompt - The lowercase prompt text
 * @returns {string} The detected design type
 */
const detectDesignType = (prompt) => {
  // Define design patterns with keywords and weighted scores
  const designPatterns = [
    {
      type: 'counter',
      keywords: {
        primary: ['counter', 'count', 'increment', 'decrement'],
        secondary: ['binary', 'flip-flop', 'sequential', 'register', 'up-down', 'updown'],
        context: ['bit', 'synchronous', 'asynchronous', 'clock', 'enable', 'reset']
      }
    },
    {
      type: 'traffic_light',
      keywords: {
        primary: ['traffic', 'stoplight', 'semaphore'],
        secondary: ['light', 'signal', 'intersection', 'crossroad'],
        context: ['fsm', 'state', 'machine', 'controller', 'red', 'yellow', 'green']
      }
    },
    {
      type: 'uart',
      keywords: {
        primary: ['uart', 'serial', 'rs232'],
        secondary: ['communication', 'transmit', 'receive', 'tx', 'rx'],
        context: ['baud', 'asynchronous', 'data', 'stop', 'bit', 'parity']
      }
    },
    {
      type: 'alu',
      keywords: {
        primary: ['alu', 'arithmetic'],
        secondary: ['logic', 'unit', 'operation', 'processor', 'compute'],
        context: ['add', 'subtract', 'logical', 'shift', 'rotate', 'compare', 'and', 'or', 'xor']
      }
    },
    {
      type: 'custom',
      keywords: {
        primary: ['custom', 'specific', 'unique', 'special'],
        secondary: ['design', 'circuit', 'module', 'component'],
        context: ['fpga', 'verilog', 'hdl', 'hardware', 'description']
      }
    }
  ];

  // Score each design type
  const scores = designPatterns.map(pattern => {
    let score = 0;
    
    // Primary keywords have highest weight
    pattern.keywords.primary.forEach(keyword => {
      if (prompt.includes(keyword)) score += 10;
    });
    
    // Secondary keywords have medium weight
    pattern.keywords.secondary.forEach(keyword => {
      if (prompt.includes(keyword)) score += 5;
    });
    
    // Context keywords have lowest weight but provide additional confidence
    pattern.keywords.context.forEach(keyword => {
      if (prompt.includes(keyword)) score += 2;
    });
    
    return { type: pattern.type, score };
  });
  
  // Find the design type with highest score
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0];
  
  // If the best score is too low, default to counter
  return bestMatch.score >= 5 ? bestMatch.type : 'counter';
};

/**
 * Extracts design parameters based on the design type
 * @param {string} prompt - The lowercase prompt text
 * @param {string} designType - The detected design type
 * @returns {Object} Parameters specific to the design type
 */
const extractDesignParameters = (prompt, designType) => {
  // Common parameter extraction functions
  const extractBitWidth = () => {
    const bitMatches = prompt.match(/(\d+)[\s-]*(bit|bits)/);
    if (bitMatches) return parseInt(bitMatches[1]);
    
    // Look for other numeric indicators
    const numMatches = prompt.match(/(\d+)[\s-]*(width|wide|size)/);
    if (numMatches) return parseInt(numMatches[1]);
    
    // Default values based on design type
    switch (designType) {
      case 'counter': return 4;
      case 'alu': return 8;
      case 'uart': return 8;
      default: return 4;
    }
  };

  // Extract parameters based on design type
  switch (designType) {
    case 'counter':
      return {
        bitWidth: extractBitWidth(),
        hasEnable: prompt.includes('enable') || prompt.includes(' en '),
        hasReset: prompt.includes('reset') || prompt.includes('clear') || prompt.includes(' rst '),
        isUpDown: prompt.includes('up-down') || prompt.includes('updown') || prompt.includes('up/down'),
        isLoadable: prompt.includes('load') || prompt.includes('preset'),
        isBinary: !prompt.includes('gray') && !prompt.includes('johnson'),
        isGray: prompt.includes('gray'),
        isJohnson: prompt.includes('johnson') || prompt.includes('twisted ring'),
        isRing: prompt.includes('ring') && !prompt.includes('twisted')
      };
      
    case 'traffic_light':
      let wayCount = 4; // Default
      const wayMatches = prompt.match(/(\d+)[\s-]*(way|ways)/);
      if (wayMatches) wayCount = parseInt(wayMatches[1]);
      
      return {
        wayCount: wayCount,
        isIntersection: prompt.includes('intersection') || prompt.includes('cross'),
        hasPedestrian: prompt.includes('pedestrian') || prompt.includes('walk'),
        hasSensors: prompt.includes('sensor') || prompt.includes('detect'),
        hasEmergencyMode: prompt.includes('emergency') || prompt.includes('priority')
      };
      
    case 'uart':
      const dataBits = prompt.includes('7-bit') ? 7 : 
                      prompt.includes('9-bit') ? 9 : 8;
      
      return {
        dataBits: dataBits,
        stopBits: prompt.includes('2 stop') || prompt.includes('two stop') ? 2 : 1,
        hasParity: prompt.includes('parity'),
        isParityOdd: prompt.includes('odd parity'),
        isParityEven: prompt.includes('even parity'),
        isReceiver: prompt.includes('receiver') || prompt.includes('rx'),
        isTransmitter: prompt.includes('transmitter') || prompt.includes('tx'),
        isBoth: !prompt.includes('receiver') && !prompt.includes('rx') && 
                !prompt.includes('transmitter') && !prompt.includes('tx')
      };
      
    case 'alu':
      return {
        bitWidth: extractBitWidth(),
        hasLogical: !prompt.includes('no logical') && 
                   (prompt.includes('logical') || prompt.includes('logic') || 
                    prompt.includes('boolean') || prompt.includes('and') || 
                    prompt.includes('or') || prompt.includes('xor')),
        hasShift: !prompt.includes('no shift') && 
                 (prompt.includes('shift') || prompt.includes('sll') || 
                  prompt.includes('srl') || prompt.includes('rotation')),
        hasMultiply: prompt.includes('multiply') || prompt.includes('multiplication'),
        hasDivide: prompt.includes('divide') || prompt.includes('division'),
        hasCompare: prompt.includes('compare') || prompt.includes('comparison')
      };
      
    case 'custom':
      // For custom designs, we extract more general parameters
      // In a real implementation, this would pass the full prompt to an LLM
      return {
        bitWidth: extractBitWidth(),
        isSequential: prompt.includes('sequential') || prompt.includes('clock'),
        isCombinational: prompt.includes('combinational') || prompt.includes('combinatorial'),
        complexity: prompt.includes('complex') ? 'high' : 
                  prompt.includes('simple') ? 'low' : 'medium',
        description: prompt,
      };
      
    default:
      // Default to counter parameters
      return {
        bitWidth: 4,
        hasEnable: false,
        hasReset: true
      };
  }
};

/**
 * Converts the NLP processing result to a design generation configuration
 * @param {Object} nlpResult - The NLP processing result
 * @returns {Object} Configuration for the design generator
 */
export const translateToDesignConfig = (nlpResult) => {
  const { type, parameters } = nlpResult;
  
  switch (type) {
    case 'counter':
      return {
        type: 'counter',
        bits: parameters.bitWidth,
        hasEnable: parameters.hasEnable,
        hasReset: parameters.hasReset
      };
      
    case 'traffic_light':
      return {
        type: 'traffic_light',
        isIntersection: parameters.isIntersection,
        wayCount: parameters.wayCount
      };
      
    case 'uart':
      return {
        type: 'uart',
        isReceiver: parameters.isReceiver || parameters.isBoth,
        isTransmitter: parameters.isTransmitter || parameters.isBoth,
        dataBits: parameters.dataBits,
        stopBits: parameters.stopBits
      };
      
    case 'alu':
      return {
        type: 'alu',
        bitWidth: parameters.bitWidth,
        hasLogical: parameters.hasLogical,
        hasShift: parameters.hasShift
      };
      
    case 'custom':
      // For custom designs, we would need to generate a more flexible configuration
      // that could be interpreted by a custom design generator
      return {
        type: 'custom',
        params: parameters
      };
      
    default:
      return {
        type: 'counter',
        bits: 4,
        hasEnable: false,
        hasReset: true
      };
  }
};