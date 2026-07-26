import re

with open('rewrite_composer.js.tmp', 'r') as f:
    content = f.read()

# We want to replace everything from "return (" down to "});\n\nMessageComposer.displayName"
start_idx = content.find("  return (\n    <div className=\"flex flex-col shrink-0")
end_idx = content.find("});\n\nMessageComposer.displayName")

if start_idx == -1 or end_idx == -1:
    print("Could not find start or end index")
    exit(1)

new_ui = """  return (
    <div className="flex flex-col shrink-0 px-4 sm:px-6 py-4 relative z-10 glass-surface border-t border-border/50">
      
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
              const preview = getFilePreview(file);
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
            className={`flex items-center justify-between bg-black/20 rounded-t-xl px-4 py-2 border-l-2 ${editMode ? 'border-amber-500' : 'border-primary'} overflow-hidden`}
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

      <div className={`relative flex items-end gap-2 transition-colors focus-within:border-primary/50 focus-within:bg-black/40 min-h-[52px] ${
        isPrivateChat 
        ? 'border-none p-0 bg-transparent' 
        : `bg-black/20 border border-border ${(replyTo || editMode) ? 'rounded-b-xl rounded-tr-xl' : 'rounded-2xl'} p-2`
      }`}>
        
        {/* TEXT INPUT AREA (Hidden when recording) */}
        {!isRecording && (
          <>
            {isPrivateChat && (
              <button className="p-3 text-muted-foreground hover:text-foreground shrink-0 mb-0.5" title="Attach">
                <Plus className="w-6 h-6" />
              </button>
            )}

            <div className={`flex-1 flex items-end relative min-h-[52px] ${isPrivateChat ? 'bg-black/20 border border-white/5 rounded-[24px] px-1' : ''}`}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileSelect}
              />
              
              {isPrivateChat ? (
                <button 
                  onClick={() => {}}
                  className="p-3 text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
                  title="Emoji"
                  disabled={disabled || isSending}
                >
                  <Smile className="w-6 h-6" />
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

        {/* RECORDING OVERLAY */}
        {isRecording && (
          <div className="flex-1 flex items-center h-[52px] relative overflow-hidden bg-black/20 rounded-[24px] px-2 border border-white/5">
            {isLocked ? (
              // LOCKED UI
              <div className="flex items-center w-full h-full gap-2">
                <button 
                  onClick={() => stopRecording(true)}
                  className="p-2 rounded-full text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                  title="Cancel Recording"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 min-w-[50px]">
                  {!isPaused && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  <span className="text-sm font-medium">{formatDuration(recordingDuration)}</span>
                </div>

                <div className="flex-1 flex items-center gap-[2px] h-8 justify-center overflow-hidden px-2">
                  {liveWaveform.map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-t-sm transition-all duration-75 ${isPaused ? 'bg-primary/30' : 'bg-primary'}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                <button 
                  onClick={togglePauseResume}
                  className="p-2 rounded-full text-muted-foreground hover:bg-foreground/10 transition-colors shrink-0"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Mic className="w-5 h-5 text-primary" /> : <Pause className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              // SWIPE TO CANCEL UI
              <div className="flex items-center w-full h-full justify-between" style={{ transform: `translateX(${slideOffset}px)` }}>
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium w-12">{formatDuration(recordingDuration)}</span>
                </div>
                <div className="flex-1 flex justify-end text-muted-foreground pr-8 animate-pulse text-sm">
                  {"< Slide to cancel"}
                </div>
              </div>
            )}
            
            {/* SWIPE UP TO LOCK ANIMATION (Only when not locked) */}
            {!isLocked && (
               <div className="absolute right-4 bottom-14 flex flex-col items-center opacity-50 animate-bounce pointer-events-none">
                 <Lock className="w-4 h-4 mb-1" />
                 <span className="text-[10px]">Lock</span>
               </div>
            )}
          </div>
        )}

        {/* ACTION BUTTON (Mic or Send) */}
        <div className={`flex items-center shrink-0 ${isPrivateChat ? 'ml-1 mb-0.5' : 'pr-1 mb-1'}`}>
          {isRecording && isLocked ? (
            // SEND BUTTON WHEN LOCKED
            <button 
              type="button"
              onClick={() => stopRecording(false)}
              className={`p-2.5 rounded-full shadow-lg transition-colors flex items-center justify-center shrink-0 w-12 h-12 ${isPrivateChat ? 'bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21]' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25'}`}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : (text.trim().length === 0 && selectedFiles.length === 0) || isRecording ? (
            // HOLD TO RECORD BUTTON
            <button 
              type="button"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              disabled={disabled || isSending}
              className={`transition-all rounded-full flex items-center justify-center shadow-lg touch-none ${
                isRecording && !isLocked
                ? 'w-16 h-16 bg-red-500 text-white scale-110 -translate-y-2' 
                : `w-12 h-12 disabled:opacity-50 ${isPrivateChat ? 'bg-[#00a884] text-[#111b21] hover:bg-[#00a884]/90' : 'bg-foreground/5 text-muted-foreground hover:bg-primary/20 hover:text-primary'}`
              }`}
              title="Voice Note"
            >
              <Mic className={`${isRecording && !isLocked ? 'w-8 h-8' : isPrivateChat ? 'w-6 h-6' : 'w-5 h-5'}`} />
            </button>
          ) : (
            // NORMAL SEND BUTTON
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
          )}
        </div>

      </div>
      
      {/* Char Limit Warning */}
      {!isRecording && text.length > 3800 && (
        <span className="text-[10px] text-red-400 absolute bottom-1 right-6">
          {text.length}/4000
        </span>
      )}
    </div>
  );
"""

new_content = content[:start_idx] + new_ui + "\n" + content[end_idx:]

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(new_content)
print("Updated MessageComposer.tsx successfully")
