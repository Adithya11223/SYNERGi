import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

# Fix unused imports
content = re.sub(r"import \{ Send, Mic, Paperclip, X, Trash2, Pause, Plus, Smile, Lock \} from 'lucide-react';", "import { Send, Paperclip, X, Plus, Smile } from 'lucide-react';", content)

# Remove unused recording variables and functions
content = re.sub(r"  const \[recordingDuration, setRecordingDuration\] = useState\(0\);\n", "", content)
content = re.sub(r"  const \[slideOffset, setSlideOffset\] = useState\(0\);\n", "", content)
content = re.sub(r"  const handlePointerDown =.*?// ---------------- RECORDING LOGIC ---------------- //", "// ---------------- RECORDING LOGIC ---------------- //", content, flags=re.DOTALL)
content = re.sub(r"  // ---------------- RECORDING LOGIC ---------------- //.*?const formatDuration", "  const formatDuration", content, flags=re.DOTALL)
content = re.sub(r"  const formatDuration =.*?\}", "", content, flags=re.DOTALL)

# Also fix `editMode` type error
props_pattern = r"  isPrivateChat\?: boolean;\n\}"
content = re.sub(props_pattern, "  isPrivateChat?: boolean;\n  editMode?: any;\n}", content)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageBubble.tsx', 'r') as f:
    bubble = f.read()
bubble = re.sub(r"import \{ VoiceMessagePlayer \} from '\./VoiceMessagePlayer';\n", "", bubble)
with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageBubble.tsx', 'w') as f:
    f.write(bubble)

print("Fixed TS errors")
