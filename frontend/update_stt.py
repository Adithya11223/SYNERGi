import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# 1. Remove the old useEffect that initializes SpeechRecognition
old_useeffect_pattern = r"  useEffect\(\(\) => \{\n    if \(!isOpen\) \{.*?// eslint-disable-next-line react-hooks/exhaustive-deps\n  \}, \[isOpen\]\);"
content = re.sub(old_useeffect_pattern, """  useEffect(() => {
    if (!isOpen) {
      handleStopRecording();
      setState('idle');
      setTranscript('');
      setInterimTranscript('');
    }
  }, [isOpen]);""", content, flags=re.DOTALL)


# 2. Update handleStartRecording
old_start = r"  const handleStartRecording = \(\) => \{.*?\n      setState\('recording'\);\n    \} catch \(e\) \{.*?\n  \};\n"

new_start = """  const handleStartRecording = () => {
    try {
      setTranscript('');
      setInterimTranscript('');
      setErrorMsg('');
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setState('error');
        setErrorMsg('Speech recognition is not supported in this browser.');
        return;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setTranscript((prev) => prev + (prev ? ' ' : '') + final);
        }
        setInterimTranscript(interim);
        
        setAudioLevel(1 + Math.min(interim.length / 5, 1.2)); 
        setTimeout(() => setAudioLevel(1 + Math.random() * 0.2), 200);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setState('error');
          setErrorMsg('Microphone access denied.');
          handleStopRecording();
        } else if (event.error === 'network') {
          setState('error');
          setErrorMsg('Network error occurred.');
          handleStopRecording();
        } else if (event.error !== 'no-speech') {
          setState('error');
          setErrorMsg('Error recognizing speech: ' + event.error);
          handleStopRecording();
        }
      };

      recognition.onend = () => {
        if (stateRef.current === 'recording') {
          try { recognition.start(); } catch(e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setState('recording');
    } catch (e) {
      console.error(e);
      setState('error');
      setErrorMsg('Failed to start recording.');
    }
  };
"""

content = re.sub(old_start, new_start, content, flags=re.DOTALL)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)
print("Updated handleStartRecording successfully.")
