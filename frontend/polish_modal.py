import re

content = """import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
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
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [audioLevel, setAudioLevel] = useState(1);
  const [smoothedLevel, setSmoothedLevel] = useState(1);

  // Audio level smoothing for fluid animations
  useEffect(() => {
    let animationFrame: number;
    const smoothAudio = () => {
      setSmoothedLevel(prev => {
        const diff = audioLevel - prev;
        return prev + diff * 0.15; // smooth easing
      });
      animationFrame = requestAnimationFrame(smoothAudio);
    };
    if (state === 'recording') {
      animationFrame = requestAnimationFrame(smoothAudio);
    } else {
      setSmoothedLevel(1);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [audioLevel, state]);

  // Simulate ambient audio fluctuations when recording but no speech detected yet
  useEffect(() => {
    let interval: any;
    if (state === 'recording') {
      interval = setInterval(() => {
        if (!interimTranscript) {
          setAudioLevel(1 + Math.random() * 0.2); // subtle breathing
        }
      }, 600);
    }
    return () => clearInterval(interval);
  }, [state, interimTranscript]);

  useEffect(() => {
    if (!isOpen) {
      handleStopRecording();
      setState('idle');
      setTranscript('');
      setInterimTranscript('');
      return;
    }

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
      
      // Spikes based on speaking volume (simulated via transcript length changes)
      setAudioLevel(1 + Math.min(interim.length / 5, 1.2)); 
      setTimeout(() => setAudioLevel(1 + Math.random() * 0.2), 200);
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
        try { recognition.start(); } catch(e) {}
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
      setErrorMsg('');
      recognitionRef.current?.start();
      setState('recording');
    } catch (e) {
      console.error(e);
      setState('error');
      setErrorMsg('Failed to start recording.');
    }
  };

  const handleStopRecording = () => {
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
    
    const scaleMult = isRecording ? smoothedLevel : (isProcessing ? 1.05 : 1);
    const speed = isRecording ? 0.3 : (isProcessing ? 0.6 : 1.2);

    return (
      <div 
        className="relative flex items-center justify-center my-6 group cursor-pointer w-48 h-48 mx-auto"
        onClick={isRecording ? handleStopRecording : handleStartRecording}
      >
        {/* Outer Halo */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-50 blur-[40px]"
          animate={{
            scale: [1, 1.15 * scaleMult, 1],
            opacity: isRecording ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3],
            rotate: [0, 360],
          }}
          transition={{ 
            scale: { duration: 4 * speed, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 3 * speed, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 15 * speed, repeat: Infinity, ease: 'linear' }
          }}
          style={{ background: 'conic-gradient(from 0deg, #3b82f6, #ec4899, #8b5cf6, #3b82f6)' }}
        />
        
        {/* The Liquid Container */}
        <motion.div 
          className="absolute inset-2 rounded-full overflow-hidden bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-[inset_0_0_40px_rgba(255,255,255,0.15)] group-hover:border-white/30 transition-colors z-10"
          animate={{ scale: [1, 1.05 * scaleMult, 1] }}
          transition={{ duration: 2 * speed, repeat: Infinity, ease: 'easeInOut' }}
        >
          
          {/* Blob 1: Cyan/Blue */}
          <motion.div
            className="absolute w-44 h-44 bg-blue-500/90 rounded-full mix-blend-screen blur-[20px]"
            animate={{
              x: ['-20%', '30%', '-20%'],
              y: ['-20%', '20%', '-20%'],
              scale: [1, 1.3 * scaleMult, 1],
            }}
            transition={{ duration: 5 * speed, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Blob 2: Magenta/Pink */}
          <motion.div
            className="absolute w-36 h-36 bg-pink-500/90 rounded-full mix-blend-screen blur-[20px]"
            animate={{
              x: ['30%', '-30%', '30%'],
              y: ['-30%', '10%', '-30%'],
              scale: [1, 1.4 * scaleMult, 1],
            }}
            transition={{ duration: 4.5 * speed, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Blob 3: Violet/Purple */}
          <motion.div
            className="absolute w-40 h-40 bg-purple-500/90 rounded-full mix-blend-screen blur-[20px]"
            animate={{
              x: ['-10%', '20%', '-10%'],
              y: ['20%', '-20%', '20%'],
              scale: [1, 1.5 * scaleMult, 1],
            }}
            transition={{ duration: 6 * speed, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Blob 4: Light Cyan/White (Highlight) */}
          <motion.div
            className="absolute w-28 h-28 bg-cyan-300/90 rounded-full mix-blend-screen blur-[15px]"
            animate={{
              x: ['20%', '-20%', '20%'],
              y: ['20%', '-20%', '20%'],
              scale: [1, 1.2 * scaleMult, 1],
            }}
            transition={{ duration: 3.5 * speed, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Core Reflections for Depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 z-10 pointer-events-none mix-blend-overlay" />
          
          {/* Center Icon */}
          <div className="relative z-20 flex items-center justify-center drop-shadow-2xl">
            {isProcessing ? (
              <RefreshCw className="w-10 h-10 text-white animate-spin drop-shadow-[0_0_15px_rgba(255,255,255,1)]" />
            ) : (
              <SpeechToTextIcon size={52} className={`text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] transition-transform duration-300 ${isRecording ? 'scale-110' : 'scale-100'}`} />
            )}
          </div>
        </motion.div>
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
            transition={{ duration: 0.3 }}
            className="absolute -top-[600px] left-0 right-0 bottom-0 z-40 bg-black/60 backdrop-blur-md rounded-3xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-[80px] left-4 right-4 z-50 bg-[#0c1015]/70 backdrop-blur-3xl border border-white/15 rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{ maxWidth: '420px', margin: '0 auto' }}
          >
            {/* Ambient Modal Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 relative z-10">
              <div>
                <h3 className="text-white/90 font-semibold flex items-center gap-2 tracking-wide">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Intelligence
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/15 transition-colors text-white/50 hover:text-white bg-white/5 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 pb-8 relative z-10">
              
              {/* IDLE / RECORDING / PROCESSING STATES */}
              {(state === 'idle' || state === 'recording' || state === 'processing') && (
                <div className="flex flex-col items-center justify-center py-2">
                  
                  {renderSiriOrb()}

                  <div className="h-[90px] flex flex-col items-center justify-center text-center w-full">
                    {state === 'idle' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/60 font-medium tracking-wide">
                        Tap the orb to start speaking
                      </motion.div>
                    )}
                    
                    {state === 'recording' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                        <div className="text-white/90 text-[19px] leading-snug font-medium mb-2 line-clamp-2 px-2 drop-shadow-md">
                          {interimTranscript || transcript || "I'm listening..."}
                        </div>
                        <div className="text-pink-400/90 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                          Recording
                        </div>
                      </motion.div>
                    )}

                    {state === 'processing' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 font-medium tracking-wide">
                        Transcribing your voice...
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* READY STATE (EDITABLE) */}
              {state === 'ready' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col py-4 mt-2">
                  <div className="bg-black/40 backdrop-blur-2xl rounded-2xl p-5 border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] mb-6 relative group transition-all focus-within:border-white/20 focus-within:bg-black/50">
                    <textarea
                      ref={textareaRef}
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="w-full bg-transparent text-[16px] leading-relaxed text-white/95 focus:outline-none resize-none custom-scrollbar min-h-[90px]"
                      rows={3}
                      placeholder="Your message..."
                    />
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={handleStartRecording} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/80 hover:text-white transition-colors backdrop-blur-md" title="Retake">
                         <RefreshCw className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setState('idle')}
                      className="flex-1 py-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-white/80 font-medium text-sm backdrop-blur-md"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSend}
                      className="flex-[2] py-3.5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-white font-semibold text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ERROR STATE */}
              {state === 'error' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 gap-5">
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <p className="text-white/90 font-medium text-center px-4 text-lg">{errorMsg}</p>
                  <button 
                    onClick={() => setState('idle')}
                    className="mt-2 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium shadow-lg"
                  >
                    Go Back
                  </button>
                </motion.div>
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

print("Updated SpeechToTextModal.tsx to Ultra-polished Siri style")
