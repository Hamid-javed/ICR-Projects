import { useEffect } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Snackbar({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}: SnackbarProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-[#2CF0FA] to-[#00FFB4]';
      case 'error':
        return 'bg-gradient-to-r from-[#F05CE6] to-[#893DE6]';
      case 'info':
        return 'bg-gradient-to-r from-[#2CF0FA] to-[#893DE6]';
      default:
        return 'bg-gradient-to-r from-[#2CF0FA] to-[#00FFB4]';
    }
  };

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${poppins.className}`}>
      <div 
        className={`${getBackgroundColor()} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[300px] max-w-[90vw]`}
        style={{
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <span className="flex-1 text-center">{message}</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 