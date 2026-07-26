import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

split_index = content.find("  const renderPerplexityOrb = () => {")

new_logic = """import React, { useState, useEffect, useRef } from 'react';
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

let renderCount = 0;

export const SpeechToTextModal: React.FC<SpeechToTextModalProps> = ({ isOpen, onClose, onSend }) => {
  renderCount++;
  
  const [testMode, setTestMode] = useState<'A' | 'B'>('B');
  
  const [state, setState] = useState<STTState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const isStoppingRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const audioLevelRef = useRef(1);
  const smoothedLevelRef = useRef(1);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  
  const stateRef = useRef(state);
  
  const logEvent = (name: string, extra?: any) => {
      console.log(`[${performance.now().toFixed(1)}ms] ${name}`, extra || '');
  };

  useEffect(() => {
    const handleToggle = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 't') {
        setTestMode(prev => {
           const next = prev === 'A' ? 'B' : 'A';
           toast.success(`Switched to Test Mode ${next} (${next === 'A' ? 'Leave stream open' : 'Stop stream tracks'})`);
           return next;
        });
      }
    };
    window.addEventListener('keydown', handleToggle);
    return () => window.removeEventListener('keydown', handleToggle);
  }, []);

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
      console.log("\\n\\n===== SPEECH DEBUG START =====");
      logEvent(`Total Renders before start: ${renderCount}`);
      logEvent(`Running in Test Mode ${testMode}: ${testMode === 'A' ? 'Leave stream open' : 'Stop tracks immediately'}`);
      
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
        logEvent("Requesting getUserMedia...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        logEvent("Permission granted. MediaStream active.");
        
        if (testMode === 'B') {
           logEvent("Test B: Stopping all tracks on stream to release microphone lock.");
           stream.getTracks().forEach(track => track.stop());
        } else {
           logEvent("Test A: Leaving stream tracks alive and locking the microphone.");
        }
      } catch (err: any) {
        logEvent("Permission denied");
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

      recognition.onstart = () => logEvent("onstart fired");
      recognition.onaudiostart = () => logEvent("onaudiostart fired");
      recognition.onsoundstart = () => logEvent("onsoundstart fired");
      recognition.onspeechstart = () => logEvent("onspeechstart fired");
      recognition.onspeechend = () => logEvent("onspeechend fired");
      recognition.onsoundend = () => logEvent("onsoundend fired");
      recognition.onaudioend = () => logEvent("onaudioend fired");
      recognition.onnomatch = () => logEvent("onnomatch fired");

      recognition.onresult = (event: any) => {
        logEvent("onresult fired");
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
          logEvent("Final transcript extracted:", final);
          finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + final;
          setTranscript(finalTranscriptRef.current);
        }
        
        if (interim !== lastInterim) {
          logEvent("Interim transcript updated:", interim);
          setInterimTranscript(interim);
          lastInterim = interim;
        }
        
        audioLevelRef.current = 1 + Math.min(interim.length / 5, 1.2); 
        setTimeout(() => { audioLevelRef.current = 1 + Math.random() * 0.2; }, 200);
      };

      recognition.onerror = (event: any) => {
        logEvent(`onerror fired: ${event.error}`);
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
        logEvent("onend fired");
        if (isStoppingRef.current) {
          logEvent("Restart blocked because stop was user initiated.");
          setTranscript(finalTranscriptRef.current);
          setInterimTranscript('');
          setState('processing');
          setTimeout(() => {
            setState('ready');
          }, 500);
        } else if (stateRef.current === 'recording') {
          logEvent("Engine stopped unexpectedly. Auto-restarting...");
          try { recognition.start(); } catch(e) {}
        }
        
        logEvent(`Total Renders after stop: ${renderCount}`);
      };

      recognitionRef.current = recognition;
      logEvent("Calling recognition.start()...");
      recognition.start();
      setState('recording');
    } catch (e) {
      logEvent("Failed to start recording", e);
      setState('error');
      setErrorMsg('Failed to start recording.');
    }
  };

  const handleStopRecording = () => {
    logEvent("USER PRESSED STOP");
    isStoppingRef.current = true;
    if (recognitionRef.current) {
      logEvent("Calling recognition.stop()");
      recognitionRef.current.stop(); 
    } else if (state === 'recording') {
      setState('processing');
      setTimeout(() => setState('ready'), 500);
    }
  };

"""

if split_index != -1:
    ui_logic = content[split_index:]
    final_content = new_logic + ui_logic
    with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
        f.write(final_content)
    print("Rewritten STT logic successfully.")
else:
    print("Could not find renderPerplexityOrb function")
