import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessageResponse } from '@/services/chatService';
import { Reply, Copy, Trash2, Smile, Edit2, Play, Forward, Pin, AlertCircle, Clock, FileText, Download, X, File } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import EmojiPicker from 'emoji-picker-react';
import { MediaLightbox } from './MediaLightbox';
import { apiClient } from '@/lib/apiClient';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { ImageBubble } from './ImageBubble';

interface MessageBubbleProps {
  message: ChatMessageResponse;
  isMe: boolean;
  isRead: boolean;
  otherMemberAvatar?: string;
  tickStatus?: 'sending' | 'failed' | 'sent' | 'delivered' | 'read';
  onReply?: (msg: ChatMessageResponse) => void;
  onReplyClick?: (replyToUuid: string) => void;
  onEdit?: (msg: ChatMessageResponse) => void;
  onDelete?: (msg: ChatMessageResponse) => void;
  onReact?: (emoji: string) => void;
  onForward?: (msg: ChatMessageResponse) => void;
  onPin?: () => void;
  onInfo?: (msg: ChatMessageResponse) => void;
  isHighlighted?: boolean;
  isFirstInSequence?: boolean;
  isLastInSequence?: boolean;
  isPrivateChat?: boolean;
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

import { chatMessageVariants } from '@/lib/animations';

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ 
  message, isMe, otherMemberAvatar, tickStatus, onReply, onReplyClick, onEdit, onDelete, onReact, onForward, onPin, onInfo, isHighlighted,
  isFirstInSequence = true, isLastInSequence = true, isPrivateChat = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string, type: 'image' | 'video', fileName?: string } | null>(null);
  const [refreshedUrls, setRefreshedUrls] = useState<Record<string, string>>({});
  const isMediaOnly = !message.content && message.attachments && message.attachments.length > 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore(state => state.user);
  
  const handleMediaError = async (uuid: string, originalUrl: string) => {
    if (refreshedUrls[uuid]) return;
    try {
      const basePath = originalUrl.split('?')[0];
      const response = await apiClient.get(basePath + '/refresh');
      if (response.data && response.data.data) {
        setRefreshedUrls(prev => ({ ...prev, [uuid]: response.data.data }));
      }
    } catch (e) {
      console.error('Failed to refresh signed URL');
    }
  };
  
  if (message.content?.startsWith('$$CALL_LOG$$')) {
    const parts = message.content.split('|');
    const status = parts[1]; 
    const duration = parseInt(parts[2] || '0', 10);
    const m = Math.floor(duration / 60);
    const s = duration % 60;
    const durationStr = `${m}:${s.toString().padStart(2, '0')}`;
    const isMissed = status === 'MISSED' || status === 'REJECTED';
    
    // We import Phone from lucide-react, wait, is Phone imported? Let's check imports.
    // If not, we'll just use a generic icon or text.
    return (
      <div className={`flex w-full my-4 justify-center`} ref={containerRef}>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted backdrop-blur-md rounded-full border border-border text-xs shadow-sm">
          <span className={isMissed ? 'text-red-400' : 'text-green-400'}>📞</span>
          <span className="text-foreground/80 font-medium">
             {isMissed ? 'Missed Call' : `Call Ended • ${durationStr}`}
          </span>
          <span className="text-muted-foreground text-[10px] ml-1 font-mono">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isHighlighted && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowActions(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    import('sonner').then(({ toast }) => toast.success('Copied to clipboard'));
  };

  return (
    <motion.div 
      ref={containerRef}
      variants={chatMessageVariants}
      initial="hidden"
      animate="visible"
      onDoubleClick={() => setShowActions(true)}
      className={`chat-message-bubble flex w-full group relative ${isPrivateChat ? (isLastInSequence ? 'pb-2' : 'pb-[2px]') : 'pb-3'} ${isMe ? 'justify-end' : 'justify-start'} ${message.isDeleted ? 'opacity-70' : ''} ${isHighlighted ? 'animate-pulse' : ''}`}
      data-message-uuid={message.uuid}
      data-sender-uuid={message.senderUuid}
    >
      {!isMe && !isPrivateChat && (
        <img 
          src={message.senderAvatarUrl ? getImageUrl(message.senderAvatarUrl) : (otherMemberAvatar ? getImageUrl(otherMemberAvatar) : '')} 
          alt={message.senderName} 
          className="w-8 h-8 rounded-full object-cover mr-2 self-end shrink-0 bg-foreground/5"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      
      <div className={`flex flex-col ${isMe ? 'items-end max-w-[80%]' : 'items-start max-w-[75%]'}`}>
        
        {/* Old Reply Preview removed */}

        {/* Pinned Indicator */}
        {message.isPinned && (
          <div className={`mb-1 text-xs text-primary flex items-center gap-1 opacity-80 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <Pin className="w-3 h-3" />
            <span className="font-semibold">Pinned</span>
          </div>
        )}

        <div className={`relative ${!isMediaOnly ? (isPrivateChat ? 'px-3 py-2 rounded-2xl' : 'px-4 py-2.5 rounded-[1.25rem]') : ''} group break-words min-w-[60px] ${
          !isMediaOnly ? (
            isMe 
            ? `bg-gradient-to-br from-primary/90 to-primary text-white shadow-md ${isFirstInSequence ? (isPrivateChat ? 'rounded-tr-sm' : 'rounded-tr-sm') : ''}` 
            : `glass-surface text-foreground ${isFirstInSequence ? (isPrivateChat ? 'rounded-tl-sm' : 'rounded-tl-sm') : ''}`
          ) : ''
        } ${isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse' : ''} shadow-sm`}>
          {/* Action Toolbar */}
          <AnimatePresence>
            {showActions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={`absolute bottom-full mb-3 ${isMe ? 'right-0' : 'left-0'} flex items-center bg-[#0f111a] rounded-full shadow-2xl border border-white/5 z-10 px-1 py-1`}
              >
                <div className="relative">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors flex items-center justify-center mr-0.5 ml-0.5 group" title="React">
                    <Smile className="w-4 h-4 text-white/90 group-hover:text-white transition-colors"/>
                  </button>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full mb-2 -left-10 z-50 shadow-2xl"
                        onMouseLeave={() => setShowEmojiPicker(false)}
                      >
                        <EmojiPicker 
                          theme={"dark" as any} 
                          lazyLoadEmojis={true}
                          skinTonesDisabled={false}
                          searchDisabled={false}
                          onEmojiClick={(emojiData) => {
                            onReact?.(emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                          width={320}
                          height={400}
                          style={{
                            fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-6 bg-white/10 mx-0.5" />
                <button onClick={() => onReply?.(message)} className="flex flex-col items-center justify-center gap-0.5 px-2.5 hover:bg-white/5 rounded-lg py-1 transition-colors group">
                  <div className="relative">
                    <Reply className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-[2px]">
                      <div className="w-0.5 h-0.5 rounded-full bg-white/40"></div>
                      <div className="w-0.5 h-0.5 rounded-full bg-white/40"></div>
                    </div>
                  </div>
                  <span className="text-[8px] font-medium text-white/60 group-hover:text-white/80 mt-0.5">Reply</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-0.5" />
                <button onClick={() => onForward?.(message)} className="flex flex-col items-center justify-center gap-0.5 px-2.5 hover:bg-white/5 rounded-lg py-1 transition-colors group">
                  <div className="relative">
                    <Forward className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                  </div>
                  <span className="text-[8px] font-medium text-blue-400 group-hover:text-blue-300 mt-0.5">Forward</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-0.5" />
                <button onClick={handleCopy} className="flex flex-col items-center justify-center gap-0.5 px-2.5 hover:bg-white/5 rounded-lg py-1 transition-colors group">
                  <Copy className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                  <span className="text-[8px] font-medium text-white/60 group-hover:text-white/80 mt-0.5">Copy</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-0.5" />
                <button onClick={onPin} className="flex flex-col items-center justify-center gap-0.5 px-2.5 hover:bg-white/5 rounded-lg py-1 transition-colors group">
                  <Pin className={`w-3.5 h-3.5 ${message.isPinned ? 'text-purple-400' : 'text-purple-400/80 group-hover:text-purple-400 transition-colors'}`} />
                  <span className={`text-[8px] font-medium ${message.isPinned ? 'text-purple-400' : 'text-white/60 group-hover:text-white/80'} mt-0.5`}>Pin</span>
                </button>

                {isMe && (
                  <>
                    <div className="w-px h-6 bg-white/10 mx-0.5" />
                    <button onClick={() => onEdit?.(message)} className="flex flex-col items-center justify-center gap-0.5 px-2.5 hover:bg-white/5 rounded-lg py-1 transition-colors group">
                      <Edit2 className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                      <span className="text-[8px] font-medium text-white/60 group-hover:text-white/80 mt-0.5">Edit</span>
                    </button>
                  </>
                )}

                {isMe && (
                  <>
                    <div className="w-px h-6 bg-white/10 mx-0.5" />
                    <button onClick={() => onInfo?.(message)} className="flex flex-col items-center justify-center gap-0.5 px-2.5 hover:bg-white/5 rounded-lg py-1 transition-colors group">
                      <AlertCircle className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                      <span className="text-[8px] font-medium text-white/60 group-hover:text-white/80 mt-0.5">Info</span>
                    </button>
                  </>
                )}

                {isMe && (
                  <>
                    <div className="w-px h-6 bg-white/10 mx-0.5" />
                    <button onClick={() => onDelete?.(message)} className="flex flex-col items-center justify-center gap-0.5 px-2.5 hover:bg-red-500/10 rounded-lg py-1 transition-colors group/del">
                      <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover/del:text-red-500 transition-colors" />
                      <span className="text-[8px] font-medium text-red-400 group-hover/del:text-red-500 transition-colors mt-0.5">Delete</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp-style Reply Preview */}
          {message.replyToMessageUuid && (
            <div 
              className={`mb-1 text-[13px] bg-black/10 dark:bg-black/20 rounded-lg p-1.5 border-l-4 cursor-pointer hover:bg-black/20 dark:hover:bg-black/40 transition-colors ${isMe ? 'border-orange-400/80' : 'border-primary'}`}
              onClick={() => onReplyClick?.(message.replyToMessageUuid!)}
            >
              <div className={`font-semibold ${isMe ? 'text-orange-400/90' : 'text-primary'}`}>{message.replyToSenderName}</div>
              <div className="truncate max-w-[200px] text-foreground/70">{message.replyToContent}</div>
            </div>
          )}

          {/* Voice Note Rendering */}
          {message.isDeleted ? (
            <p className="text-[14px] italic opacity-80 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              This message was deleted
            </p>
          ) : message.isVoiceNote ? (
            <div className="min-w-[200px]">
              {message.attachments && message.attachments.length > 0 && (
                <VoiceMessagePlayer 
                  audioUrl={refreshedUrls[message.attachments[0].uuid] || message.attachments[0].signedUrl}
                  duration={message.voiceNoteDuration || 0}
                  waveformStr={message.voiceNoteWaveform}
                  isMe={isMe}
                />
              )}
            </div>
          ) : (
            <div className={`flex flex-col ${isPrivateChat ? 'relative' : ''}`}>
              {message.content && (
                isPrivateChat ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <p className="text-[14.5px] leading-[1.4] whitespace-pre-wrap">{message.content}</p>
                    <span className="w-12 h-1 invisible"></span> {/* Spacer for absolute timestamp */}
                  </div>
                ) : (
                  <p className="text-[15px] leading-[1.4] whitespace-pre-wrap mb-1">{message.content}</p>
                )
              )}
              
              {/* Attachments rendering */}
              {message.attachments && message.attachments.length > 0 && (
                <div className={`mt-2 ${message.attachments.length > 1 ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}`}>
                  {message.attachments.map((att) => {
                    const isImage = att.mimeType.startsWith('image/');
                    const isVideo = att.mimeType.startsWith('video/');
                    const isAudio = att.mimeType.startsWith('audio/');
                    const isPdf = att.mimeType === 'application/pdf';
                    const isOptimistic = att.url.startsWith('blob:');
                    const currentUrl = refreshedUrls[att.id] || att.url;
                    
                    if (isImage) {
                      return (
                        <ImageBubble
                          key={att.id}
                          src={currentUrl}
                          alt={att.fileName}
                          isOptimistic={isOptimistic}
                          timestamp={isMediaOnly ? message.createdAt : undefined}
                          isMe={isMe}
                          tickStatus={isMediaOnly ? tickStatus : undefined}
                          onClick={() => setLightbox({ url: currentUrl, type: 'image', fileName: att.fileName })}
                          onError={!isOptimistic ? () => handleMediaError(att.id, att.url) : undefined}
                        />
                      );
                    } else if (isVideo) {
                      return (
                        <div 
                          key={att.id} 
                          className={`relative overflow-hidden cursor-pointer border border-border/50 group rounded-[1rem] ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} ${
                            isMediaOnly ? 'max-w-[280px] sm:max-w-[320px] bg-black/5' : 'max-w-full bg-black/20'
                          }`}
                          onClick={() => setLightbox({ url: currentUrl, type: 'video', fileName: att.fileName })}
                        >
                          <div className="relative w-full h-auto max-h-[350px]">
                            <video src={isOptimistic ? currentUrl : getImageUrl(currentUrl)} className="w-full h-full object-cover" onError={!isOptimistic ? () => handleMediaError(att.id, att.url) : undefined} />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                              <Play className="w-10 h-10 text-white opacity-90 drop-shadow-md" />
                            </div>
                          </div>
                          {!isOptimistic && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          )}
                          {!isMediaOnly && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-medium text-white/90 shadow-sm">
                              {(att.fileSize / 1024 / 1024).toFixed(1)} MB
                            </div>
                          )}
                        </div>
                      );
                    } else if (isAudio) {
                      return (
                        <div key={att.id} className="bg-black/10 rounded-xl p-1 mb-1">
                          <VoiceMessagePlayer audioUrl={isOptimistic ? currentUrl : getImageUrl(currentUrl)} duration={0} isMe={isMe} />
                        </div>
                      );
                    } else if (isPdf) {
                      return (
                        <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-sm min-w-[200px] hover:bg-card/80 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold truncate text-foreground/90">{att.fileName}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                              <span>PDF</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                              <span>{(att.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                            </div>
                          </div>
                          {!isOptimistic && (
                            <a 
                              href={getImageUrl(currentUrl)} 
                              download={att.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10 text-foreground/70 transition-colors shrink-0"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    } else {
                      // Generic Document
                      return (
                        <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-sm min-w-[200px] hover:bg-card/80 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                            <File className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold truncate text-foreground/90">{att.fileName}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                              <span>DOC</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                              <span>{(att.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                            </div>
                          </div>
                          {!isOptimistic && (
                            <a 
                              href={getImageUrl(currentUrl)} 
                              download={att.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10 text-foreground/70 transition-colors shrink-0"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Upload Progress Overlay */}
          {message.isUploading && (
            <div className="mt-2 flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-border">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${message.uploadProgress || 0}%` }}
                />
              </div>
              <span className="text-[10px] font-medium opacity-80 shrink-0">{message.uploadProgress || 0}%</span>
              <button 
                onClick={() => message.abortController?.abort()}
                className="p-1 hover:bg-foreground/10 rounded-full text-red-400 shrink-0 transition-colors"
                title="Cancel Upload"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {message.isFailed && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Upload failed
            </div>
          )}
          
          {/* Metadata Footer */}
          {/* Metadata Footer */}
          <div className={isPrivateChat 
              ? `flex items-center gap-1 select-none absolute bottom-1 right-2 text-white/60` 
              : `flex items-center gap-1 mt-1 shrink-0 select-none ${isMe ? (isMediaOnly ? 'justify-end text-foreground/80' : 'justify-end text-primary-foreground/70') : 'justify-start text-muted-foreground'}`
          }>
            {!isPrivateChat && <span className="text-[10px] font-medium tracking-wide">{formatTime(message.createdAt)}</span>}
            {message.isEdited && <span className={`text-[10px] italic ${isPrivateChat ? 'mr-1' : 'ml-1'}`}>(edited)</span>}
            {isPrivateChat && <span className="text-[10px] tracking-wide mt-0.5">{formatTime(message.createdAt)}</span>}
            
            {isMe && !message.isDeleted && (
              <span className={`cursor-pointer ${isPrivateChat ? 'ml-0.5 mt-0.5' : 'ml-0.5 mt-0.5'}`} onClick={() => onInfo?.(message)}>
                {tickStatus === 'sending' || message.status === 'sending' ? (
                  <Clock className={isPrivateChat ? "w-[11px] h-[11px] opacity-70" : "w-3 h-3 opacity-60"} />
                ) : tickStatus === 'failed' || message.status === 'failed' ? (
                  <AlertCircle className={isPrivateChat ? "w-[11px] h-[11px] text-red-400" : "w-3 h-3 text-red-400"} />
                ) : tickStatus === 'read' ? (
                  <div className="flex gap-[3px] items-center">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#25D366]" />
                    <div className="w-[6px] h-[6px] rounded-full bg-[#25D366]" />
                  </div>
                ) : tickStatus === 'delivered' ? (
                  <div className="flex gap-[3px] items-center">
                    <div className={`w-[6px] h-[6px] rounded-full bg-current ${isPrivateChat ? 'opacity-70' : 'opacity-60'}`} />
                    <div className={`w-[6px] h-[6px] rounded-full bg-current ${isPrivateChat ? 'opacity-70' : 'opacity-60'}`} />
                  </div>
                ) : (
                  <div className="flex gap-[3px] items-center">
                    <div className={`w-[6px] h-[6px] rounded-full bg-current ${isPrivateChat ? 'opacity-70' : 'opacity-60'}`} />
                    <div className={`w-[6px] h-[6px] rounded-full bg-current opacity-25`} />
                  </div>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reactions Rendering */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <AnimatePresence>
              {message.reactions.map((r) => {
                const hasReacted = user?.uuid && r.userUuids?.includes(user.uuid);
                return (
                  <motion.button 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onReact?.(r.emoji)}
                    key={r.emoji} // Use emoji as key for correct animation
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium border shadow-sm transition-all ${
                      hasReacted 
                      ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20' 
                      : 'bg-card border-border/60 text-muted-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <span 
                      className="text-[13px] leading-none" 
                      style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}
                    >
                      {r.emoji}
                    </span>
                    <span className="opacity-90 min-w-[8px] text-center">{r.count}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {lightbox && (
        <MediaLightbox 
          url={lightbox.url} 
          type={lightbox.type} 
          fileName={lightbox.fileName}
          onClose={() => setLightbox(null)} 
        />
      )}
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

