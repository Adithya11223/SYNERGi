import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

send_logic = """  const handleSend = () => {
    const finalContent = transcript.trim();
    if (!finalContent) {
      toast.error('No speech detected.');
      return;
    }
    setState('processing');
    onSend(finalContent);
    onClose();
  };
"""

content = content.replace("  const handleStopRecording = () => {", send_logic + "\n  const handleStopRecording = () => {")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)

print("Added handleSend")
