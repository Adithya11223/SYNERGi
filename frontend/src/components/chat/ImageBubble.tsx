import React from 'react';
import { getImageUrl } from '@/lib/utils';
import { Check, CheckCheck, X } from 'lucide-react';

interface ImageBubbleProps {
  src: string;
  alt: string;
  isOptimistic?: boolean;
  timestamp?: string;
  isMe?: boolean;
  tickStatus?: 'sending' | 'failed' | 'sent' | 'delivered' | 'read';
  isUploading?: boolean;
  uploadProgress?: number;
  onCancel?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  onError?: () => void;
}

const formatTime = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ImageBubble: React.FC<ImageBubbleProps> = ({
  src,
  alt,
  isOptimistic = false,
  timestamp,
  isMe = false,
  tickStatus,
  isUploading = false,
  uploadProgress = 0,
  onCancel,
  onClick,
  onError
}) => {
  const displaySrc = isOptimistic ? src : getImageUrl(src);

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer group bg-black/5 w-full max-w-[280px] sm:max-w-[320px] rounded-lg`}
      onClick={!isUploading ? onClick : undefined}
    >
      <img 
        src={displaySrc} 
        alt={alt} 
        className="w-full h-auto object-cover max-h-[350px] rounded-lg" 
        loading="lazy" 
        onError={onError} 
      />
      
      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="w-full h-full -rotate-90 transform text-white/20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
            </svg>
            <svg className="w-full h-full -rotate-90 transform text-white absolute inset-0" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" 
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - uploadProgress / 100)}`}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.(e);
              }}
              className="absolute bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isOptimistic && !isUploading && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
      )}

      {/* WhatsApp-style floating timestamp and ticks for image only messages */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full text-white shadow-sm z-10">
        {timestamp && (
          <span className="text-[10px] font-medium leading-none mt-[1px]">
            {formatTime(timestamp)}
          </span>
        )}
        {isMe && tickStatus && !isUploading && (
          <span className="text-white ml-0.5">
            {tickStatus === 'sent' && <Check className="w-3 h-3" />}
            {tickStatus === 'delivered' && <CheckCheck className="w-3 h-3" />}
            {tickStatus === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
            {tickStatus === 'sending' && <span className="w-3 h-3 block border-2 border-white/50 border-t-white rounded-full animate-spin" />}
            {tickStatus === 'failed' && <span className="w-3 h-3 block bg-red-500 rounded-full" />}
          </span>
        )}
      </div>
    </div>
  );
};
