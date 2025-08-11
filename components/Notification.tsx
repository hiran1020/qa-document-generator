import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const SuccessIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  const baseClasses = 'fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-2xl z-50 flex items-start gap-4 transition-all duration-300 ease-in-out transform animate-slide-in';
  
  const typeClasses = isSuccess
    ? 'bg-green-600/90 backdrop-blur-sm border border-green-400/50 text-white'
    : 'bg-red-600/90 backdrop-blur-sm border border-red-400/50 text-white';

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <div className="flex-shrink-0">
        {isSuccess ? <SuccessIcon className="w-6 h-6" /> : <ErrorIcon className="w-6 h-6" />}
      </div>
      <div className="flex-1">
        <p className="font-bold text-base">{isSuccess ? 'Success' : 'Error'}</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="p-1 -m-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
      <style>{`
        @keyframes slide-in {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .animate-slide-in {
            animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
