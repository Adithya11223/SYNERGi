const fs = require('fs');
const path = '/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx';

let content = fs.readFileSync(path, 'utf8');

// We need to add Lock to lucide-react imports
content = content.replace("import { Send, Mic, Paperclip, X, Trash2, Pause, Plus, Smile } from 'lucide-react';", "import { Send, Mic, Paperclip, X, Trash2, Pause, Plus, Smile, Lock } from 'lucide-react';");

// Add lock and pointer states
content = content.replace(
  "const [recordingDuration, setRecordingDuration] = useState(0);",
  `const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);`
);

// Add pointer handlers
const handlers = `
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isSending) return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    setIsLocked(false);
    setSlideOffset(0);
    startRecording();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRecording || isLocked) return;
    
    const deltaX = startXRef.current - e.clientX;
    const deltaY = startYRef.current - e.clientY;

    if (deltaX > 20) {
      setSlideOffset(-deltaX);
      if (deltaX > 100) {
        stopRecording(true);
      }
    } else {
      setSlideOffset(0);
    }

    if (deltaY > 50) {
      setIsLocked(true);
      setSlideOffset(0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isRecording || isLocked) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    
    // If duration is too short, just cancel it to prevent accidental taps
    const exactDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (exactDuration < 1) {
      stopRecording(true);
      return;
    }
    
    stopRecording(false);
  };
`;
content = content.replace("// ---------------- RECORDING LOGIC ---------------- //", "// ---------------- RECORDING LOGIC ---------------- //\n" + handlers);

// Update startRecording to set isRecording instantly for UI responsiveness
content = content.replace("const stream = await navigator.mediaDevices.getUserMedia({ audio: true });", "setIsRecording(true);\n      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });");
// If it fails, we need to revert isRecording
content = content.replace("toast.error(\"Microphone permission denied or unavailable\");", "setIsRecording(false);\n      toast.error(\"Microphone permission denied or unavailable\");");

// We need to rewrite the return statement.
// Since it's too complex to string replace, let's write a python script or replace a big chunk.
fs.writeFileSync('rewrite_composer.js.tmp', content);
