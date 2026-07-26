import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { SpeechToTextModal } from './SpeechToTextModal';", "import { SpeechToTextModal } from './SpeechToTextModal';\nimport { SpeechToTextIcon } from '../icons/SpeechToTextIcon';")
content = content.replace("<Mic className=\"w-6 h-6\" />", "<SpeechToTextIcon size={24} />")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content2 = f.read()

content2 = content2.replace("import { Mic, X, Square, Send, AlertCircle, RefreshCw } from 'lucide-react';", "import { X, Square, Send, AlertCircle, RefreshCw } from 'lucide-react';\nimport { SpeechToTextIcon } from '../icons/SpeechToTextIcon';")
content2 = content2.replace("<Mic className=\"w-8 h-8 text-primary\" />", "<SpeechToTextIcon size={32} />")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content2)

print("Icon replaced successfully.")
