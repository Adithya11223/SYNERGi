import re

content = """import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Square, Send, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SpeechToTextIcon } from '../icons/SpeechToTextIcon';

interface SpeechToTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

type STTState = 'idle' | 'recording' | 'processing' | 'ready' | 'error';

export const SpeechToTextModal: React.FC<SpeechToTextModalProps> = ({ isOpen, onClose, onSend }) => {
  const [state, setState] = useState<STTState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [audioLevel, setAudioLevel] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      handleStopRecording();
      setState('idle');
      setTranscript('');
      setInterimTranscript('');
      setTimer(0);
      return;
    }

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState('error');
      setErrorMsg('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        setTranscript((prev) => prev + (prev ? ' ' : '') + final);
      }
      setInterimTranscript(interim);
      
      // Simulate audio level spikes based on interim transcript length
      setAudioLevel(1 + Math.min(interim.length / 10, 0.5));
      setTimeout(() => setAudioLevel(1), 300);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setState('error');
        setErrorMsg('Microphone access denied.');
      } else if (event.error === 'network') {
        setState('error');
        setErrorMsg('Network error occurred.');
      } else {
        setState('error');
        setErrorMsg('Error recognizing speech. Please try again.');
      }
      handleStopRecording();
    };

    recognition.onend = () => {
      if (state === 'recording') {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      handleStopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (state === 'ready' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [transcript, state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Enter' && !e.shiftKey && state === 'ready') {
          e.preventDefault();
          handleSend();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, state, transcript, onClose]);

  const handleStartRecording = () => {
    try {
      setTranscript('');
      setInterimTranscript('');
      setTimer(0);
      setErrorMsg('');
      recognitionRef.current?.start();
      setState('recording');
      
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
        
        // Random audio level fluctuation if no words detected
        setAudioLevel(1 + Math.random() * 0.15);
      }, 500);
    } catch (e) {
      console.error(e);
      setState('error');
      setErrorMsg('Failed to start recording.');
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      rec.onend = null; 
      rec.stop();
    }
    
    if (state === 'recording') {
      setState('processing');
      setTimeout(() => {
        setState('ready');
      }, 800);
    }
  };

  const handleSend = () => {
    const finalContent = transcript.trim();
    if (!finalContent) {
      toast.error('No speech detected.');
      return;
    }
    setState('processing');
    onSend(finalContent);
    onClose();
  };

  const renderSiriOrb = () => {
    const isRecording = state === 'recording';
    const isProcessing = state === 'processing';
    
    return (
      <div 
        className="relative flex items-center justify-center my-6 group cursor-pointer w-40 h-40 mx-auto"
        onClick={isRecording ? handleStopRecording : handleStartRecording}
      >
        {/* Core Glow */}
        <motion.div 
          className="absolute inset-0 rounded-full blur-[30px] opacity-70"
          animate={{
            scale: isRecording ? [1, 1.2 * audioLevel, 1] : (isProcessing ? [1, 1.1, 1] : 1),
            opacity: isRecording ? [0.6, 1, 0.6] : 0.4,
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: isRecording ? 0.5 : 2, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: isRecording ? 1 : 3, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 10, repeat: Infinity, ease: 'linear' }
          }}
          style={{
            background: 'conic-gradient(from 0deg, #4f46e5, #ec4899, #8b5cf6, #3b82f6, #4f46e5)'
          }}
        />

        {/* Secondary Inner Glow */}
        <motion.div 
          className="absolute inset-4 rounded-full blur-[15px] opacity-90 mix-blend-screen"
          animate={{
            rotate: [360, 0],
            scale: isRecording ? [1, 1.3 * audioLevel, 1] : 1,
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
            scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            background: 'conic-gradient(from 180deg, #ec4899, #8b5cf6, #3b82f6, #ec4899)'
          }}
        />

        {/* Floating particles/blobs for Siri effect */}
        {isRecording && (
          <>
            <motion.div
              className="absolute w-12 h-12 rounded-full bg-cyan-400 blur-[12px] opacity-60 mix-blend-plus-lighter"
              animate={{
                x: [-10, 15, -10],
                y: [-15, 10, -15],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-10 h-10 rounded-full bg-pink-500 blur-[10px] opacity-60 mix-blend-plus-lighter"
              animate={{
                x: [15, -15, 15],
                y: [10, -10, 10],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Dark Glass Core */}
        <div className="absolute inset-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] group-hover:bg-black/30 transition-colors z-10">
          {isProcessing ? (
            <RefreshCw className="w-8 h-8 text-white animate-spin opacity-80" />
          ) : (
            <SpeechToTextIcon size={40} className={`text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-transform duration-300 ${isRecording ? 'scale-110' : 'scale-100'}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-[500px] left-0 right-0 bottom-0 z-40 bg-background/50 backdrop-blur-sm rounded-3xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-[80px] left-4 right-4 z-50 bg-[#0c1015]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ maxWidth: '420px', margin: '0 auto' }}
          >
            {/* Top Shine highlight */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 relative z-10">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Intelligence
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white bg-black/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 pb-6 relative z-10">
              
              {/* IDLE / RECORDING / PROCESSING STATES */}
              {(state === 'idle' || state === 'recording' || state === 'processing') && (
                <div className="flex flex-col items-center justify-center py-2">
                  
                  {renderSiriOrb()}

                  <div className="h-[80px] flex flex-col items-center justify-center text-center w-full">
                    {state === 'idle' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/60 font-medium tracking-wide">
                        Tap the orb to start speaking
                      </motion.div>
                    )}
                    
                    {state === 'recording' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                        <div className="text-white/90 text-lg leading-snug font-medium mb-1 line-clamp-2 px-2">
                          {interimTranscript || transcript || "I'm listening..."}
                        </div>
                        <div className="text-purple-400/80 text-xs font-medium uppercase tracking-wider animate-pulse">
                          Recording
                        </div>
                      </motion.div>
                    )}

                    {state === 'processing' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 font-medium">
                        Transcribing your voice...
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* READY STATE (EDITABLE) */}
              {state === 'ready' && (
                <div className="flex flex-col py-4 mt-2">
                  <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-inner mb-6 relative group">
                    <textarea
                      ref={textareaRef}
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="w-full bg-transparent text-[16px] leading-relaxed text-white/90 focus:outline-none resize-none custom-scrollbar min-h-[80px]"
                      rows={3}
                      placeholder="Your message..."
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={handleStartRecording} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white/70 hover:text-white transition-colors" title="Retake">
                         <RefreshCw className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setState('idle')}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white/70 font-medium text-sm backdrop-blur-md"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSend}
                      className="flex-[2] py-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-white font-semibold text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              )}

              {/* ERROR STATE */}
              {state === 'error' && (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-white/80 font-medium text-center px-4">{errorMsg}</p>
                  <button 
                    onClick={() => setState('idle')}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium text-sm"
                  >
                    Go Back
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
"""

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)

print("Updated SpeechToTextModal.tsx to Siri style")
