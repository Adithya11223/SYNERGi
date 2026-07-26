import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# 1. We will completely rewrite the file to ensure no syntax errors.
new_content = """import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const isStoppingRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Refs for animation without React rerenders
  const audioLevelRef = useRef(1);
  const smoothedLevelRef = useRef(1);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  
  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // CSS/Ref based animation loop for the waveform orb (0 React rerenders!)
  useEffect(() => {
    let animationFrame: number;
    const smoothAudio = () => {
      const diff = audioLevelRef.current - smoothedLevelRef.current;
      smoothedLevelRef.current += diff * 0.15;
      
      if (orbContainerRef.current) {
        orbContainerRef.current.style.transform = `scale(${smoothedLevelRef.current})`;
      }
      
      animationFrame = requestAnimationFrame(smoothAudio);
    };
    
    if (state === 'recording') {
      animationFrame = requestAnimationFrame(smoothAudio);
    } else {
      smoothedLevelRef.current = 1;
      audioLevelRef.current = 1;
      if (orbContainerRef.current) {
        orbContainerRef.current.style.transform = `scale(1)`;
      }
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [state]);

  // Idle audio pulse purely using refs
  useEffect(() => {
    let interval: any;
    if (state === 'recording') {
      interval = setInterval(() => {
        if (!interimTranscript) {
          audioLevelRef.current = 1 + Math.random() * 0.2;
        }
      }, 600);
    }
    return () => clearInterval(interval);
  }, [state, interimTranscript]);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
      setState('idle');
      setTranscript('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      audioLevelRef.current = 1;
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
    };
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

  const handleStartRecording = async () => {
    try {
      setTranscript('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      setErrorMsg('');
      isStoppingRef.current = false;
      audioLevelRef.current = 1;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setState('error');
        setErrorMsg('Speech recognition is not supported in this browser.');
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // CRITICAL FIX: Stop the raw MediaStream immediately!
        // This frees the hardware microphone so SpeechRecognition can bind to it.
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        setState('error');
        setErrorMsg('Microphone access denied. Please allow microphone access in your browser settings.');
        return;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      recognition.maxAlternatives = 1;

      let lastInterim = '';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        
        if (final) {
          finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + final;
          setTranscript(finalTranscriptRef.current);
        }
        
        if (interim !== lastInterim) {
          setInterimTranscript(interim);
          lastInterim = interim;
        }
        
        // Update audio ref instead of triggering a React render
        audioLevelRef.current = 1 + Math.min(interim.length / 5, 1.2); 
        setTimeout(() => { audioLevelRef.current = 1 + Math.random() * 0.2; }, 200);
      };

      recognition.onerror = (event: any) => {
        if (isStoppingRef.current) return;
        
        if (event.error === 'not-allowed') {
          setState('error');
          setErrorMsg('Microphone access denied.');
        } else if (event.error === 'network') {
          setState('error');
          setErrorMsg('Network error occurred.');
        } else if (event.error !== 'no-speech') {
          setState('error');
          setErrorMsg('Error recognizing speech: ' + event.error);
        }
      };

      recognition.onend = () => {
        if (isStoppingRef.current) {
          setTranscript(finalTranscriptRef.current);
          setInterimTranscript('');
          setState('processing');
          setTimeout(() => {
            setState('ready');
          }, 500);
        } else if (stateRef.current === 'recording') {
          try { recognition.start(); } catch(e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setState('recording');
    } catch (e) {
      setState('error');
      setErrorMsg('Failed to start recording.');
    }
  };

  const handleStopRecording = () => {
    isStoppingRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop(); 
    } else if (state === 'recording') {
      setState('processing');
      setTimeout(() => setState('ready'), 500);
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

  const renderPerplexityOrb = () => {
    const isRecording = state === 'recording';
    const isProcessing = state === 'processing';
    
    const staticScale = isProcessing ? 1.05 : 1;
    const speed = isRecording ? 0.4 : (isProcessing ? 0.6 : 1.2);

    return (
      <div 
        className="relative flex items-center justify-center group cursor-pointer w-40 h-40 mx-auto"
        onClick={isRecording ? undefined : handleStartRecording}
        style={{ perspective: '1000px' }}
      >
       {/* Container handles dynamic waveform scaling natively without React renders */}
       <div ref={orbContainerRef} className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-75">
        <motion.div
          className="absolute inset-0 rounded-full blur-[40px] bg-cyan-500/30 group-hover:bg-cyan-500/40 transition-colors"
          animate={{ scale: [1, 1.3 * staticScale, 1] }}
          transition={{ duration: 2 * speed, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <motion.div
          className="absolute w-14 h-14 rounded-full z-10 flex items-center justify-center overflow-hidden"
          animate={{ scale: [1, 1.2 * staticScale, 1] }}
          transition={{ duration: 1.5 * speed, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'radial-gradient(circle at 35% 25%, #ffffff 0%, #f8fafc 40%, #cbd5e1 100%)',
            boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.15), inset 5px 5px 10px rgba(255,255,255,1), 0 0 35px #22d3ee'
          }}
        >
          {isProcessing ? (
             <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin" />
          ) : (
             <img 
               src="/synergi-icon.png" 
               alt="SYNERGi" 
               className="w-full h-full object-cover scale-[1.2] origin-center mix-blend-multiply" 
             />
          )}
        </motion.div>

        <motion.div
          className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-cyan-400/90 border-b-cyan-400/90 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 180],
            scale: [1, 1.05 * staticScale, 1]
          }}
          transition={{
            rotateX: { duration: 4 * speed, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 6 * speed, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2 * speed, repeat: Infinity, ease: 'easeInOut' }
          }}
        />

        <motion.div
          className="absolute inset-4 rounded-full border-[2px] border-transparent border-r-teal-300/80 border-l-teal-300/80 shadow-[0_0_15px_rgba(94,234,212,0.4)] z-20 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [180, -180],
            rotateY: [0, 360],
            rotateZ: [0, 90],
            scale: [1, 1.1 * staticScale, 1]
          }}
          transition={{
            rotateX: { duration: 5 * speed, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 4.5 * speed, repeat: Infinity, ease: 'linear' },
            rotateZ: { duration: 7 * speed, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2.2 * speed, repeat: Infinity, ease: 'easeInOut' }
          }}
        />

        <motion.div
          className="absolute inset-6 rounded-full border-[2px] border-transparent border-t-blue-400/80 border-b-blue-400/80 shadow-[0_0_15px_rgba(96,165,250,0.4)] z-20 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [0, -360],
            rotateY: [360, 0],
            rotateZ: [360, 0],
            scale: [1, 1.15 * staticScale, 1]
          }}
          transition={{
            rotateX: { duration: 5.5 * speed, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 3.5 * speed, repeat: Infinity, ease: 'linear' },
            rotateZ: { duration: 6 * speed, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.8 * speed, repeat: Infinity, ease: 'easeInOut' }
          }}
        />
       </div>
      </div>
    );
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

            {/* IDLE / RECORDING / PROCESSING STATES */}
            {(state === 'idle' || state === 'recording' || state === 'processing') && (
              <div className="flex flex-col items-center justify-center w-full">
                {renderPerplexityOrb()}

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
                  
                  {state === 'recording' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center gap-6">
                      <div className="text-white/95 text-2xl sm:text-3xl leading-snug font-medium line-clamp-3 px-4 drop-shadow-lg">
                        {(transcript + (transcript && interimTranscript ? ' ' : '') + interimTranscript) || "Listening..."}
                      </div>
                      
                      {/* Cancel & Stop Circular Buttons */}
                      <div className="flex items-center gap-6 mt-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setState('idle'); setTranscript(''); setInterimTranscript(''); handleStopRecording(); }}
                          className="w-14 h-14 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 flex items-center justify-center text-white/70 hover:text-red-400 transition-all backdrop-blur-md shadow-lg hover:scale-105"
                          title="Cancel"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStopRecording(); }}
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
            {state === 'ready' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col w-full items-center">
                
                <div className="w-full relative group flex justify-center">
                  <textarea
                    ref={textareaRef}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
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
                    onClick={() => setState('idle')}
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
                  onClick={() => setState('idle')}
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
"""

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(new_content)

print("Applied fix for microphone lock and rerenders successfully.")
