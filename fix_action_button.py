import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

bad_block = r"        \{\/\* ACTION BUTTON \(Send\) \*\/\}\n        <div className=\{\`flex items-center shrink-0 \$\{isPrivateChat \? 'ml-1 mb-0\.5' : 'pr-1 mb-1'\}\`\}>\n          \{isRecording && isLocked \? \(\n            // SEND BUTTON WHEN LOCKED\n            <button \n              type=\"button\"\n              onClick=\{\(\) => stopRecording\(false\)\}\n              className=\{\`p-2\.5 rounded-full shadow-lg transition-colors flex items-center justify-center shrink-0 w-12 h-12 \$\{isPrivateChat \? 'bg-\[\#00a884\] hover:bg-\[\#00a884\]/90 text-\[\#111b21\]' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25'\}\`\}\n            >\n              <Send className=\"w-5 h-5 ml-0\.5\" />\n            </button>\n          \) : \(\n            // NORMAL SEND BUTTON\n            <button "

good_block = r"""        {/* ACTION BUTTON (Send) */}
        <div className={`flex items-center shrink-0 ${isPrivateChat ? 'ml-1 mb-0.5' : 'pr-1 mb-1'}`}>
            <button """

content = re.sub(bad_block, good_block, content, flags=re.DOTALL)

# Also remove `isRecording` check in the Char Limit Warning, and `!isRecording &&` in TEXT INPUT AREA
content = content.replace("{!isRecording && (", "(true && (")
content = content.replace("}) || isRecording ?", "}) ?")
content = content.replace("!isRecording && text.length > 3800", "text.length > 3800")
content = content.replace("{isRecording && isLocked ?", "{false ?")

# Clean up any trailing `)}` from the `isRecording && isLocked` ternary
content = re.sub(r"              </button>\n          \)\}\n        </div>", "              </button>\n        </div>", content)


with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

print("Fixed action button")
