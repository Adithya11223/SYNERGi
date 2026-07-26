import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'r') as f:
    content = f.read()

# Remove toast import
content = re.sub(r"import \{ toast \} from 'sonner';\n", "", content)

# Remove unused states and refs
unused = [
    r"  const \[isRecording, setIsRecording\] = useState\(false\);\n",
    r"  const \[isPaused, setIsPaused\] = useState\(false\);\n",
    r"  const \[isLocked, setIsLocked\] = useState\(false\);\n",
    r"  const startXRef = useRef<number>\(0\);\n",
    r"  const startYRef = useRef<number>\(0\);\n",
    r"  const \[liveWaveform, setLiveWaveform\] = useState<number\[\]>\(Array\(30\)\.fill\(10\)\);\n  \n",
    r"  const mediaRecorderRef = useRef<MediaRecorder \| null>\(null\);\n",
    r"  const audioContextRef = useRef<AudioContext \| null>\(null\);\n",
    r"  const analyserRef = useRef<AnalyserNode \| null>\(null\);\n",
    r"  const dataArrayRef = useRef<Uint8Array \| null>\(null\);\n",
    r"  const sourceRef = useRef<MediaStreamAudioSourceNode \| null>\(null\);\n",
    r"  const animationFrameRef = useRef<number \| null>\(null\);\n",
    r"  const timerRef = useRef<ReturnType<typeof setInterval> \| null>\(null\);\n",
    r"  const startTimeRef = useRef<number>\(0\);\n",
    r"  const audioChunksRef = useRef<Blob\[\]>\(\[\]\);\n",
    r"  const streamRef = useRef<MediaStream \| null>\(null\);\n"
]

for pat in unused:
    content = re.sub(pat, "", content)

# Remove onSendVoice from props and destructured args
content = re.sub(r"  onSendVoice\?: \(file: File, duration: number, waveform: string\) => void;\n", "", content)
content = re.sub(r"  onSend, onSendVoice, onSendFiles,", "  onSend, onSendFiles,", content)


with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/MessageComposer.tsx', 'w') as f:
    f.write(content)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/TeamChatSidebar.tsx', 'r') as f:
    sidebar = f.read()
sidebar = re.sub(r", MoreVertical ", " ", sidebar)
sidebar = re.sub(r"const \[activeTab, setActiveTab\] = useState<'channels' \| 'dms'>\('channels'\);\n", "", sidebar)
with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/TeamChatSidebar.tsx', 'w') as f:
    f.write(sidebar)

with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'r') as f:
    teamchat = f.read()
teamchat = re.sub(r", Video ", " ", teamchat)
with open('/Users/adithya/Developer/SYNERGi/frontend/src/pages/shared/TeamChat.tsx', 'w') as f:
    f.write(teamchat)

print("Fixed unused variables")
