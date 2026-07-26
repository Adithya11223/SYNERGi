import React from 'react';
import { motion } from 'framer-motion';

interface LiveTranscriptProps {
  interimTranscript: string;
  finalTranscript: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ interimTranscript, finalTranscript }) => {
  const fullText = (finalTranscript + (finalTranscript && interimTranscript ? ' ' : '') + interimTranscript).trim();
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center gap-6">
      <div className="text-white/95 text-2xl sm:text-3xl leading-snug font-medium line-clamp-3 px-4 drop-shadow-lg text-center">
        {fullText || "Listening..."}
      </div>
    </motion.div>
  );
};
