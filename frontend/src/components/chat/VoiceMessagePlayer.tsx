import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
  waveformStr?: string;
  isMe?: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ audioUrl, duration, waveformStr, isMe = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(duration);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveform = waveformStr ? JSON.parse(waveformStr) as number[] : Array(40).fill(10);
  
  // Normalize waveform to 0-100% for height
  const maxAmp = Math.max(...waveform, 1);
  const normalizedWaveform = waveform.map(v => (v / maxAmp) * 100);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let isSubscribed = true;

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
        // Fallback: if loadedDuration is still 0 but we have a valid audio duration
        const activeDuration = loadedDuration > 0 ? loadedDuration : (audio.duration && audio.duration !== Infinity ? audio.duration : duration);
        if (activeDuration > 0) {
            setProgress((audio.currentTime / activeDuration) * 100);
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      if (audio && audio.duration && audio.duration !== Infinity) {
        setLoadedDuration(audio.duration);
      }
    };

    const initAudio = async () => {
      let resolvedUrl = audioUrl;
      
      // If it's a backend URL, append the Clerk token as a query parameter
      // to ensure native <audio> tags authenticate successfully.
      if (!resolvedUrl.startsWith('blob:') && !resolvedUrl.startsWith('data:')) {
        try {
          if (window.Clerk && window.Clerk.session) {
            const token = await window.Clerk.session.getToken();
            if (token) {
              resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + `access_token=${token}`;
            }
          }
        } catch (err) {
          console.warn("Failed to fetch token for audio playback", err);
        }
      }

      if (!isSubscribed) return;

      audio = new Audio(resolvedUrl);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Sync playback rate if already changed
      audio.playbackRate = playbackRate;
    };

    initAudio();

    return () => {
      isSubscribed = false;
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.pause();
      }
    };
  }, [audioUrl, duration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed", e);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    
    const activeDuration = loadedDuration > 0 ? loadedDuration : duration;
    if (activeDuration <= 0) return;

    const newTime = percentage * activeDuration;
    audioRef.current.currentTime = newTime;
    setProgress(percentage * 100);
    setCurrentTime(newTime);
  };

  const toggleSpeed = () => {
    const rates = [1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    setPlaybackRate(rates[(currentIndex + 1) % rates.length]);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 py-0.5 max-w-[300px] min-w-[240px]">
      <div className="relative">
        <button 
          onClick={togglePlay}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors hover:opacity-80`}
        >
          {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-[140px]">
        {/* Waveform visualizer */}
        <div 
          className="flex items-center gap-[2px] h-8 cursor-pointer relative group"
          onClick={handleSeek}
        >
          {normalizedWaveform.map((height, i) => {
            const isPlayed = (i / normalizedWaveform.length) * 100 <= progress;
            return (
              <div 
                key={i} 
                className={`w-[3px] rounded-full transition-colors ${
                  isPlayed 
                    ? (isMe ? 'bg-[#53bdeb]' : 'bg-primary') 
                    : (isMe ? 'bg-white/40' : 'bg-primary/30')
                }`}
                style={{ height: `${Math.max(height, 15)}%` }}
              />
            );
          })}
        </div>

        {/* Timers & Speed */}
        <div className="flex items-center justify-between mt-1 mb-2">
          <span className={`text-[11px] tracking-wide font-medium ${isMe ? 'text-white/70' : 'text-foreground/60'}`}>
            {isPlaying || progress > 0 ? formatTime(currentTime) : (loadedDuration > 0 ? formatTime(loadedDuration) : '--:--')}
          </span>
          <div className="flex items-center gap-1">
            {playbackRate !== 1 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isMe ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                {playbackRate}x
              </span>
            )}
            {/* Speed toggle area overlay */}
            <div 
              className="absolute right-2 top-2 w-8 h-8 cursor-pointer opacity-0"
              onClick={toggleSpeed}
              title="Change Speed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
