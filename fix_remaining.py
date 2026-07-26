import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/TeamChatSidebar.tsx', 'r') as f:
    content = f.read()

content = re.sub(r"const \[activeTab, setActiveTab\] = useState.*?\n", "", content)
with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/TeamChatSidebar.tsx', 'w') as f:
    f.write(content)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'r') as f:
    content = f.read()

content = re.sub(r", Video ", " ", content)
with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'w') as f:
    f.write(content)

print("Fixed")
