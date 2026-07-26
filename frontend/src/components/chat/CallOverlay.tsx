// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneOff, Mic, MicOff, User,
  Volume2, Pause, Play, UserPlus, Search,
  SignalHigh, Maximize2, Minimize2, Building2, Loader2, Activity, Settings, Check, Mic2
} from 'lucide-react';
import { useCallStore } from '@/store/useCallStore';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const CallTimer = () => {
  const callStartTime = useCallStore(state => state.callStartTime);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
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

  return <>{formatDuration(duration)}</>;
};

const NetworkQualityIndicator = () => {
  const stats = useCallStore(state => state.networkStats);
  if (!stats) return null;

  const color = {
    Excellent: 'text-green-500 bg-green-500/10 border-green-500/20',
    Good: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Fair: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Poor: 'text-red-500 bg-red-500/10 border-red-500/20'
  }[stats.quality];

  const tooltip = `RTT: ${stats.rtt}ms | Jitter: ${stats.jitter}ms | Loss: ${stats.packetLoss.toFixed(1)}% | Bitrate: ${stats.bitrate}kbps`;

  return (
    <div title={tooltip} className={`flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border cursor-help transition-colors ${color}`}>
      <Activity className="w-3 h-3" /> 
      {stats.quality}
      {stats.relayUsed && <span className="opacity-75">(Relayed)</span>}
    </div>
  );
};

const DeviceSettings = () => {
  const { microphones, speakers } = useMediaDevices();
  const selectedMic = useCallStore(s => s.selectedMicrophoneId);
  const selectedSpeaker = useCallStore(s => s.selectedSpeakerId);
  const switchMicrophone = useCallStore(s => s.switchMicrophone);
  const switchSpeaker = useCallStore(s => s.switchSpeaker);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-2 focus:outline-none group">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 transition-all border border-white/10 text-white shadow-sm backdrop-blur-2xl active:scale-[0.85]">
            <Settings className="w-7 h-7 text-white drop-shadow-md" />
          </div>
          <span className="text-[13px] font-medium text-white drop-shadow-md">
            audio
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-zinc-900/95 border-zinc-800 text-zinc-100 backdrop-blur-xl shadow-2xl rounded-xl" sideOffset={12}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5"><Mic2 className="w-3.5 h-3.5" /> Microphone</h4>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {microphones.length === 0 ? <span className="text-[11px] text-zinc-500 px-2">No microphones found</span> : null}
              {microphones.map(m => (
                <button 
                  key={m.deviceId} 
                  onClick={() => switchMicrophone?.(m.deviceId)}
                  className={`text-[12px] text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors ${selectedMic === m.deviceId || (selectedMic === null && m.deviceId === 'default') ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-zinc-800 text-zinc-300'}`}
                >
                  <span className="truncate pr-2">{m.label || 'Default Microphone'}</span>
                  {(selectedMic === m.deviceId || (selectedMic === null && m.deviceId === 'default')) && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Speaker</h4>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {speakers.length === 0 ? <span className="text-[11px] text-zinc-500 px-2">No speakers found</span> : null}
              {speakers.map(s => (
                <button 
                  key={s.deviceId} 
                  onClick={() => switchSpeaker(s.deviceId)}
                  className={`text-[12px] text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors ${selectedSpeaker === s.deviceId || (selectedSpeaker === null && s.deviceId === 'default') ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-zinc-800 text-zinc-300'}`}
                >
                  <span className="truncate pr-2">{s.label || 'Default Speaker'}</span>
                  {(selectedSpeaker === s.deviceId || (selectedSpeaker === null && s.deviceId === 'default')) && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({
  icon: Icon,
  label,
  onClick,
  variant = 'glass',
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: 'glass' | 'green' | 'red' | 'active';
}) {
  const base = 'flex flex-col items-center gap-2 cursor-pointer select-none';
  const btnClass = {
    glass: 'w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-[0.85] hover:brightness-110 shadow-sm',
    green: 'w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-[0.85] hover:brightness-110 bg-[#34C759] shadow-[0_0_20px_rgba(52,199,89,0.4)] border-none text-white',
    red: 'w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-[0.85] hover:brightness-110 bg-[#FF3B30] shadow-[0_0_20px_rgba(255,59,48,0.4)] border-none text-white',
    active: 'w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-[0.85] hover:brightness-110 bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)] border-none text-black',
  }[variant];

  const glassBg = {
    glass: 'bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-white backdrop-blur-2xl border border-white/10',
    green: '',
    red: '',
    active: '',
  }[variant];

  return (
    <div className={base} onClick={onClick}>
      <div className={`${btnClass} ${glassBg}`}>
        <Icon className="w-7 h-7 drop-shadow-sm" />
      </div>
      <span className="text-[13px] font-medium text-white drop-shadow-md">{label}</span>
    </div>
  );
}

interface CallOverlayProps {
  mode?: 'docked' | 'center_popup' | 'mini_floating' | 'hidden';
}

export const CallOverlay: React.FC<CallOverlayProps> = ({ mode = 'hidden' }) => {
  const {
    callState, activePeer, isMuted, isRemoteMuted,
    isOnHold, isSpeakerOn, answerCall, rejectCall, endCall,
    toggleMute, toggleHold, toggleSpeaker, activeWorkspaceName, activeWorkspaceId,
    setManuallyMinimized, setUIMode, isCaller, initiateCallByUsername,
    isPoorConnection, isDiagnosticsOpen, hasHeldCall
  } = useCallStore(useShallow(state => ({
    callState: state.callState, activePeer: state.activePeer, isMuted: state.isMuted, isRemoteMuted: state.isRemoteMuted,
    isOnHold: state.isOnHold, isSpeakerOn: state.isSpeakerOn, answerCall: state.answerCall, rejectCall: state.rejectCall, endCall: state.endCall,
    toggleMute: state.toggleMute, toggleHold: state.toggleHold, toggleSpeaker: state.toggleSpeaker, activeWorkspaceName: state.activeWorkspaceName, activeWorkspaceId: state.activeWorkspaceId,
    setManuallyMinimized: state.setManuallyMinimized, setUIMode: state.setUIMode, isCaller: state.isCaller, initiateCallByUsername: state.initiateCallByUsername,
    isPoorConnection: state.isPoorConnection, isDiagnosticsOpen: state.isDiagnosticsOpen, hasHeldCall: state.hasHeldCall
  })));

  const miniFloatingPosition = useCallStore(s => s.miniFloatingPosition);
  const setMiniFloatingPosition = useCallStore(s => s.setMiniFloatingPosition);

  const [dialUsername, setDialUsername] = React.useState('');
  const [isDialing, setIsDialing] = React.useState(false);
  const [showDialer, setShowDialer] = React.useState(false);

  if (callState === 'IDLE' || !activePeer || mode === 'hidden') return null;

  const isIncoming = !isCaller && ['RINGING', 'WAITING', 'INITIATED'].includes(callState);
  const isConnected = ['CONNECTED'].includes(callState);
  const isConnecting = ['ACCEPTED', 'CONNECTING', 'NEGOTIATING', 'ICE_GATHERING', 'ICE_CONNECTED', 'RECONNECTING'].includes(callState);
  const isCalling = isCaller && ['INITIATED', 'RINGING', 'WAITING'].includes(callState);

  const peerName = activePeer?.name ?? 'Unknown Caller';
  const peerUsername = activePeer?.username;
  const peerAvatar = activePeer?.profileUrl ? getImageUrl(activePeer.profileUrl) : null;

  // ── DOCKED PANEL (Right Side in Team Chat) ──────────────────────────────────
  if (mode === 'docked') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="flex flex-col h-full w-full relative overflow-hidden bg-card/20 border-l border-white/5"
        >
          {/* Subtle Ambient Contact Poster */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             {peerAvatar ? (
               <img src={peerAvatar} className="absolute inset-0 w-full h-full object-cover scale-125 blur-[100px] opacity-20 mix-blend-screen" alt="" />
             ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl opacity-20" />
             )}
          </div>

          {/* Minimal Header */}
          <div className="flex items-center justify-between px-6 py-5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white/90 text-sm drop-shadow-md">Voice Call HD</span>
            </div>
            {isConnected && (
              <button onClick={() => { setManuallyMinimized(true); setUIMode('mini_floating'); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors backdrop-blur-md">
                <Minimize2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center px-6 pb-8 overflow-y-auto no-scrollbar pt-4 relative z-10">
             {/* iOS Contact Info */}
             <div className="flex flex-col items-center mb-auto pt-4">
                <div className="w-[100px] h-[100px] mb-4 rounded-full overflow-hidden shadow-2xl border border-white/20">
                   {peerAvatar ? <img src={peerAvatar} className="w-full h-full object-cover"/> : <User className="w-full h-full text-white/50 bg-white/10 p-4"/>}
                </div>
                <h3 className="text-[34px] font-medium text-white tracking-tight text-center leading-none mb-2 drop-shadow-lg">{peerName}</h3>
                <div className="text-[17px] text-white/80 font-normal drop-shadow-md">
                   {isConnecting ? 'Connecting...' : isConnected ? <CallTimer /> : isIncoming ? 'Incoming...' : 'Calling...'}
                </div>
             </div>

            {isPoorConnection && (
              <div className="flex items-center justify-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-3 py-1 rounded-full mb-3 text-[11px] font-semibold border border-yellow-500/20">
                <SignalHigh className="w-3.5 h-3.5" /> Poor Network Connection
              </div>
            )}

            <div className="flex justify-center mb-3">
              <NetworkQualityIndicator />
            </div>

            <div className="text-[15px] text-white/70 mb-3 font-medium text-center">
              {callState === 'MISSED' ? 'Call Missed' :
               callState === 'REJECTED' ? 'Call Declined' :
               callState === 'BUSY' ? 'User Busy' :
               callState === 'ENDED' ? 'Call Ended' :
               callState === 'FAILED' ? 'Call Failed' :
               isOnHold
                ? '⏸ Call on hold' : null}
            </div>

            {isConnected && !isOnHold && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold mb-8 border border-green-500/20">
                <SignalHigh className="w-3.5 h-3.5" />
                Good Connection
              </div>
            )}
            
            {/* Controls */}
            {(isConnected || isCalling) && (
              <div className="flex flex-col gap-4 mt-auto w-full pt-8 mb-8">
                
                {showDialer && (
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/20 p-2 rounded-xl w-full mb-4 shadow-xl">
                        <Search className="w-4 h-4 text-white/50 ml-2" />
                        <input 
                            type="text" 
                            placeholder="Type username..." 
                            value={dialUsername}
                            onChange={(e) => setDialUsername(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder:text-white/50"
                            autoFocus
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && dialUsername && activeWorkspaceId) {
                                    setIsDialing(true);
                                    await initiateCallByUsername?.(dialUsername, activeWorkspaceId);
                                    setIsDialing(false);
                                    setShowDialer(false);
                                    setDialUsername('');
                                }
                            }}
                        />
                        <button 
                            disabled={!dialUsername || isDialing}
                            onClick={async () => {
                                if (dialUsername && activeWorkspaceId) {
                                    setIsDialing(true);
                                    await initiateCallByUsername?.(dialUsername, activeWorkspaceId);
                                    setIsDialing(false);
                                    setShowDialer(false);
                                    setDialUsername('');
                                }
                            }} 
                            className="bg-white/20 text-white p-2 rounded-lg disabled:opacity-50 backdrop-blur-md"
                        >
                            {isDialing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                        </button>
                    </motion.div>
                )}

                <div className="grid grid-cols-3 gap-x-6 gap-y-6 w-full px-2 justify-items-center mb-6">
                  <ActionBtn icon={isMuted ? MicOff : Mic} label="mute" variant={isMuted ? 'active' : 'glass'} onClick={toggleMute ?? undefined} />
                  <ActionBtn icon={Volume2} label="audio" variant={isSpeakerOn ? 'active' : 'glass'} onClick={toggleSpeaker ?? undefined} />
                  <ActionBtn icon={isOnHold ? Play : Pause} label="hold" variant={isOnHold ? 'active' : 'glass'} onClick={toggleHold ?? undefined} />
                  <ActionBtn icon={UserPlus} label="add" variant={showDialer ? 'active' : 'glass'} onClick={() => setShowDialer(!showDialer)} />
                  <DeviceSettings />
                  <ActionBtn 
                     icon={Activity} 
                     label="stats" 
                     variant={isDiagnosticsOpen ? 'active' : 'glass'} 
                     onClick={() => {
                       const state = useCallStore.getState();
                       state.setDiagnosticsOpen(!state.isDiagnosticsOpen);
                     }} 
                  />
                </div>
              </div>
            )}

            {isIncoming && !isCalling && (
              <div className="flex justify-center items-center gap-6 mt-auto w-full pt-8 mb-6">
                <ActionBtn icon={PhoneOff} label="Decline" variant="red" onClick={rejectCall ?? undefined} />
                <ActionBtn icon={Phone} label="Accept" variant="green" onClick={answerCall ?? undefined} />
              </div>
            )}

            {hasHeldCall && (isConnected || isCalling) && (
               <div className="w-full flex justify-center mt-4">
                  <button
                    onClick={() => {
                        // Ends current call which triggers processNextInQueue automatically resuming the held call
                        endCall?.();
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 rounded-full text-[11px] font-bold transition-colors"
                  >
                     <Pause className="w-3.5 h-3.5" />
                     Resume Held Call (Ends Current)
                  </button>
               </div>
            )}

            {/* End Call Button */}
            {(isConnected || isCalling || isConnecting) && (
              <button
                onClick={endCall ?? undefined}
                className="w-[72px] h-[72px] mx-auto bg-[#FF3B30] hover:bg-[#FF3B30]/80 text-white rounded-full flex items-center justify-center transition-all active:scale-[0.85] shadow-[0_0_20px_rgba(255,59,48,0.3)] mt-auto mb-4"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }


  // ── MINI FLOATING (Bottom Right for Background Calls) ───────────────────────
  if (mode === 'mini_floating') {
    return (
      <AnimatePresence>
        <motion.div
          drag
          dragMomentum={false}
          onDragEnd={(e, info) => {
             setMiniFloatingPosition({
                x: (miniFloatingPosition?.x || 0) + info.offset.x,
                y: (miniFloatingPosition?.y || 0) + info.offset.y,
             });
          }}
          initial={{ opacity: 0, scale: 0.9, x: miniFloatingPosition?.x || 0, y: (miniFloatingPosition?.y || 0) + 50 }}
          animate={{ opacity: 1, scale: 1, x: miniFloatingPosition?.x || 0, y: miniFloatingPosition?.y || 0 }}
          exit={{ opacity: 0, scale: 0.9, y: (miniFloatingPosition?.y || 0) + 50, x: miniFloatingPosition?.x || 0 }}
          className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 bg-background border border-border shadow-2xl p-4 rounded-3xl w-80 cursor-move"
        >
          {/* Header & Workspace */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
             <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
               <Building2 className="w-3.5 h-3.5" />
               <span className="truncate max-w-[120px]">{activeWorkspaceName || 'Workspace'}</span>
             </div>
             <button onClick={() => { setManuallyMinimized(false); setUIMode('docked'); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white" title="Return to Chat">
               <Maximize2 className="w-4 h-4" />
             </button>
          </div>

          {/* Profile Area */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setManuallyMinimized(false); setUIMode('docked'); }}>
             <div className="relative">
                 <Avatar className="w-14 h-14 border-2 border-border shadow-sm">
                    <AvatarImage src={peerAvatar || ''} />
                    <AvatarFallback>{peerName.charAt(0)}</AvatarFallback>
                 </Avatar>
                 {isConnected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                 )}
             </div>
             
             <div className="flex flex-col flex-1 min-w-0">
                <span className="text-base font-bold text-foreground truncate">{peerName}</span>
                {peerUsername && <span className="text-xs text-muted-foreground truncate">@{peerUsername}</span>}
                <span className="text-xs text-green-500 font-mono font-medium mt-0.5">
                  {callState === 'MISSED' ? 'Missed' :
                   callState === 'REJECTED' ? 'Declined' :
                   callState === 'BUSY' ? 'Busy' :
                   callState === 'ENDED' ? 'Ended' :
                   callState === 'FAILED' ? 'Failed' :
                   isOnHold ? 'On hold' :
                   isConnected ? <CallTimer /> : 
                   isConnecting ? (callState === 'RECONNECTING' ? 'Reconnecting...' : 'Connecting...') : 
                   'Calling...'}
                </span>
             </div>
          </div>

          {/* Dialer */}
          {showDialer && (
              <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="flex items-center gap-2 bg-background/50 border border-border p-2 rounded-xl w-full">
                  <Search className="w-4 h-4 text-muted-foreground ml-1" />
                  <input 
                      type="text" 
                      placeholder="Username..." 
                      value={dialUsername}
                      onChange={(e) => setDialUsername(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs flex-1 placeholder:text-muted-foreground"
                      autoFocus
                      onKeyDown={async (e) => {
                          if (e.key === 'Enter' && dialUsername && activeWorkspaceId) {
                              setIsDialing(true);
                              await initiateCallByUsername?.(dialUsername, activeWorkspaceId);
                              setIsDialing(false);
                              setShowDialer(false);
                              setDialUsername('');
                          }
                      }}
                  />
                  <button 
                      disabled={!dialUsername || isDialing}
                      onClick={async () => {
                          if (dialUsername && activeWorkspaceId) {
                              setIsDialing(true);
                              await initiateCallByUsername?.(dialUsername, activeWorkspaceId);
                              setIsDialing(false);
                              setShowDialer(false);
                              setDialUsername('');
                          }
                      }} 
                      className="bg-primary text-primary-foreground p-1.5 rounded-md disabled:opacity-50"
                  >
                      {isDialing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                  </button>
              </motion.div>
          )}

          {/* Controls */}
          {isIncoming && !isCaller ? (
             <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-white/5">
                <button onClick={rejectCall ?? undefined} className="flex-1 py-2.5 bg-destructive hover:bg-destructive/90 text-white rounded-xl font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                  <PhoneOff className="w-4 h-4" /> Decline
                </button>
                <button onClick={answerCall ?? undefined} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                  <Phone className="w-4 h-4" /> Accept
                </button>
             </div>
          ) : (
             <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                    <button onClick={toggleMute ?? undefined} className={`p-2.5 rounded-full transition-colors ${isMuted ? 'bg-primary text-primary-foreground shadow-md' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`} title={isMuted ? 'Unmute' : 'Mute'}>
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button onClick={toggleSpeaker ?? undefined} className={`p-2.5 rounded-full transition-colors ${isSpeakerOn ? 'bg-primary text-primary-foreground shadow-md' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`} title="Speaker">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button onClick={toggleHold ?? undefined} className={`p-2.5 rounded-full transition-colors ${isOnHold ? 'bg-primary text-primary-foreground shadow-md' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`} title={isOnHold ? "Resume" : "Hold"}>
                      {isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setShowDialer(!showDialer)} className={`p-2.5 rounded-full transition-colors ${showDialer ? 'bg-primary text-primary-foreground shadow-md' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`} title="Add Call">
                      <UserPlus className="w-4 h-4" />
                    </button>
                </div>
                
                <button onClick={endCall ?? undefined} className="p-2.5 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-lg transition-colors flex items-center justify-center">
                  <PhoneOff className="w-4 h-4" />
                </button>
             </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
};
