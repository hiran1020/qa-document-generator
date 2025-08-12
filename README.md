# 🔬 AI-Powered QA Document Generator

> **Transform your feature descriptions and demo videos into comprehensive, professional-grade QA documentation with the power of AI.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)
![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-orange.svg)

An intelligent QA documentation generator that leverages Google's Gemini AI to automatically create comprehensive testing documentation from feature descriptions, screenshots, and video demonstrations.

## 🌟 Key Features

### 📋 **Complete Document Suite**
Generate 7 essential QA documents from a single input:
- **📑 Test Plan** - Strategic testing approach and methodology
- **🎯 QA Document** - Quality objectives and comprehensive testing processes  
- **📖 Feature Manual** - User-friendly documentation with step-by-step guides
- **🧪 Test Cases** - Detailed test scenarios with 50-150+ comprehensive cases
- **📝 User Stories** - Agile requirements with acceptance criteria
- **💨 Smoke Test Suite** - Critical path validation and quick build verification
- **🔄 Regression Test Plan** - Impact analysis and release validation strategy

### 🎥 **Multi-Modal Input Support**
- **Text Descriptions** - Detailed feature specifications
- **Image Upload** - Screenshots and wireframes with drag & drop support
- **Video Analysis** - Upload demo videos for comprehensive AI analysis
- **Hybrid Input** - Combine text, images, and video for maximum context

### 📥 **Flexible Export Options**
- **Individual Downloads** - Markdown, CSV (test cases), or PDF format
- **PDF Generation** - Professional formatting with proper typography and pagination
- **Bulk ZIP Download** - All documents in both Markdown and PDF formats
- **Copy to Clipboard** - Formatted content for external tools (Notion, Jira, etc.)

### 🎨 **Modern User Experience**
- **Tabbed Interface** - Easy navigation between document types
- **Real-time Preview** - Formatted Markdown rendering with syntax highlighting
- **Progress Tracking** - Visual progress indicators during generation
- **History Management** - Local storage of generated documents
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qa-document-generator.git
   cd qa-document-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file in root directory
   echo "API_KEY=your_gemini_api_key_here" > .env.local
   ```
   > **Note:** Replace `your_gemini_api_key_here` with your actual Gemini API key

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 📖 How to Use

### 1. **Input Your Content**
- **Text**: Describe your feature in the text area
- **Images**: Drag & drop screenshots or wireframes
- **Video**: Upload demo videos (supports MP4, WebM, MOV)

### 2. **Generate Documents**
Click "Generate Documents" and watch as AI analyzes your content and creates comprehensive QA documentation.

### 3. **Review & Export**
- Navigate between document types using tabs
- Review generated content with rich formatting
- Download individual documents or export everything as ZIP
- Copy formatted content to clipboard for external tools

### 4. **Iterate & Refine**
- Use the history sidebar to revisit previous generations
- Modify inputs and regenerate for improved results
- Build comprehensive documentation iteratively

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19.1.1 + TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Integration**: Google Gemini 2.5 Flash
- **PDF Generation**: jsPDF 3.0.1
- **Markdown Processing**: markdown-it 14.1.0
- **File Handling**: JSZip 3.10.1
- **Styling**: Tailwind CSS

### Key Components
```
src/
├── components/
│   ├── InputForm.tsx       # Multi-modal input interface
│   ├── OutputDisplay.tsx   # Document viewer with export options
│   ├── HistorySidebar.tsx  # Document history management
│   └── LoginPage.tsx       # API key configuration
├── services/
│   ├── geminiService.ts    # AI integration and processing
│   └── pdfService.ts       # PDF generation engine
├── types.ts                # TypeScript interfaces
└── App.tsx                 # Main application component
```

## 📊 Document Types Explained

### 1. **Test Plan** 📑
Comprehensive testing strategy including:
- Project scope and objectives
- Test approach and methodology
- Resource requirements and timelines
- Risk assessment and mitigation
- Success criteria and deliverables

### 2. **QA Document** 🎯
Quality assurance framework covering:
- Quality objectives and metrics
- Testing processes and workflows
- Defect management procedures
- Quality attributes analysis
- Compliance and standards

### 3. **Feature Manual** 📖
User-friendly documentation with:
- Step-by-step usage instructions
- Screenshot placeholders
- Troubleshooting guides
- FAQ sections
- Advanced feature explanations

### 4. **Test Cases** 🧪
Detailed test scenarios including:
- 50-150+ comprehensive test cases
- Priority-based categorization
- Pre-conditions and test steps
- Expected results and validation
- Edge cases and negative scenarios

### 5. **User Stories** 📝
Agile requirements documentation:
- User-centered story format
- Detailed acceptance criteria
- Gherkin syntax support
- Business value alignment
- Testable requirements

### 6. **Smoke Test Suite** 💨
Critical path validation including:
- Essential functionality checks
- Quick build verification
- Pre-deployment sanity tests
- Automation priority recommendations
- Failure response protocols

### 7. **Regression Test Plan** 🔄
Release validation strategy covering:
- Impact analysis methodology
- Test selection criteria
- Automation strategies
- Release validation processes
- Risk mitigation approaches

## 🎨 Advanced Features

### PDF Generation Engine
- **Professional Formatting**: Typography optimized for readability
- **Smart Pagination**: Automatic page breaks and content flow
- **Structured Layouts**: Document-specific formatting for each type
- **Rich Typography**: Support for headers, bullets, and numbered lists
- **Metadata Integration**: Generation timestamps and document titles

### AI-Powered Analysis
- **Multi-Modal Processing**: Simultaneous analysis of text, images, and video
- **Context Synthesis**: Intelligent combination of multiple input sources
- **Iterative Enhancement**: Support for progressive video analysis
- **Quality Validation**: Built-in checks for completeness and accuracy
- **Schema Enforcement**: Structured output with consistent formatting

### Export & Integration
- **Multiple Formats**: Markdown, CSV, PDF, and ZIP archives
- **Tool Integration**: Optimized for Notion, Jira, Confluence, and more
- **Batch Operations**: Bulk download of all documents
- **Version Control**: Local history with timestamp tracking
- **Cloud Ready**: Designed for easy deployment and scaling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/qa-document-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/qa-document-generator/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/qa-document-generator/wiki)

## 🌟 Roadmap

- [ ] **API Integration Templates** - Pre-built templates for common APIs
- [ ] **Test Data Generation** - Automated test data creation
- [ ] **CI/CD Integration** - Jenkins, GitHub Actions support
- [ ] **Team Collaboration** - Multi-user editing and sharing
- [ ] **Advanced AI Models** - Support for additional AI providers
- [ ] **Custom Templates** - User-defined document templates

---

**⚡ Built with AI • Made for QA Engineers • Powered by Innovation ⚡**

*Transform your testing workflow with intelligent document generation that saves time, ensures consistency, and elevates quality.*
