import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { SpeechToTextModal } from './speech-to-text/SpeechToTextModal';
import { SpeechToTextIcon } from '../icons/SpeechToTextIcon';
import { motion, AnimatePresence } from 'framer-motion';
interface MessageComposerProps {
  onSend: (text: string) => void;
  onSendFiles?: (text: string, files: File[]) => void;
  onActivity: (activity: 'TYPING' | 'RECORDING' | 'UPLOADING' | 'NONE') => void;
  onStartRecording?: () => void;
  isSending?: boolean;
  disabled?: boolean;
  replyTo?: any; // To show reply preview above composer
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  placeholder?: string;
  isPrivateChat?: boolean;
  editMode?: any;
}

export const MessageComposer: React.FC<MessageComposerProps> = React.memo(({
  onSend, onSendFiles, onActivity, isSending = false, disabled = false, replyTo, onCancelReply, editMode, onCancelEdit, placeholder = "Type a message...", isPrivateChat = false
}) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Recording states
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);


  useEffect(() => {
    if (editMode) {
      setText(editMode.content);
    } else {
      setText('');
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editMode]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 4000) return;
    
    setText(e.target.value);
    adjustHeight();

    // Typing Indicator Logic
    onActivity('TYPING');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onActivity('NONE');
    }, 2000);
  };

  const handleSend = useCallback(() => {
    if (isSending || disabled) return;
    
    if (selectedFiles.length > 0 && onSendFiles) {
      try {
        onSendFiles(text.trim(), selectedFiles);
        setText('');
        setSelectedFiles([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        onActivity('NONE');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      } catch (err) {
        console.error("Error sending files:", err);
      }
      return;
    }

    if (text.trim()) {
      try {
        onSend(text.trim());
        setText('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        onActivity('NONE');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      } catch (err) {
        console.error("Error in MessageComposer handleSend:", err);
      }
    }
  }, [text, selectedFiles, isSending, disabled, onSend, onSendFiles, onActivity]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return; // Ignore IME composition
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const [filePreviews, setFilePreviews] = useState<Record<number, string>>({});

  useEffect(() => {
    const newPreviews: Record<number, string> = {};
    selectedFiles.forEach((file, idx) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newPreviews[idx] = URL.createObjectURL(file);
      }
    });
    setFilePreviews(newPreviews);

    return () => {
      Object.values(newPreviews).forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col shrink-0 px-4 sm:px-6 py-4 relative z-10 glass-surface border-t border-[var(--glass-border)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-b-[var(--radius)] lg:rounded-b-none lg:rounded-br-[var(--radius)]">
      
      {/* Attachments Preview Box */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="flex items-center gap-3 overflow-x-auto pb-3 custom-scrollbar"
          >
            {selectedFiles.map((file, idx) => {
              const preview = filePreviews[idx];
              return (
                <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border bg-black/40 flex items-center justify-center group">
                  {preview ? (
                    file.type.startsWith('image/') ? (
                      <img src={preview} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <video src={preview} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-foreground/70 break-all p-1 text-center">{file.name.split('.').pop()?.toUpperCase()}</span>
                  )}
                  <button 
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-background/80 p-0.5 rounded-full text-foreground/90 hover:text-red-400 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Reply or Edit Preview Box */}
      <AnimatePresence>
        {(replyTo || editMode) && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className={`flex items-center justify-between bg-black/5 dark:bg-black/20 rounded-t-xl px-4 py-2 border-l-2 ${editMode ? 'border-amber-500' : 'border-primary'} overflow-hidden`}
          >
            <div className="min-w-0">
              <span className={`text-[11px] font-bold ${editMode ? 'text-amber-500' : 'text-primary'} block`}>
                {editMode ? 'Editing message' : `Replying to ${replyTo?.senderName}`}
              </span>
              <span className="text-xs text-muted-foreground truncate block max-w-md">
                {editMode ? editMode.content : replyTo?.content}
              </span>
            </div>
            <button onClick={editMode ? onCancelEdit : onCancelReply} className="p-1 hover:bg-foreground/10 rounded-full transition-colors shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative flex items-end gap-2 transition-colors min-h-[52px] ${
        isPrivateChat 
        ? 'border-none p-0 bg-transparent' 
        : `glass-card border border-[var(--glass-border)] focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(var(--primary),0.15)] ${(replyTo || editMode) ? 'rounded-b-xl rounded-tr-xl' : 'rounded-2xl'} p-2`
      }`}>
        
        {/* TEXT INPUT AREA (Hidden when recording) */}
        {true && (
          <>
            {isPrivateChat ? (
              <button 
                onClick={() => setIsSpeechModalOpen(true)}
                className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.8)] shrink-0 mb-0.5 transition-all"
                title="Speech to Text"
                disabled={disabled || isSending}
              >
                <SpeechToTextIcon size={26} />
              </button>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors shrink-0 mb-1"
                title="Attach File"
                disabled={disabled || isSending}
              >
                <Paperclip className="w-5 h-5" />
              </button>
            )}

            <div className={`flex-1 flex items-end relative min-h-[52px] ${isPrivateChat ? 'glass-card border border-[var(--glass-border)] focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(var(--primary),0.15)] transition-colors rounded-[24px] px-1' : ''}`}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileSelect}
              />
              


              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isSending}
                className={`flex-1 max-h-[150px] bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/60 custom-scrollbar disabled:opacity-50 h-full ${isPrivateChat ? 'py-3.5 px-2 text-[15px]' : 'py-3.5 px-2 text-[15px]'}`}
                rows={1}
                style={{ minHeight: isPrivateChat ? '52px' : 'auto' }}
              />

              {isPrivateChat && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
                  title="Attach File"
                  disabled={disabled || isSending}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}

        {/* ACTION BUTTON (Send) */}
        <div className={`flex items-center shrink-0 ${isPrivateChat ? 'ml-1 mb-0.5' : 'pr-1 mb-1'}`}>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSend();
              }}
              disabled={disabled || isSending}
              className={`p-2.5 rounded-full transition-colors flex items-center justify-center shrink-0 w-12 h-12 ${
                (text.trim().length > 0 || selectedFiles.length > 0) && !isSending && !disabled
                  ? (isPrivateChat ? 'bg-[#00a884] text-[#111b21]' : 'bg-primary text-primary-foreground shadow-lg shadow-primary/25')
                  : 'bg-foreground/5 text-muted-foreground'
              }`}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-border/50 border-t-current rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 ml-0.5" />
              )}
            </button>
        </div>

      </div>
      
      {/* Char Limit Warning */}
      {text.length > 3800 && (
        <span className="text-[10px] text-red-400 absolute bottom-1 right-6">
          {text.length}/4000
        </span>
      )}

      <SpeechToTextModal 
        isOpen={isSpeechModalOpen}
        onClose={() => setIsSpeechModalOpen(false)}
        onSend={(transcript) => {
          onSend(transcript);
        }}
      />
    </div>
  );

});

MessageComposer.displayName = 'MessageComposer';

