import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import type { SpeechState } from '../../../services/SpeechRecognitionService';

interface WaveformVisualizerProps {
  state: SpeechState;
  onStart: () => void;
  interimLength: number; // to drive audio reactivity
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ state, onStart, interimLength }) => {
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const audioLevelRef = useRef(1);
  const smoothedLevelRef = useRef(1);

  // Audio reactivity loop (0 React rerenders)
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

  // Update audio level based on incoming text length (simulate audio)
  useEffect(() => {
    if (state === 'recording') {
      audioLevelRef.current = 1 + Math.min(interimLength / 5, 1.2); 
      const timeout = setTimeout(() => { 
          audioLevelRef.current = 1 + Math.random() * 0.2; 
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [interimLength, state]);

  // Idle pulse
  useEffect(() => {
    let interval: any;
    if (state === 'recording') {
      interval = setInterval(() => {
        if (interimLength === 0) {
          audioLevelRef.current = 1 + Math.random() * 0.2;
        }
      }, 600);
    }
    return () => clearInterval(interval);
  }, [state, interimLength]);

  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  
  const staticScale = isProcessing ? 1.05 : 1;
  const speed = isRecording ? 0.4 : (isProcessing ? 0.6 : 1.2);

  return (
    <div 
      className="relative flex items-center justify-center group cursor-pointer w-40 h-40 mx-auto"
      onClick={isRecording || isProcessing ? undefined : onStart}
      style={{ perspective: '1000px' }}
    >
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
