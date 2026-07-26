import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

old_code = """          ) : (text.trim().length === 0 && selectedFiles.length === 0) || isRecording ? (
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
            // NORMAL SEND BUTTON"""

new_code = """          ) : (isPrivateChat && ((text.trim().length === 0 && selectedFiles.length === 0) || isRecording)) ? (
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
                : `w-12 h-12 disabled:opacity-50 bg-[#00a884] text-[#111b21] hover:bg-[#00a884]/90`
              }`}
              title="Voice Note"
            >
              <Mic className={`${isRecording && !isLocked ? 'w-8 h-8' : 'w-6 h-6'}`} />
            </button>
          ) : (
            // NORMAL SEND BUTTON"""

if old_code in content:
    with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
        f.write(content.replace(old_code, new_code))
    print("Fixed MessageComposer.tsx")
else:
    print("Could not find old_code")
