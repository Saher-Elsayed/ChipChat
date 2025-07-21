# Project Summary
The FPGA Design Generator is an innovative web application that enables users to create FPGA designs from natural language prompts. It caters to both novices and experienced developers, enhancing education and practical use in FPGA design by generating comprehensive RTL code and visual circuit representations. The tool aims to streamline the design process, making it accessible and efficient for various applications.

# Project Module Description
- **FPGADesignGenerator**: The core interface where users input circuit requirements in natural language to receive generated designs.
- **CircuitVisualizer**: Visualizes FPGA circuit schematics based on the generated designs.
- **Dashboard**: Displays metrics on generated designs, components utilized, and user learning progress.
- **UART Generator**: Creates UART design schematics and RTL code for configurable data transmission.
- **ALU Generator**: Generates ALU designs with options for arithmetic and logical operations.

# Directory Tree
```
dashboard/
├── README.md               # Project documentation
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── src/
│   ├── App.jsx             # Main application component
│   ├── components/         # Contains UI components
│   │   ├── CircuitVisualizer.jsx   # Component for visualizing circuits
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── FPGADesignGenerator.jsx # FPGA design generator component
│   │   ├── Header.jsx             # Header component
│   │   ├── Sidebar.jsx            # Sidebar navigation component
│   │   ├── StatsCard.jsx          # Component for displaying stats
│   │   ├── generateUARTDesign.js   # Module for generating UART designs
│   │   └── generateALUDesign.js    # Module for generating ALU designs
│   ├── data/               # Contains mock data and design metrics
│   │   ├── fpgaData.js     # Data model for FPGA components and metrics
│   │   └── mockData.js      # Mock data for demonstration
│   ├── index.css           # Main CSS styles
│   ├── main.jsx            # Entry point for the React application
├── tailwind.config.js      # Tailwind CSS configuration
├── template_config.json    # Template configuration for the dashboard
└── vite.config.js          # Vite configuration for development
```

# File Description Inventory
- **README.md**: Overview and setup instructions for the project.
- **eslint.config.js**: Configuration file for linting JavaScript code.
- **index.html**: The main HTML file for the application.
- **package.json**: Contains dependencies, scripts, and metadata for the project.
- **postcss.config.js**: Configuration for PostCSS processing.
- **src/App.jsx**: Contains the main application logic and routing.
- **src/components/**: Directory for reusable UI components and design generators.
- **src/data/**: Includes data models and mock data for testing.
- **src/index.css**: Global styles for the application.
- **src/main.jsx**: Initializes the React application.
- **tailwind.config.js**: Configuration for Tailwind CSS styling.
- **template_config.json**: Configuration for the dashboard template.
- **vite.config.js**: Configuration for Vite, the build tool.

# Technology Stack
- **Frontend**: React, Tailwind CSS
- **Build Tool**: Vite
- **Linting**: ESLint
- **CSS Processing**: PostCSS

# Usage
1. **Install Dependencies**: Run `npm install` to install all necessary dependencies.
2. **Build the Project**: Use `npm run build` to create a production build.
3. **Run the Application**: Execute `npm run dev` to start the development environment.
