
import React, { useState, useRef, useEffect } from 'react';
import { NotificationState } from '../App';

interface InputFormProps {
  description: string;
  setDescription: (description: string) => void;
  videoFiles: File[];
  setVideoFiles: (files: File[] | ((files: File[]) => File[])) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onNotify: (notification: NotificationState | null) => void;
}

const MAX_FILE_SIZE_MB = 250;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const VideoIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
);


export const InputForm: React.FC<InputFormProps> = ({ description, setDescription, videoFiles, setVideoFiles, onGenerate, isLoading, onNotify }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handlePaste = (event: ClipboardEvent) => {
        if (isLoading) return;
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                event.preventDefault();
                const file = items[i].getAsFile();
                if (!file) continue;

                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Data = e.target?.result as string;
                    if (!base64Data) return;

                    const img = document.createElement('img');
                    img.src = base64Data;
                    img.style.maxWidth = '90%';
                    img.style.maxHeight = '300px';
                    img.style.display = 'block';
                    img.style.margin = '0.5rem auto';
                    img.style.borderRadius = '0.5rem';

                    const selection = window.getSelection();
                    if (!selection || !selection.rangeCount) return;

                    const range = selection.getRangeAt(0);
                    if (!editor.contains(range.commonAncestorContainer)) return;

                    range.deleteContents();
                    
                    const fragment = document.createDocumentFragment();
                    const lastNode = document.createElement('br');
                    // Using a fragment is more efficient for multiple node insertions
                    fragment.appendChild(document.createElement('br'));
                    fragment.appendChild(img);
                    fragment.appendChild(lastNode);

                    range.insertNode(fragment);

                    // Move cursor after the inserted content
                    range.setStartAfter(lastNode);
                    range.collapse(true);

                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                };
                reader.readAsDataURL(file);
                return;
            }
        }
    };

    editor.addEventListener('paste', handlePaste);
    return () => editor.removeEventListener('paste', handlePaste);
  }, [isLoading]);

  useEffect(() => {
    if (editorRef.current && description !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = description;
    }
  }, [description]);


  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const largeFiles: string[] = [];
    const nonVideoFiles: string[] = [];

    for (const file of Array.from(files)) {
        if (!file.type.startsWith('video/')) {
            nonVideoFiles.push(file.name);
            continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            largeFiles.push(`${file.name} (${fileSizeMB}MB)`);
            continue;
        }
        newFiles.push(file);
    }
    
    if (largeFiles.length > 0) {
        const message = `The following files are too large (limit is ${MAX_FILE_SIZE_MB}MB): ${largeFiles.join(', ')}. Please split them into smaller chunks using a tool like QuickTime or Clipchamp.`;
        onNotify({ message, type: 'error' });
    }

    if (nonVideoFiles.length > 0) {
        const message = `The following files were ignored because they are not videos: ${nonVideoFiles.join(', ')}.`;
        onNotify({ message, type: 'error' });
    }

    if (newFiles.length > 0) {
      setVideoFiles(prevFiles => [...prevFiles, ...newFiles]);
    }

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
      setVideoFiles(currentFiles => currentFiles.filter((_, index) => index !== indexToRemove));
  };

  const isDescriptionEmpty = () => {
    if (!description) return true;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    // Considered non-empty if it has trimmed text OR an image tag.
    return !tempDiv.textContent?.trim() && !tempDiv.querySelector('img');
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-700/50">
      <label htmlFor="feature-description" className="block text-lg font-semibold text-slate-200 mb-2">
        Feature Description
      </label>
      <p className="text-sm text-slate-400 mb-4">
        Provide a detailed text description of the feature. This can be used alone or to add context to a video. You can paste images directly into the editor.
      </p>
      <div
        ref={editorRef}
        id="feature-description"
        contentEditable={!isLoading}
        onInput={(e) => {
            if (!isLoading) {
                setDescription(e.currentTarget.innerHTML);
            }
        }}
        data-placeholder="e.g., A user login system with email/password authentication... You can also paste images from your clipboard."
        className="w-full min-h-[9rem] max-h-96 p-4 bg-slate-900/70 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 text-slate-200 resize-y overflow-auto relative
                   empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 empty:before:absolute empty:before:left-4 empty:before:top-4 empty:before:pointer-events-none empty:before:not-focus"
        />

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink mx-4 text-slate-500 font-semibold tracking-wider">OR</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>
      
      <div>
        <label className="block text-lg font-semibold text-slate-200 mb-2">
            Upload Demo Video(s)
        </label>
        <p className="text-sm text-slate-400 mb-1">
            Upload screen recordings of the feature. For long videos, split them into smaller chunks and upload them together. Max file size per file: {MAX_FILE_SIZE_MB}MB.
        </p>
        <p className="text-sm text-amber-400/80 mb-4">
            Pro Tip: For best results and reliability, use shorter clips (ideally under 2-3 minutes each).
        </p>
        
        {videoFiles.length === 0 ? (
            <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
                    ${isDragging ? 'border-cyan-400 bg-cyan-500/20 scale-105' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800/80'}`}
            >
                <div className="text-center pointer-events-none">
                    <VideoIcon className="mx-auto h-12 w-12 text-slate-500 transition-transform duration-300" style={{ transform: isDragging ? 'translateY(-10px)' : 'translateY(0)'}} />
                    <p className="mt-2 text-slate-300"><span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">MP4, MOV, etc. (Max {MAX_FILE_SIZE_MB}MB per file)</p>
                </div>
            </div>
        ) : (
            <div className="space-y-3">
                 {videoFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between w-full h-16 p-3 bg-slate-900/70 border border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <VideoIcon className="h-6 w-6 text-cyan-400 flex-shrink-0" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-slate-200 truncate" title={file.name}>{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveFile(index)}
                            disabled={isLoading}
                            className="p-1.5 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200 disabled:opacity-50"
                            aria-label={`Remove ${file.name}`}
                        >
                            <XMarkIcon className="h-5 w-5"/>
                        </button>
                    </div>
                 ))}
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full text-center py-3 border-2 border-dashed border-slate-600 hover:border-cyan-500 hover:text-cyan-400 text-slate-400 rounded-lg transition-colors duration-200"
                 >
                    Add more files...
                 </button>
            </div>
        )}
        <input 
            type="file" 
            ref={fileInputRef}
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            accept="video/*"
            disabled={isLoading}
        />
      </div>

      <div className="mt-8 text-right">
        <button
          onClick={onGenerate}
          disabled={isLoading || (isDescriptionEmpty() && videoFiles.length === 0)}
          className="relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 group"
        >
          <span className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt disabled:hidden"></span>
          <span className="relative">
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </div>
            ) : (
              'Generate Documents'
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
