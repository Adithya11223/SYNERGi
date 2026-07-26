import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# Replace document.body with the target div
content = content.replace("    document.body", "    document.getElementById('chat-area-container') || document.body")

# Replace fixed with absolute so it aligns inside the relative container
content = content.replace('className="fixed inset-0 z-[99999]', 'className="absolute inset-0 z-[99999]')

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)
print("Updated modal target.")
