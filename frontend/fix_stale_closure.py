import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# 1. Add stateRef
ref_code = """  const [audioLevel, setAudioLevel] = useState(1);
  const [smoothedLevel, setSmoothedLevel] = useState(1);
  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);"""

content = content.replace("  const [audioLevel, setAudioLevel] = useState(1);\n  const [smoothedLevel, setSmoothedLevel] = useState(1);", ref_code)

# 2. Update onend closure
old_onend = """    recognition.onend = () => {
      if (state === 'recording') {
        try { recognition.start(); } catch(e) {}
      }
    };"""

new_onend = """    recognition.onend = () => {
      if (stateRef.current === 'recording') {
        try { recognition.start(); } catch(e) {}
      }
    };"""

content = content.replace(old_onend, new_onend)

# 3. Update transcript rendering
old_render = "{interimTranscript || transcript || \"Listening...\"}"
new_render = "{(transcript + (transcript && interimTranscript ? ' ' : '') + interimTranscript) || \"Listening...\"}"

content = content.replace(old_render, new_render)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)
print("Applied stale closure fix.")
