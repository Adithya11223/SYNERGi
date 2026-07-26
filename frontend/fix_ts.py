import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Send, Paperclip, X, Smile, Mic } from 'lucide-react';", "import { Send, Paperclip, X, Mic } from 'lucide-react';")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content2 = f.read()

content2 = content2.replace("const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);", "const timerIntervalRef = useRef<any>(null);")
content2 = content2.replace("const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;", "const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content2)

print("Fixed TS errors.")
