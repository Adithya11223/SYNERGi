import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Pause, Play, Activity } from 'lucide-react';
import { useCallStore } from '@/store/useCallStore';
import { getImageUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CallTimer = () => {
  const callStartTime = useCallStore(state => state.callStartTime);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!callStartTime) {
      setDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);
    setDuration(Math.floor((Date.now() - callStartTime) / 1000));
    return () => clearInterval(interval);
  }, [callStartTime]);

  const h = Math.floor(duration / 3600);
  const m = Math.floor((duration % 3600) / 60);
  const s = duration % 60;
  if (h > 0) return <>{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</>;
  return <>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</>;
};

export const DynamicIslandCall = () => {
  const {
    callState, activePeer, isMuted, isOnHold, isSpeakerOn,
    answerCall, rejectCall, endCall, toggleMute, toggleHold, toggleSpeaker, isCaller
  } = useCallStore(useShallow(state => ({
    callState: state.callState, activePeer: state.activePeer, isMuted: state.isMuted,
    isOnHold: state.isOnHold, isSpeakerOn: state.isSpeakerOn, answerCall: state.answerCall,
    rejectCall: state.rejectCall, endCall: state.endCall, toggleMute: state.toggleMute,
    toggleHold: state.toggleHold, toggleSpeaker: state.toggleSpeaker, isCaller: state.isCaller
  })));

  const [expanded, setExpanded] = useState(false);

  // Auto-expand on incoming/outgoing
  const isIncoming = !isCaller && ['RINGING', 'WAITING', 'INITIATED'].includes(callState);
  const isCalling = isCaller && ['INITIATED', 'RINGING', 'WAITING'].includes(callState);
  const isConnected = ['CONNECTED'].includes(callState);
  const isConnecting = ['ACCEPTED', 'CONNECTING', 'NEGOTIATING', 'ICE_GATHERING', 'ICE_CONNECTED', 'RECONNECTING'].includes(callState);

  useEffect(() => {
    if (isIncoming || isCalling) {
      setExpanded(true);
    } else if (isConnected) {
      // Auto-collapse when connected after a short delay
      const timer = setTimeout(() => setExpanded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isIncoming, isCalling, isConnected]);

  if (callState === 'IDLE' || !activePeer) return null;

  const peerName = activePeer?.name ?? 'Unknown';
  const peerAvatar = activePeer?.profileUrl ? getImageUrl(activePeer.profileUrl) : null;

  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center z-[99999] px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            layoutId="dynamic-island"
            initial={{ opacity: 0, y: -20, scale: 0.95, borderRadius: 32 }}
            animate={{ opacity: 1, y: 0, scale: 1, borderRadius: 32 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[340px] bg-black text-white p-4 shadow-2xl flex flex-col gap-4 pointer-events-auto border border-white/10"
            onClick={(e) => e.stopPropagation()} // Prevent collapse if clicking inside
          >
            {/* Header / Info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 rounded-full border border-white/20 shadow-sm shrink-0">
                <AvatarImage src={peerAvatar || ''} />
                <AvatarFallback className="bg-zinc-800">{peerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold truncate">{peerName}</span>
                <span className="text-xs text-zinc-400">
                  {isIncoming ? 'Incoming Call...' :
                   isCalling ? 'Calling...' :
                   isConnecting ? 'Connecting...' :
                   isConnected ? <CallTimer /> :
                   callState}
                </span>
              </div>
              {/* Collapse button if connected */}
              {isConnected && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 active:scale-95"
                >
                  <Activity className="w-4 h-4 text-zinc-300" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-evenly pt-2 pb-1 gap-2">
              {isIncoming ? (
                <>
                  <button onClick={(e) => { e.stopPropagation(); rejectCall?.(); }} className="flex-1 max-w-[100px] h-11 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center active:scale-95 transition-all">
                    <PhoneOff className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); answerCall?.(); }} className="flex-1 max-w-[100px] h-11 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center active:scale-95 transition-all animate-pulse">
                    <Phone className="w-5 h-5 text-white" />
                  </button>
                </>
              ) : (
                <>
                  {/* Connected Controls */}
                  {isConnected && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); toggleMute?.(); }} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${isMuted ? 'bg-white text-black' : 'bg-white/15 text-white'}`}>
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleSpeaker?.(); }} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${isSpeakerOn ? 'bg-white text-black' : 'bg-white/15 text-white'}`}>
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleHold?.(); }} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${isOnHold ? 'bg-white text-black' : 'bg-white/15 text-white'}`}>
                        {isOnHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      </button>
                    </>
                  )}
                  {/* End Call is available for calling and connected states */}
                  <button onClick={(e) => { e.stopPropagation(); endCall?.(); }} className="w-16 h-11 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center active:scale-95 transition-all ml-auto">
                    <PhoneOff className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            layoutId="dynamic-island"
            initial={{ opacity: 0, y: -20, scale: 0.95, borderRadius: 9999 }}
            animate={{ opacity: 1, y: 0, scale: 1, borderRadius: 9999 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="h-10 bg-black text-white px-2 py-1 shadow-2xl flex items-center gap-3 pointer-events-auto cursor-pointer border border-white/10"
            onClick={() => setExpanded(true)}
          >
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7 rounded-full border border-white/20">
                <AvatarImage src={peerAvatar || ''} />
                <AvatarFallback className="bg-zinc-800 text-[10px]">{peerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 pr-3">
                <Activity className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400 font-mono tracking-tight">
                  <CallTimer />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
