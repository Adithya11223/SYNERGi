import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Mic, X, Square, Send, AlertCircle, RefreshCw, Sparkles, FileText, Languages } from 'lucide-react';", "import { Mic, X, Square, Send, AlertCircle, RefreshCw } from 'lucide-react';")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)

print("AI imports removed.")
