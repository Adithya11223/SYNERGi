import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'r') as f:
    content = f.read()

# Fix import
content = content.replace("Search, Hash, Phone, , MessageSquare, ", "Search, Hash, Phone, MessageSquare, ")

# Remove the broken function
func = r"  const  = useCallback\(async \(file: File, duration: number, waveform: string\) => \{.*?\} catch \(err\) \{\n      console\.error\(\"Failed to send voice note\", err\);\n    \}\n  \}, \[workspaceId, roomId, user, replyingTo\]\);\n"
content = re.sub(func, "", content, flags=re.DOTALL)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'w') as f:
    f.write(content)

print("Fixed TeamChat")
