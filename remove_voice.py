import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

# 1. Remove the hold-to-record button
button_pattern = r"          \) : \(isPrivateChat && \(\(text\.trim\(\)\.length === 0 && selectedFiles\.length === 0\) \|\| isRecording\)\) \? \(\n            // HOLD TO RECORD BUTTON.*?\) : \(\n            // NORMAL SEND BUTTON"
content = re.sub(button_pattern, "          ) : (\n            // NORMAL SEND BUTTON", content, flags=re.DOTALL)

# 2. Remove the recording overlay
overlay_pattern = r"        \{\/\* RECORDING OVERLAY \*\/\}.*?\{\/\* ACTION BUTTON \(Mic or Send\) \*\/\}"
content = re.sub(overlay_pattern, "        {/* ACTION BUTTON (Send) */}", content, flags=re.DOTALL)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

print("Removed from MessageComposer.tsx")
