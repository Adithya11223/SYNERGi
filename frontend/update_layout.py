import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# We want to replace everything from `return (` to the end.
# We will use regex or string manipulation.

new_render = """
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
          
          {/* Full Screen Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
            onClick={onClose}
          />

          {/* Ambient Glows for the whole screen */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

          {/* Floating UI Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg flex flex-col items-center"
          >
            {/* Close Button at top right of screen (fixed) or floating container? */}
            <button 
              onClick={onClose}
              className="absolute -top-20 right-0 p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-colors text-white/70 hover:text-white shadow-lg backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* SYNERGi Intelligence Title directly floating above */}
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="flex items-center gap-3 mb-12 drop-shadow-xl"
            >
               <Sparkles className="w-6 h-6 text-cyan-400" />
               <h2 className="text-white text-2xl font-semibold tracking-wide">SYNERGi Intelligence</h2>
            </motion.div>

            {/* Main Orb Area */}
            {(state === 'idle' || state === 'recording' || state === 'processing') && (
              <div className="flex flex-col items-center justify-center w-full">
                {renderPerplexityOrb()}

                <div className="h-[90px] flex flex-col items-center justify-center text-center w-full mt-8">
                  {state === 'idle' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/60 text-lg font-medium tracking-wide">
                      Tap the orb to start speaking
                    </motion.div>
                  )}
                  
                  {state === 'recording' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                      <div className="text-white/90 text-2xl leading-snug font-medium mb-3 line-clamp-2 px-4 drop-shadow-md">
                        {interimTranscript || transcript || "I'm listening..."}
                      </div>
                      <div className="text-cyan-400/90 text-sm font-bold uppercase tracking-[0.2em] animate-pulse drop-shadow-md">
                        Recording
                      </div>
                    </motion.div>
                  )}

                  {state === 'processing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-lg font-medium tracking-wide">
                      Transcribing your voice...
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Editable Text Area State */}
            {state === 'ready' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col w-full mt-6">
                <div className="bg-[#0c1015]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.05)] mb-6 relative group transition-all focus-within:border-cyan-500/50 focus-within:bg-[#0c1015]/90">
                  <textarea
                    ref={textareaRef}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full bg-transparent text-[18px] leading-relaxed text-white/95 focus:outline-none resize-none custom-scrollbar min-h-[120px]"
                    rows={4}
                    placeholder="Your message..."
                  />
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={handleStartRecording} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white/80 hover:text-white transition-colors backdrop-blur-md" title="Retake">
                       <RefreshCw className="w-5 h-5" />
                     </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setState('idle')}
                    className="flex-1 py-4 rounded-2xl border border-white/15 hover:bg-white/10 transition-colors text-white/80 font-medium text-base backdrop-blur-md bg-[#0c1015]/50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSend}
                    className="flex-[2] py-4 flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition-all text-[#0c1015] font-bold text-base shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:-translate-y-1"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {state === 'error' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 gap-6 bg-[#0c1015]/80 backdrop-blur-2xl rounded-3xl border border-white/10 w-full p-8 shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-white/90 font-medium text-center px-4 text-xl leading-relaxed">{errorMsg}</p>
                <button 
                  onClick={() => setState('idle')}
                  className="mt-4 px-10 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold shadow-lg text-lg"
                >
                  Go Back
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
"""

index = content.find("  return (")
if index != -1:
    new_content = content[:index] + new_render
    with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
        f.write(new_content)
    print("Updated layout successfully.")
else:
    print("Could not find return block")
