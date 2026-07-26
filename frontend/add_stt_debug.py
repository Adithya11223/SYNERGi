import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# First, add a global render counter
if "let globalRenderCount = 0;" not in content:
    content = content.replace(
        "export const SpeechToTextModal: React.FC<SpeechToTextModalProps> = ({ isOpen, onClose, onSend }) => {",
        "let globalRenderCount = 0;\nlet globalInstanceCount = 0;\nexport const SpeechToTextModal: React.FC<SpeechToTextModalProps> = ({ isOpen, onClose, onSend }) => {\n  globalRenderCount++;\n  console.log('===== REACT RENDER =====', globalRenderCount);"
    )

new_start_logic = """  const handleStartRecording = async () => {
    try {
      console.log("\\n\\n===== SPEECH DEBUG START =====");
      console.log("Browser Info:", navigator.userAgent);
      console.log("isSecureContext:", window.isSecureContext);
      
      const SR = (window as any).SpeechRecognition;
      const WSR = (window as any).webkitSpeechRecognition;
      console.log("window.SpeechRecognition exists:", !!SR);
      console.log("window.webkitSpeechRecognition exists:", !!WSR);
      console.log("navigator.mediaDevices exists:", !!(navigator.mediaDevices));
      console.log("navigator.mediaDevices.getUserMedia exists:", !!(navigator.mediaDevices?.getUserMedia));
      
      setTranscript('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      setErrorMsg('');
      isStoppingRef.current = false;
      
      const SpeechRecognition = SR || WSR;
      if (!SpeechRecognition) {
        console.error("SpeechRecognition is NOT supported.");
        setState('error');
        setErrorMsg('Speech recognition is not supported in this browser.');
        return;
      }
      
      console.log("Microphone permission requested...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Permission granted. MediaStream active.");
        console.log("Stream:", stream);
        const tracks = stream.getAudioTracks();
        console.log("AudioTracks:", tracks.length);
        if (tracks.length > 0) {
          const track = tracks[0];
          console.log("Track.enabled:", track.enabled);
          console.log("Track.readyState:", track.readyState);
          console.log("Track.muted:", track.muted);
        } else {
          console.error("No audio tracks found in stream.");
        }
      } catch (err: any) {
        console.error("Permission denied", err);
        setState('error');
        setErrorMsg('Microphone access denied. Please allow microphone access in your browser settings.');
        return;
      }
      
      if (recognitionRef.current) {
        console.log("Destroying previous recognition instance.");
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }

      globalInstanceCount++;
      console.log("Recognition instance created (Total instances: " + globalInstanceCount + ")");
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      recognition.maxAlternatives = 1;
      
      console.log("Configuration:");
      console.log("recognition.continuous:", recognition.continuous);
      console.log("recognition.interimResults:", recognition.interimResults);
      console.log("recognition.lang:", recognition.lang);
      console.log("recognition.maxAlternatives:", recognition.maxAlternatives);
      
      recognition.onstart = () => console.log("onstart fired");
      recognition.onaudiostart = () => console.log("onaudiostart fired");
      recognition.onsoundstart = () => console.log("onsoundstart fired");
      recognition.onspeechstart = () => console.log("onspeechstart fired");
      
      recognition.onspeechend = () => console.log("onspeechend fired");
      recognition.onsoundend = () => console.log("onsoundend fired");
      recognition.onaudioend = () => console.log("onaudioend fired");
      
      recognition.onnomatch = () => console.log("onnomatch fired");

      recognition.onresult = (event: any) => {
        console.log("onresult fired. Results count:", event.results.length);
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        
        if (final) {
          console.log("Final transcript extracted:", final);
          finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + final;
          setTranscript(finalTranscriptRef.current);
        }
        
        if (interim) {
          console.log("Interim transcript extracted:", interim);
        }
        
        setInterimTranscript(interim);
        
        setAudioLevel(1 + Math.min(interim.length / 5, 1.2)); 
        setTimeout(() => setAudioLevel(1 + Math.random() * 0.2), 200);
      };

      recognition.onerror = (event: any) => {
        console.error('onerror fired:', event.error, event.message || '');
        if (isStoppingRef.current) return;
        
        if (event.error === 'not-allowed') {
          setState('error');
          setErrorMsg('Microphone access denied.');
        } else if (event.error === 'network') {
          setState('error');
          setErrorMsg('Network error occurred.');
        } else if (event.error !== 'no-speech') {
          setState('error');
          setErrorMsg('Error recognizing speech: ' + event.error);
        }
      };

      recognition.onend = () => {
        console.log("onend fired");
        if (isStoppingRef.current) {
          console.log("Recognition stopped gracefully.");
          setTranscript(finalTranscriptRef.current);
          setInterimTranscript('');
          setState('processing');
          setTimeout(() => {
            setState('ready');
          }, 500);
        } else if (stateRef.current === 'recording') {
          console.log("Engine paused or stopped unexpectedly, but state is still recording. Attempting to restart...");
          try { recognition.start(); } catch(e) { console.error("Failed to restart", e); }
        } else {
          console.log("onend fired, but state is not recording:", stateRef.current);
        }
        console.log("===== SPEECH DEBUG END =====");
      };

      recognitionRef.current = recognition;
      console.log("Calling recognition.start()...");
      recognition.start();
      setState('recording');
    } catch (e) {
      console.error("Exception in handleStartRecording:", e);
      setState('error');
      setErrorMsg('Failed to start recording.');
    }
  };"""

old_start_pattern = r"  const handleStartRecording = async \(\) => \{.*?\n      setState\('error'\);\n      setErrorMsg\('Failed to start recording\.'\);\n    \}\n  \};"
content = re.sub(old_start_pattern, new_start_logic, content, flags=re.DOTALL)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)

print("Injected heavy debug logging.")
