import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

ai_block = """
                  {/* Optional AI Actions Placeholder */}
                  <div className="flex flex-col gap-2 mb-6 opacity-60">
                    <button className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors py-1 w-fit">
                      <Sparkles className="w-3.5 h-3.5" /> Improve Writing
                    </button>
                    <button className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors py-1 w-fit">
                      <FileText className="w-3.5 h-3.5" /> Summarize
                    </button>
                    <button className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors py-1 w-fit">
                      <Languages className="w-3.5 h-3.5" /> Translate
                    </button>
                  </div>
"""

content = content.replace(ai_block, "")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)

print("AI Options removed.")
