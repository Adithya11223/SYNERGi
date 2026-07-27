import React from 'react';
import { getImageUrl } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';

interface ImageBubbleProps {
  src: string;
  alt: string;
  isOptimistic?: boolean;
  timestamp?: string;
  isMe?: boolean;
  tickStatus?: 'sending' | 'failed' | 'sent' | 'delivered' | 'read';
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
  onClick,
  onError
}) => {
  const displaySrc = isOptimistic ? src : getImageUrl(src);

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer group bg-black/5 w-full max-w-[280px] sm:max-w-[320px]`}
      onClick={onClick}
    >
      <img 
        src={displaySrc} 
        alt={alt} 
        className="w-full h-auto object-cover max-h-[350px] rounded-lg" 
        loading="lazy" 
        onError={onError} 
      />
      
      {!isOptimistic && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
      )}

      {/* WhatsApp-style floating timestamp and ticks for image only messages */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full text-white shadow-sm">
        {timestamp && (
          <span className="text-[10px] font-medium leading-none mt-[1px]">
            {formatTime(timestamp)}
          </span>
        )}
        {isMe && tickStatus && (
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
