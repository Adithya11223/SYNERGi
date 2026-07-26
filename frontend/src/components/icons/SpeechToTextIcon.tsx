
export const SpeechToTextIcon = ({ className = '', size = 24 }: { className?: string, size?: number }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="stt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c056fa" />
          <stop offset="100%" stopColor="#256bf4" />
        </linearGradient>
      </defs>
      
      {/* Speech Bubble Outline */}
      <path 
        d="M16 28a12 12 0 1 0-12-12c0 2.2.6 4.2 1.6 6L4 28l6.1-1.6A12 12 0 0 0 16 28Z" 
        stroke="url(#stt-gradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Mic Head */}
      <rect 
        x="13.5" 
        y="8" 
        width="5" 
        height="11" 
        rx="2.5" 
        fill="url(#stt-gradient)" 
      />
      
      {/* Mic Cradle */}
      <path 
        d="M10 16v1a6 6 0 0 0 12 0v-1" 
        stroke="url(#stt-gradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      
      {/* Mic Base Vertical */}
      <path 
        d="M16 23.5v-3.5" 
        stroke="url(#stt-gradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      
      {/* Mic Base Horizontal */}
      <path 
        d="M13 23.5h6" 
        stroke="url(#stt-gradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      
      {/* Sound Waves Left */}
      <path 
        d="M7.5 14v4" 
        stroke="url(#stt-gradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      
      {/* Sound Waves Right */}
      <path 
        d="M24.5 14v4" 
        stroke="url(#stt-gradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
};
