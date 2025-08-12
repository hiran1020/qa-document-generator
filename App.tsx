
import React, { useState, useCallback, useEffect } from 'react';

import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { GeneratedDocuments, HistoryItem, InputContentPart } from './types';
import { generateDocuments } from './services/geminiService';
import { Notification } from './components/Notification';

const LOCAL_STORAGE_KEY = 'qa-doc-history';

export interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

// A custom hook to synchronize state with localStorage.
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [isLoading, setIsLoading] = useState(true);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}


const App: React.FC = () => {
  const [description, setDescription] = useState<string>('');
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocuments | null>(null);
  
  const [history, setHistory, isHistoryLoading] = useLocalStorage<HistoryItem[]>(LOCAL_STORAGE_KEY, []);
  const [activeHistoryItemId, setActiveHistoryItemId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [progress, setProgress] = useState(0);

  const handleGenerate = useCallback(async () => {
    const parseHtmlToContentParts = (htmlString: string): InputContentPart[] => {
        if (!htmlString.trim()) return [];

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const parts: InputContentPart[] = [];
        
        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);

        let currentNode = walker.nextNode();
        while(currentNode) {
            if (currentNode.nodeName === 'IMG') {
                const img = currentNode as HTMLImageElement;
                const src = img.src;
                if (src.startsWith('data:image')) {
                    const [meta, base64Data] = src.split(',');
                    const mimeType = meta.substring(meta.indexOf(':') + 1, meta.indexOf(';'));
                    parts.push({ type: 'image', mimeType, base64Data });
                }
            } else if (currentNode.nodeType === Node.TEXT_NODE) {
                if (currentNode.textContent) {
                    parts.push({ type: 'text', content: currentNode.textContent });
                }
            } else if (['DIV', 'P', 'BR'].includes(currentNode.nodeName)) {
                // Represent block-level elements or line breaks with a newline character.
                parts.push({ type: 'text', content: '\n' });
            }
            currentNode = walker.nextNode();
        }

        // Consolidate consecutive text parts and clean up whitespace.
        return parts.reduce((acc, part) => {
            const lastPart = acc.length > 0 ? acc[acc.length - 1] : null;
            if (part.type === 'text' && lastPart && lastPart.type === 'text') {
                lastPart.content += part.content;
            } else {
                acc.push(part);
            }
            return acc;
        }, [] as InputContentPart[]).filter(p => p.type === 'image' || (p.type === 'text' && p.content.trim() !== ''));
    };

    const contentParts = parseHtmlToContentParts(description);

    if (contentParts.length === 0 && videoFiles.length === 0) {
      setNotification({ message: 'Please provide a feature description or upload a demo video.', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setNotification(null);
    setDocuments(null);
    setActiveHistoryItemId(null);
    setProgress(0);
    
    let aggregatedDocuments: GeneratedDocuments | null = null;

    try {
      if (videoFiles.length > 0) {
        for (const [index, file] of videoFiles.entries()) {
          const progressStart = (index / videoFiles.length) * 100;
          setProgress(progressStart);
          setLoadingMessage(`Processing video ${index + 1} of ${videoFiles.length}: ${file.name}`);

          const result = await generateDocuments(contentParts, file, aggregatedDocuments);
          aggregatedDocuments = result;
          
          const progressEnd = ((index + 1) / videoFiles.length) * 100;
          setProgress(progressEnd);
        }
      } else if (contentParts.length > 0) {
        setLoadingMessage('Generating documents from description...');
        setProgress(50);
        aggregatedDocuments = await generateDocuments(contentParts, null, null);
        setProgress(100);
      }

      if (!aggregatedDocuments) {
        throw new Error("Document generation failed to produce a result.");
      }

      setDocuments(aggregatedDocuments);
      
      let title: string;
      if (videoFiles.length > 0) {
        title = `${videoFiles.length} Video Session`;
      } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        const textContent = tempDiv.textContent || '';
        title = textContent.length > 40 ? `${textContent.substring(0, 40)}...` : (textContent || 'New Session');
      }

      const newHistoryItem: HistoryItem = {
          id: `session-${Date.now()}`,
          title,
          timestamp: Date.now(),
          documents: aggregatedDocuments,
      };
      
      setHistory(prev => [newHistoryItem, ...prev]);
      setActiveHistoryItemId(newHistoryItem.id);
      setNotification({ message: 'Documents generated successfully!', type: 'success' });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setNotification({ message: errorMessage, type: 'error' });
      console.error(e);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => setProgress(0), 1500);
    }
  }, [description, videoFiles, setHistory]);
  
  const handleSelectHistory = (item: HistoryItem) => {
      setDocuments(item.documents);
      setActiveHistoryItemId(item.id);
      setDescription('');
      setVideoFiles([]);
      setNotification(null);
      setIsLoading(false);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
      window.scrollTo(0,0);
  };
  
  const handleNewSession = () => {
      setDocuments(null);
      setActiveHistoryItemId(null);
      setDescription('');
      setVideoFiles([]);
      setNotification(null);
      setIsLoading(false);
      setIsSidebarOpen(false); // Close sidebar on mobile
  };
  
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all saved sessions from your browser? This cannot be undone.")) {
        setHistory([]);
        handleNewSession();
    }
  };

  const activeHistoryItem = history.find(item => item.id === activeHistoryItemId);
  const documentTitle = activeHistoryItem?.title ?? "Generated Documents";

  return (
    <div className="relative min-h-screen md:flex bg-slate-900 text-slate-100 font-sans">
        {notification && (
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
            />
        )}
        <HistorySidebar 
            history={history}
            activeItemId={activeHistoryItemId}
            onSelectItem={handleSelectHistory}
            onNewSession={handleNewSession}
            onClearHistory={handleClearHistory}
            isLoading={isHistoryLoading}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
             <Header onMenuClick={() => setIsSidebarOpen(true)} />
             <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                    <main>
                    <InputForm
                        description={description}
                        setDescription={setDescription}
                        videoFiles={videoFiles}
                        setVideoFiles={setVideoFiles}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        onNotify={setNotification}
                    />
                    <OutputDisplay
                        documents={documents}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        progress={progress}
                        documentTitle={documentTitle}
                    />
                    </main>
                    <footer className="text-center mt-12 text-slate-500 text-sm">
                        <p>Powered by Google Gemini. UI/UX designed for production-readiness. Created BY: Hiran Basnet</p>
                    </footer>
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;
