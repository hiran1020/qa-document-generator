
import React, { useState } from 'react';
import JSZip from 'jszip';
import { GeneratedDocuments, TestCase, UserStory } from '../types';
import { Tab } from './Tab';
import { generatePDF } from '../services/pdfService';

interface OutputDisplayProps {
  documents: GeneratedDocuments | null;
  isLoading: boolean;
  progress: number;
  loadingMessage: string;
  documentTitle: string;
}

type ActiveTab = 'plan' | 'qa' | 'manual' | 'cases' | 'stories' | 'smoke' | 'regression';

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.5a1.125 1.125 0 0 1 1.125-1.125h7.5a.75.75 0 0 1 0 1.5h-7.5a.375.375 0 0 0-.375.375v9.75c0 .207.168.375.375.375h9.75a.375.375 0 0 0 .375-.375V17.25a.75.75 0 0 1 1.5 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6h-4.5a1.5 1.5 0 0 0-1.5 1.5v4.5a1.5 1.5 0 0 0 1.5 1.5h4.5a1.5 1.5 0 0 0 1.5-1.5V7.5a1.5 1.5 0 0 0-1.5-1.5Z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const DownloadZipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2.5 4.75A.75.75 0 0 1 3.25 4h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 2.5 4.75Z" />
      <path fillRule="evenodd" d="M8.25 3.5A1.75 1.75 0 0 0 6.5 5.25v2.25H4.326a2.25 2.25 0 0 0-1.743.832L.52 11.256A1.5 1.5 0 0 0 1.83 13.5h5.594A4.502 4.502 0 0 1 12.5 15.25a.75.75 0 0 0 1.5 0A.75.75 0 0 0 14 14.5a3 3 0 0 0-2.343-2.918l.09-.057a.75.75 0 0 0 .343-1.018l-.796-1.38a.75.75 0 0 0-1.018-.343l-.796 1.38a3.003 3.003 0 0 0-2.433-1.482V5.25A.25.25 0 0 1 6.75 5h1.5a.75.75 0 0 0 0-1.5h-1.5Z" clipRule="evenodd" />
      <path d="m12.31 8.22 3.25-3.25a.75.75 0 0 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06ZM14.75 16a.75.75 0 0 1-.75-.75V10.5a.75.75 0 0 1 1.5 0v4.75a.75.75 0 0 1-.75-.75Z" />
    </svg>
);

const PDFIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);


const DocumentViewer: React.FC<{ content: string }> = ({ content }) => {
    const renderContent = () => {
        return content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold mt-6 mb-3 text-sky-300 border-b-2 border-sky-300/30 pb-2">{line.substring(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold mt-5 mb-2 text-sky-400">{line.substring(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-slate-200">{line.substring(4)}</h3>;
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) return <li key={index} className="ml-6 my-1 list-disc text-slate-300">{line.substring(line.indexOf(trimmedLine.charAt(0)) + 1).trim()}</li>;
            if (trimmedLine.match(/^\d+\./)) return <li key={index} className="ml-6 my-1 list-decimal text-slate-300">{line.substring(line.indexOf('.') + 1).trim()}</li>;
            
             // Apply inline formatting for bold, italic, code
            const applyInlineFormatting = (text: string) => {
                const parts = text
                    .replace(/`([^`]+)`/g, '<code class="bg-slate-700/50 text-amber-300 font-mono py-0.5 px-1.5 rounded-md text-sm">$1</code>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                return <span dangerouslySetInnerHTML={{ __html: parts }} />;
            };
            
            return <p key={index} className="text-slate-300 leading-relaxed my-2">{line ? applyInlineFormatting(line) : '\u00A0'}</p>;
        });
    };

    return <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-sky-400 prose-li:text-slate-300">{renderContent()}</div>
};

const TestCasesTable: React.FC<{ testCases: TestCase[] }> = ({ testCases }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-700">
    <table className="min-w-full divide-y divide-slate-700">
      <thead className="bg-slate-800/70">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Priority</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Description</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Pre-conditions</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Steps</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Expected Result</th>
        </tr>
      </thead>
      <tbody className="bg-slate-900/50 divide-y divide-slate-800">
        {testCases.map((tc, index) => (
          <tr key={tc.id} className={`transition-colors duration-200 hover:bg-slate-700/50 ${index % 2 === 0 ? 'bg-slate-800/40' : ''}`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-top">
                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tc.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                    tc.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-green-500/20 text-green-300'
                }`}>
                    {tc.priority}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-400 align-top">{tc.id}</td>
            <td className="px-6 py-4 whitespace-normal text-sm text-slate-300 max-w-xs align-top">{tc.description}</td>
            <td className="px-6 py-4 whitespace-normal text-sm text-slate-300 align-top">
              <ul className="list-disc list-inside space-y-1">
                {tc.preConditions.map((pre, i) => <li key={i}>{pre}</li>)}
              </ul>
            </td>
            <td className="px-6 py-4 whitespace-normal text-sm text-slate-300 align-top">
              <ol className="list-decimal list-inside space-y-1">
                {tc.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </td>
            <td className="px-6 py-4 whitespace-normal text-sm text-slate-300 align-top">{tc.expectedResult}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const UserStoriesDisplay: React.FC<{ stories: UserStory[] }> = ({ stories }) => (
    <div className="space-y-6">
        {stories.map((story, index) => (
            <div key={index} className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/80 shadow-md">
                <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-slate-200 text-lg">
                    {story.story}
                </blockquote>
                <h4 className="mt-4 mb-2 text-md font-semibold text-slate-200 uppercase tracking-wider">Acceptance Criteria</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    {story.acceptanceCriteria.map((criterion, i) => <li key={i} className="pl-2">{criterion}</li>)}
                </ul>
            </div>
        ))}
    </div>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ documents, isLoading, progress, loadingMessage, documentTitle }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('plan');
  const [isCopied, setIsCopied] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const sanitizeForFilename = (name: string) => {
    return name.replace(/[\s\\/:"*?<>|]+/g, '_').replace(/_{2,}/g, '_');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
      if (!documents) return;
      
      const baseName = sanitizeForFilename(documentTitle);

      const escapeCsvCell = (data: any): string => {
        const str = String(data || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      switch(activeTab) {
          case 'plan':
              downloadBlob(new Blob([documents.testPlan], { type: 'text/markdown;charset=utf-8' }), `${baseName}_Test-Plan.md`);
              break;
          case 'qa':
              downloadBlob(new Blob([documents.qaDocument], { type: 'text/markdown;charset=utf-8' }), `${baseName}_QA-Document.md`);
              break;
          case 'manual':
              downloadBlob(new Blob([documents.featureManual], { type: 'text/markdown;charset=utf-8' }), `${baseName}_Feature-Manual.md`);
              break;
          case 'cases':
              const header = 'Priority,ID,Description,Pre-conditions,Steps,Expected Result\n';
              const csvRows = documents.testCases.map(tc => {
                const preCondsFormatted = tc.preConditions.map(pre => `- ${pre}`).join('\n');
                const stepsFormatted = tc.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
                return [
                    escapeCsvCell(tc.priority),
                    escapeCsvCell(tc.id),
                    escapeCsvCell(tc.description),
                    escapeCsvCell(preCondsFormatted),
                    escapeCsvCell(stepsFormatted),
                    escapeCsvCell(tc.expectedResult)
                ].join(',');
              });
              downloadBlob(new Blob([header + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' }), `${baseName}_Test-Cases.csv`);
              break;
          case 'stories':
              const storiesMd = documents.userStories.map(s => 
                  `> ${s.story}\n\n**Acceptance Criteria:**\n${s.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}`
              ).join('\n\n---\n\n');
              downloadBlob(new Blob([storiesMd], { type: 'text/markdown;charset=utf-8' }), `${baseName}_User-Stories.md`);
              break;
          case 'smoke':
              downloadBlob(new Blob([documents.smokeTestSuite], { type: 'text/markdown;charset=utf-8' }), `${baseName}_Smoke-Test-Suite.md`);
              break;
          case 'regression':
              downloadBlob(new Blob([documents.regressionTestPlan], { type: 'text/markdown;charset=utf-8' }), `${baseName}_Regression-Test-Plan.md`);
              break;
      }
  };

  const handleDownloadPDF = async () => {
      if (!documents || isPdfGenerating) return;
      
      const baseName = sanitizeForFilename(documentTitle);
      setIsPdfGenerating(true);

      try {
          let pdfBlob: Blob;

          switch(activeTab) {
              case 'plan':
                  pdfBlob = generatePDF.testPlan(documents.testPlan, baseName);
                  downloadBlob(pdfBlob, `${baseName}_Test-Plan.pdf`);
                  break;
              case 'qa':
                  pdfBlob = generatePDF.qaDocument(documents.qaDocument, baseName);
                  downloadBlob(pdfBlob, `${baseName}_QA-Document.pdf`);
                  break;
              case 'manual':
                  pdfBlob = generatePDF.featureManual(documents.featureManual, baseName);
                  downloadBlob(pdfBlob, `${baseName}_Feature-Manual.pdf`);
                  break;
              case 'cases':
                  pdfBlob = generatePDF.testCases(documents.testCases, baseName);
                  downloadBlob(pdfBlob, `${baseName}_Test-Cases.pdf`);
                  break;
              case 'stories':
                  pdfBlob = generatePDF.userStories(documents.userStories, baseName);
                  downloadBlob(pdfBlob, `${baseName}_User-Stories.pdf`);
                  break;
              case 'smoke':
                  pdfBlob = generatePDF.smokeTestSuite(documents.smokeTestSuite, baseName);
                  downloadBlob(pdfBlob, `${baseName}_Smoke-Test-Suite.pdf`);
                  break;
              case 'regression':
                  pdfBlob = generatePDF.regressionTestPlan(documents.regressionTestPlan, baseName);
                  downloadBlob(pdfBlob, `${baseName}_Regression-Test-Plan.pdf`);
                  break;
          }
      } catch (error) {
          console.error('Error generating PDF:', error);
          alert('Failed to generate PDF. Please try again.');
      } finally {
          setIsPdfGenerating(false);
      }
  };
  
  const handleCopy = async () => {
    if (!documents) return;

    let contentToCopy = '';
    switch(activeTab) {
        case 'plan': contentToCopy = documents.testPlan; break;
        case 'qa': contentToCopy = documents.qaDocument; break;
        case 'manual': contentToCopy = documents.featureManual; break;
        case 'cases':
            const headers = ['Priority', 'ID', 'Description', 'Pre-conditions', 'Steps', 'Expected Result'];
            const headerMd = `| ${headers.join(' | ')} |`;
            const separatorMd = `| ${headers.map(() => '---').join(' | ')} |`;
            
            // Helper to make content safe for Markdown table cells, especially for Notion
            const cleanCellForNotion = (text: string) => {
                return (text || '')
                    .replace(/\|/g, '\\|') // Escape pipe characters
                    .replace(/\r?\n/g, '<br />'); // Replace newlines with <br> for Notion
            };

            const rowsMd = documents.testCases.map(tc => {
                // Format lists into single strings with <br /> for Notion compatibility
                const preConds = tc.preConditions.map(p => `- ${p}`).join('<br />');
                const steps = tc.steps.map((s, i) => `${i + 1}. ${s}`).join('<br />');
        
                const rowData = [
                    cleanCellForNotion(tc.priority),
                    cleanCellForNotion(tc.id),
                    cleanCellForNotion(tc.description),
                    cleanCellForNotion(preConds),
                    cleanCellForNotion(steps),
                    cleanCellForNotion(tc.expectedResult)
                ];
                return `| ${rowData.join(' | ')} |`;
            }).join('\n');
            contentToCopy = `${headerMd}\n${separatorMd}\n${rowsMd}`;
            break;
        case 'stories':
             contentToCopy = documents.userStories.map(s => 
                `> ${s.story}\n\n**Acceptance Criteria:**\n${s.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}`
            ).join('\n\n---\n\n');
            break;
        case 'smoke':
            contentToCopy = documents.smokeTestSuite;
            break;
        case 'regression':
            contentToCopy = documents.regressionTestPlan;
            break;
    }
    try {
        await navigator.clipboard.writeText(contentToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy content.');
    }
  };

  const handleDownloadZip = async () => {
    if (!documents) return;
    const zip = new JSZip();
    const baseName = sanitizeForFilename(documentTitle);

    // Create folders for organized structure
    const markdownFolder = zip.folder("Markdown_CSV");
    const pdfFolder = zip.folder("PDF");

    // Add Markdown files to the Markdown_CSV folder
    markdownFolder?.file(`${baseName}_Test-Plan.md`, documents.testPlan);
    markdownFolder?.file(`${baseName}_QA-Document.md`, documents.qaDocument);
    markdownFolder?.file(`${baseName}_Feature-Manual.md`, documents.featureManual);
    markdownFolder?.file(`${baseName}_Smoke-Test-Suite.md`, documents.smokeTestSuite);
    markdownFolder?.file(`${baseName}_Regression-Test-Plan.md`, documents.regressionTestPlan);

    // Add User Stories MD to the Markdown_CSV folder
    const storiesMd = documents.userStories.map(s => `> ${s.story}\n\n**Acceptance Criteria:**\n${s.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}`).join('\n\n---\n\n');
    markdownFolder?.file(`${baseName}_User-Stories.md`, storiesMd);
    
    // Add Test Cases CSV to the Markdown_CSV folder (not PDF folder)
    const escapeCsvCell = (data: any) => {
        const str = String(data || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    const csvHeader = 'Priority,ID,Description,Pre-conditions,Steps,Expected Result\n';
    const csvRows = documents.testCases.map(tc => [escapeCsvCell(tc.priority), escapeCsvCell(tc.id), escapeCsvCell(tc.description), escapeCsvCell(tc.preConditions.map(pre => `- ${pre}`).join('\n')), escapeCsvCell(tc.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')), escapeCsvCell(tc.expectedResult)].join(','));
    markdownFolder?.file(`${baseName}_Test-Cases.csv`, csvHeader + csvRows.join('\n'));

    // Add PDF files to the PDF folder
    try {
      const testPlanPdf = generatePDF.testPlan(documents.testPlan, baseName);
      const qaDocPdf = generatePDF.qaDocument(documents.qaDocument, baseName);
      const manualPdf = generatePDF.featureManual(documents.featureManual, baseName);
      const testCasesPdf = generatePDF.testCases(documents.testCases, baseName);
      const userStoriesPdf = generatePDF.userStories(documents.userStories, baseName);
      const smokeTestSuitePdf = generatePDF.smokeTestSuite(documents.smokeTestSuite, baseName);
      const regressionTestPlanPdf = generatePDF.regressionTestPlan(documents.regressionTestPlan, baseName);

      // Convert blobs to ArrayBuffer for JSZip and add to PDF folder
      pdfFolder?.file(`${baseName}_Test-Plan.pdf`, await testPlanPdf.arrayBuffer());
      pdfFolder?.file(`${baseName}_QA-Document.pdf`, await qaDocPdf.arrayBuffer());
      pdfFolder?.file(`${baseName}_Feature-Manual.pdf`, await manualPdf.arrayBuffer());
      pdfFolder?.file(`${baseName}_Test-Cases.pdf`, await testCasesPdf.arrayBuffer());
      pdfFolder?.file(`${baseName}_User-Stories.pdf`, await userStoriesPdf.arrayBuffer());
      pdfFolder?.file(`${baseName}_Smoke-Test-Suite.pdf`, await smokeTestSuitePdf.arrayBuffer());
      pdfFolder?.file(`${baseName}_Regression-Test-Plan.pdf`, await regressionTestPlanPdf.arrayBuffer());
    } catch (error) {
      console.error('Error generating PDFs for ZIP:', error);
      alert('Warning: Some PDFs could not be generated for the ZIP file.');
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${baseName}_QA-Documents.zip`);
};

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col justify-center items-center h-64 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <p className="text-lg text-slate-300 mb-4 truncate max-w-full px-4">{loadingMessage || 'Generating documents...'}</p>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2.5 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progress}%`}}
            ></div>
        </div>
        <p className="mt-2 text-sm text-cyan-400 font-mono">{Math.round(progress)}%</p>
      </div>
    );
  }

  if (!documents) {
    return (
        <div className="mt-8 flex justify-center items-center h-64 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50">
            <div className="text-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M3.75 6.75h16.5M3.75 9.75h16.5m-16.5 3h16.5m-16.5 3h16.5M5.25 4.5h13.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25-2.25H5.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25Z" />
                </svg>
                <p className="text-lg font-semibold text-slate-400">Your documents will appear here</p>
                <p className="mt-1 text-sm">Provide a description or video and click "Generate Documents".</p>
            </div>
        </div>
    );
  }

  return (
    <div className="mt-8 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
      <div className="p-4 sm:p-6 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto overflow-x-auto">
          <nav className="flex space-x-2" aria-label="Tabs">
            <Tab label="Test Plan" isActive={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
            <Tab label="QA Doc" isActive={activeTab === 'qa'} onClick={() => setActiveTab('qa')} />
            <Tab label="Manual" isActive={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />
            <Tab label="Test Cases" isActive={activeTab === 'cases'} onClick={() => setActiveTab('cases')} />
            <Tab label="User Stories" isActive={activeTab === 'stories'} onClick={() => setActiveTab('stories')} />
            <Tab label="Smoke Tests" isActive={activeTab === 'smoke'} onClick={() => setActiveTab('smoke')} />
            <Tab label="Regression" isActive={activeTab === 'regression'} onClick={() => setActiveTab('regression')} />
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0 self-end sm:self-center">
           <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500">
             {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
             <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy'}</span>
           </button>
           <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500">
             <DownloadIcon className="w-4 h-4" />
             <span className="hidden sm:inline">Download</span>
           </button>
           <button onClick={handleDownloadPDF} disabled={isPdfGenerating} className="flex items-center gap-2 px-3 py-1.5 bg-red-600/50 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-red-100 hover:text-white disabled:text-slate-400 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500">
             {isPdfGenerating ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <PDFIcon className="w-4 h-4" />
             )}
             <span className="hidden sm:inline">{isPdfGenerating ? 'Generating...' : 'PDF'}</span>
           </button>
            <button onClick={handleDownloadZip} className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600/50 hover:bg-cyan-600 text-cyan-100 hover:text-white font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500">
             <DownloadZipIcon className="w-4 h-4" />
             <span className="hidden sm:inline">All (.zip)</span>
           </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'plan' && <DocumentViewer content={documents.testPlan} />}
        {activeTab === 'qa' && <DocumentViewer content={documents.qaDocument} />}
        {activeTab === 'manual' && <DocumentViewer content={documents.featureManual} />}
        {activeTab === 'cases' && <TestCasesTable testCases={documents.testCases} />}
        {activeTab === 'stories' && <UserStoriesDisplay stories={documents.userStories} />}
        {activeTab === 'smoke' && <DocumentViewer content={documents.smokeTestSuite} />}
        {activeTab === 'regression' && <DocumentViewer content={documents.regressionTestPlan} />}
      </div>
    </div>
  );
};
