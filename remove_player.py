import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageBubble.tsx', 'r') as f:
    content = f.read()

# Remove the player logic
player_pattern = r"          \) : message\.isVoiceNote \? \(\n            <VoiceMessagePlayer.*?\n            />\n          \) : \(\n"
content = re.sub(player_pattern, "          ) : (\n", content, flags=re.DOTALL)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageBubble.tsx', 'w') as f:
    f.write(content)

print("Removed from MessageBubble.tsx")
