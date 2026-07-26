import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'r') as f:
    content = f.read()

content = re.sub(r"            onSendVoice=\{handleSendVoice\}\n", "", content)

# Remove the handleSendVoice function definition if we want, but it might not be failing build. Let's remove it just in case.
content = re.sub(r"  const handleSendVoice = useCallback\(async \(file: File, duration: number, waveform: string\) => \{.*?    \} catch \(err\) \{\n      console\.error\(\"Failed to send voice note\", err\);\n    \}\n  \}, \[workspaceId, roomId, user, replyingTo\]\);\n\n", "", content, flags=re.DOTALL)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'w') as f:
    f.write(content)

print("Fixed TeamChat")
