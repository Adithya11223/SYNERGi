import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import { Send, Paperclip, X, Smile } from 'lucide-react';", "import { Send, Paperclip, X, Smile, Mic } from 'lucide-react';\nimport { SpeechToTextModal } from './SpeechToTextModal';")

# 2. Add state
state_block = """
  // Recording states
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
"""
content = content.replace("  // Recording states", state_block)

# 3. Replace Smile with Mic for Speech-to-Text
smile_block_private = """                <button 
                  onClick={() => {}}
                  className="p-3 text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
                  title="Emoji"
                  disabled={disabled || isSending}
                >
                  <Smile className="w-6 h-6" />
                </button>"""

mic_block = """                <button 
                  onClick={() => setIsSpeechModalOpen(true)}
                  className="p-3 text-muted-foreground hover:text-primary hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.8)] shrink-0 mb-0.5 transition-all"
                  title="Speech to Text"
                  disabled={disabled || isSending}
                >
                  <Mic className="w-6 h-6" />
                </button>"""

content = content.replace(smile_block_private, mic_block)

# 4. Insert Modal before the final div
modal_block = """
      <SpeechToTextModal 
        isOpen={isSpeechModalOpen}
        onClose={() => setIsSpeechModalOpen(false)}
        onSend={(transcript) => {
          onSend(transcript);
        }}
      />
    </div>
  );
"""

content = content.replace("    </div>\n  );\n", modal_block)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

print("Modified MessageComposer.tsx successfully.")
