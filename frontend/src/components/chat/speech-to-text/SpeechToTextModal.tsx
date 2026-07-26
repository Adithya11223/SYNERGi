import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { SpeechRecognitionService, type SpeechState } from '../../../services/SpeechRecognitionService';
import { WaveformVisualizer } from './WaveformVisualizer';
import { LiveTranscript } from './LiveTranscript';

interface SpeechToTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

export const SpeechToTextModal: React.FC<SpeechToTextModalProps> = ({ isOpen, onClose, onSend }) => {
  const [state, setState] = useState<SpeechState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editableText, setEditableText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    SpeechRecognitionService.initialize({
      onStateChange: (newState) => {
        setState(newState);
        if (newState === 'processing') {
          // Auto-transition to ready state after short delay
          setTimeout(() => {
            setState('ready' as any); // local state extension
          }, 500);
        }
      },
      onResult: (interim, final) => {
        setInterimTranscript(interim);
        setFinalTranscript(final);
        setEditableText(final);
      },
      onError: (msg) => {
        setErrorMsg(msg);
      }
    });

    return () => {
      SpeechRecognitionService.removeCallbacks();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      SpeechRecognitionService.abort();
      setState('idle');
      setInterimTranscript('');
      setFinalTranscript('');
      setEditableText('');
      setErrorMsg('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Dynamically adjust textarea height
    if (state === ('ready' as any) && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [editableText, state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Enter' && !e.shiftKey && state === ('ready' as any)) {
          e.preventDefault();
          handleSend();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, state, editableText, onClose]);

  const handleStart = () => {
    SpeechRecognitionService.start();
  };

  const handleStop = () => {
    SpeechRecognitionService.stop();
  };

  const handleCancel = () => {
    SpeechRecognitionService.abort();
    setState('idle');
    setInterimTranscript('');
    setFinalTranscript('');
    setEditableText('');
  };

  const handleSend = () => {
    const finalContent = editableText.trim();
    if (!finalContent) {
      toast.error('No speech detected.');
      return;
    }
    onSend(finalContent);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[99999] flex flex-col items-center justify-center p-6">
          
          {/* Full Container Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-[#0c1015]/70 backdrop-blur-3xl"
            onClick={onClose}
          />

          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Floating UI Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl flex flex-col items-center"
          >
            {/* SYNERGi Intelligence Title */}
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="flex items-center gap-3 mb-10 drop-shadow-xl"
            >
               <Sparkles className="w-6 h-6 text-cyan-400" />
               <h2 className="text-white text-2xl font-semibold tracking-wide">SYNERGi Intelligence</h2>
            </motion.div>

            {/* IDLE / STARTING / RECORDING / PROCESSING */}
            {(state === 'idle' || state === 'starting' || state === 'recording' || state === 'processing') && (
              <div className="flex flex-col items-center justify-center w-full">
                <WaveformVisualizer 
                   state={state} 
                   onStart={handleStart} 
                   interimLength={interimTranscript.length}
                />

                <div className="flex flex-col items-center justify-center text-center w-full mt-8 min-h-[120px]">
                  {state === 'idle' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
                      <div className="text-white/60 text-lg font-medium tracking-wide">
                        Tap the orb to start speaking
                      </div>
                      <button 
                        onClick={onClose}
                        className="py-3 px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/70 hover:text-white font-medium text-sm backdrop-blur-md"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}

                  {state === 'starting' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-lg font-medium tracking-wide mt-4">
                      Starting engine...
                    </motion.div>
                  )}
                  
                  {state === 'recording' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center gap-6">
                      <LiveTranscript interimTranscript={interimTranscript} finalTranscript={finalTranscript} />
                      
                      {/* Cancel & Stop Circular Buttons */}
                      <div className="flex items-center gap-6 mt-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                          className="w-14 h-14 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 flex items-center justify-center text-white/70 hover:text-red-400 transition-all backdrop-blur-md shadow-lg hover:scale-105"
                          title="Cancel"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStop(); }}
                          className="w-16 h-16 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400 transition-all backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-105"
                          title="Stop Recording"
                        >
                          <div className="w-5 h-5 bg-cyan-400 rounded-sm" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {state === 'processing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-lg font-medium tracking-wide mt-4">
                      Processing...
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* READY STATE (Full text appears, editable, send/cancel options) */}
            {state === ('ready' as any) && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col w-full items-center">
                
                <div className="w-full relative group flex justify-center">
                  <textarea
                    ref={textareaRef}
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    className="w-full bg-transparent text-2xl sm:text-3xl text-center leading-relaxed text-white/95 focus:outline-none resize-none custom-scrollbar min-h-[150px] max-h-[400px] border-b border-transparent focus:border-cyan-500/50 transition-colors px-8 py-4"
                    placeholder="Your message..."
                  />
                  {/* Subtle hint that it's editable */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-white/30 text-xs tracking-widest uppercase font-bold">
                    Edit
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-12 w-full max-w-md justify-center">
                  <button 
                    onClick={handleCancel}
                    className="py-4 px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/80 font-medium text-base backdrop-blur-md shadow-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSend}
                    className="flex-1 py-4 px-8 flex items-center justify-center gap-3 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-all text-[#0c1015] font-bold text-base shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:-translate-y-1"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {state === 'error' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 gap-6 w-full">
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)] border border-red-500/30">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-white/90 font-medium text-center px-4 text-xl leading-relaxed">{errorMsg}</p>
                <button 
                  onClick={handleCancel}
                  className="mt-4 px-10 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white font-semibold shadow-lg text-lg backdrop-blur-md"
                >
                  Go Back
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById('chat-area-container') || document.body
  );
};
