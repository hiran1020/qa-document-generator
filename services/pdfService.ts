import jsPDF from 'jspdf';
import MarkdownIt from 'markdown-it';
import { GeneratedDocuments, TestCase, UserStory } from '../types';

// Initialize markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

interface PDFGenerationOptions {
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
  pageWidth?: number;
  pageHeight?: number;
}

class PDFGenerator {
  private doc: jsPDF;
  private options: Required<PDFGenerationOptions>;
  private currentY: number = 0;
  private pageHeight: number;
  private margin: number;

  constructor(options: PDFGenerationOptions = {}) {
    this.options = {
      fontSize: 12,
      lineHeight: 6,
      margin: 20,
      pageWidth: 210, // A4 width in mm
      pageHeight: 297, // A4 height in mm
      ...options
    };

    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [this.options.pageWidth, this.options.pageHeight]
    });

    this.pageHeight = this.options.pageHeight;
    this.margin = this.options.margin;
    this.currentY = this.margin;
  }

  private checkPageBreak(height: number = 10) {
    if (this.currentY + height > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addText(text: string, options: {
    fontSize?: number;
    style?: 'normal' | 'bold' | 'italic';
    color?: [number, number, number];
    indent?: number;
  } = {}) {
    const fontSize = options.fontSize || this.options.fontSize;
    const indent = options.indent || 0;
    const maxWidth = this.options.pageWidth - (this.margin * 2) - indent;
    
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', options.style || 'normal');
    
    if (options.color) {
      this.doc.setTextColor(...options.color);
    } else {
      this.doc.setTextColor(0, 0, 0);
    }

    // Split text into lines that fit within the page width
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.checkPageBreak();
      this.doc.text(line, this.margin + indent, this.currentY);
      this.currentY += this.options.lineHeight;
    }
  }

  private addHeading(text: string, level: 1 | 2 | 3 = 1) {
    const fontSizes = { 1: 18, 2: 16, 3: 14 };
    const spacing = { 1: 10, 2: 8, 3: 6 };
    
    this.currentY += spacing[level];
    this.addText(text, {
      fontSize: fontSizes[level],
      style: 'bold',
      color: level === 1 ? [31, 81, 255] : [51, 51, 51] // Blue for h1, dark gray for others
    });
    this.currentY += 3;
  }

  private addBulletPoint(text: string, indent: number = 5) {
    this.addText('• ' + text, { indent });
  }

  private addNumberedPoint(text: string, number: number, indent: number = 5) {
    this.addText(`${number}. ${text}`, { indent });
  }

  private parseMarkdownContent(content: string) {
    const lines = content.split('\n');
    let listCounter = 0;
    let inList = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        this.currentY += 3;
        continue;
      }

      // Handle headers
      if (trimmedLine.startsWith('# ')) {
        inList = false;
        listCounter = 0;
        this.addHeading(trimmedLine.substring(2), 1);
      } else if (trimmedLine.startsWith('## ')) {
        inList = false;
        listCounter = 0;
        this.addHeading(trimmedLine.substring(3), 2);
      } else if (trimmedLine.startsWith('### ')) {
        inList = false;
        listCounter = 0;
        this.addHeading(trimmedLine.substring(4), 3);
      }
      // Handle bullet points
      else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (!inList) {
          inList = true;
          listCounter = 0;
        }
        this.addBulletPoint(trimmedLine.substring(2));
      }
      // Handle numbered lists
      else if (trimmedLine.match(/^\d+\./)) {
        if (!inList) {
          inList = true;
          listCounter = 0;
        }
        listCounter++;
        const text = trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim();
        this.addNumberedPoint(text, listCounter);
      }
      // Handle bold text (simplified - just remove markdown and make bold)
      else if (trimmedLine.includes('**')) {
        inList = false;
        listCounter = 0;
        const cleanText = trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1');
        this.addText(cleanText, { style: 'bold' });
      }
      // Regular text
      else {
        inList = false;
        listCounter = 0;
        this.addText(trimmedLine);
      }
    }
  }

  generateTestPlanPDF(content: string, title: string): Blob {
    // Add title
    this.addHeading(`Test Plan: ${title}`, 1);
    this.currentY += 5;
    
    // Add generation timestamp
    this.addText(`Generated on: ${new Date().toLocaleString()}`, {
      fontSize: 10,
      color: [128, 128, 128]
    });
    this.currentY += 10;

    // Parse and add content
    this.parseMarkdownContent(content);

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  generateQADocumentPDF(content: string, title: string): Blob {
    // Add title
    this.addHeading(`QA Document: ${title}`, 1);
    this.currentY += 5;
    
    // Add generation timestamp
    this.addText(`Generated on: ${new Date().toLocaleString()}`, {
      fontSize: 10,
      color: [128, 128, 128]
    });
    this.currentY += 10;

    // Parse and add content
    this.parseMarkdownContent(content);

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  generateFeatureManualPDF(content: string, title: string): Blob {
    // Add title
    this.addHeading(`Feature Manual: ${title}`, 1);
    this.currentY += 5;
    
    // Add generation timestamp
    this.addText(`Generated on: ${new Date().toLocaleString()}`, {
      fontSize: 10,
      color: [128, 128, 128]
    });
    this.currentY += 10;

    // Parse and add content
    this.parseMarkdownContent(content);

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  generateTestCasesPDF(testCases: TestCase[], title: string): Blob {
    // Add title
    this.addHeading(`Test Cases: ${title}`, 1);
    this.currentY += 5;
    
    // Add generation timestamp
    this.addText(`Generated on: ${new Date().toLocaleString()}`, {
      fontSize: 10,
      color: [128, 128, 128]
    });
    this.currentY += 10;

    // Add test cases
    testCases.forEach((tc, index) => {
      this.checkPageBreak(30); // Ensure enough space for test case
      
      this.addHeading(`Test Case ${index + 1}: ${tc.id}`, 3);
      
      // Priority
      this.addText(`Priority: ${tc.priority}`, { style: 'bold' });
      
      // Description
      this.addText('Description:', { style: 'bold' });
      this.addText(tc.description, { indent: 5 });
      this.currentY += 2;

      // Pre-conditions
      if (tc.preConditions.length > 0) {
        this.addText('Pre-conditions:', { style: 'bold' });
        tc.preConditions.forEach(pre => {
          this.addBulletPoint(pre, 5);
        });
        this.currentY += 2;
      }

      // Steps
      if (tc.steps.length > 0) {
        this.addText('Steps:', { style: 'bold' });
        tc.steps.forEach((step, stepIndex) => {
          this.addNumberedPoint(step, stepIndex + 1, 5);
        });
        this.currentY += 2;
      }

      // Expected Result
      this.addText('Expected Result:', { style: 'bold' });
      this.addText(tc.expectedResult, { indent: 5 });
      
      this.currentY += 8; // Space between test cases
    });

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  generateUserStoriesPDF(userStories: UserStory[], title: string): Blob {
    // Add title
    this.addHeading(`User Stories: ${title}`, 1);
    this.currentY += 5;
    
    // Add generation timestamp
    this.addText(`Generated on: ${new Date().toLocaleString()}`, {
      fontSize: 10,
      color: [128, 128, 128]
    });
    this.currentY += 10;

    // Add user stories
    userStories.forEach((story, index) => {
      this.checkPageBreak(25); // Ensure enough space for story
      
      this.addHeading(`User Story ${index + 1}`, 3);
      
      // Story text
      this.addText(story.story, { style: 'italic', fontSize: 13 });
      this.currentY += 5;

      // Acceptance Criteria
      if (story.acceptanceCriteria.length > 0) {
        this.addText('Acceptance Criteria:', { style: 'bold' });
        story.acceptanceCriteria.forEach(criterion => {
          this.addBulletPoint(criterion, 5);
        });
      }
      
      this.currentY += 8; // Space between stories
    });

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }
}

export const generatePDF = {
  testPlan: (content: string, title: string): Blob => {
    const generator = new PDFGenerator();
    return generator.generateTestPlanPDF(content, title);
  },
  
  qaDocument: (content: string, title: string): Blob => {
    const generator = new PDFGenerator();
    return generator.generateQADocumentPDF(content, title);
  },
  
  featureManual: (content: string, title: string): Blob => {
    const generator = new PDFGenerator();
    return generator.generateFeatureManualPDF(content, title);
  },
  
  testCases: (testCases: TestCase[], title: string): Blob => {
    const generator = new PDFGenerator();
    return generator.generateTestCasesPDF(testCases, title);
  },
  
  userStories: (userStories: UserStory[], title: string): Blob => {
    const generator = new PDFGenerator();
    return generator.generateUserStoriesPDF(userStories, title);
  }
};
