import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'r') as f:
    content = f.read()

# Just remove the whole function using regex dotall
func = r"  const handleSendVoice = useCallback.*?\[workspaceId, roomId, user, replyingTo\]\);\n\n"
content = re.sub(func, "", content, flags=re.DOTALL)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'w') as f:
    f.write(content)

print("Fixed")
