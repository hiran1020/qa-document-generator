# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Features

- **QA Document Generation**: Generate comprehensive test plans, QA documents, feature manuals, test cases, user stories, and accessibility checklists
- **Multiple Export Formats**: Download individual documents as Markdown, CSV (for test cases), or **PDF format**
- **Bulk Download**: Download all documents at once in a ZIP file (includes both Markdown and PDF versions)
- **Video Analysis**: Upload demo videos for AI analysis and documentation generation
- **Copy to Clipboard**: Easy copying of formatted content for external tools

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## New PDF Download Feature

The application now supports downloading individual documents in PDF format:

- Click the **"Download PDF"** button (red button) to download the currently viewed document as a formatted PDF
- The PDF includes proper formatting, headings, bullet points, and structured layouts
- Test cases, user stories, and accessibility checklists are formatted as structured documents
- All PDFs include generation timestamps and proper document titles

### PDF Features:
- Professional formatting with proper typography
- Automatic page breaks and pagination
- Structured layouts for different document types
- Support for headers, bullet points, and numbered lists
- Proper spacing and margins for readability
