import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

# The button to move
button_block = """              {isPrivateChat ? (
                <button 
                  onClick={() => setIsSpeechModalOpen(true)}
                  className="p-3 text-muted-foreground hover:text-primary hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.8)] shrink-0 mb-0.5 transition-all"
                  title="Speech to Text"
                  disabled={disabled || isSending}
                >
                  <SpeechToTextIcon size={24} />
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
              )}"""

# Remove the button block from its current place
content = content.replace(button_block, "")

# Now we want to insert it BEFORE the flex-1 div, but we only want to show it there if isPrivateChat is true?
# Wait, let's keep the isPrivateChat check for the SpeechToTextIcon, but we also want the Paperclip icon if it's NOT private chat!
# Actually, the user says "put that at left side" for "exactly add given symbol". 
# The outer div starts like this:

outer_div_start = """        {/* TEXT INPUT AREA (Hidden when recording) */}
        {true && (
          <>


            <div className={`flex-1 flex items-end relative min-h-[52px] ${isPrivateChat ? 'bg-black/20 border border-white/5 rounded-[24px] px-1' : ''}`}>"""

new_outer_div_start = """        {/* TEXT INPUT AREA (Hidden when recording) */}
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

            <div className={`flex-1 flex items-end relative min-h-[52px] ${isPrivateChat ? 'bg-black/20 border border-white/5 rounded-[24px] px-1' : ''}`}>"""

content = content.replace(outer_div_start, new_outer_div_start)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

print("Icon moved outside and to the left.")
