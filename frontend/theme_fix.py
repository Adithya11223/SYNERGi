import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# 1. Update modal container backgrounds and borders to use theme variables
content = content.replace("bg-[#0c1015]/70 backdrop-blur-3xl border border-white/15", "bg-card/90 backdrop-blur-3xl border border-border")
content = content.replace("bg-black/60 backdrop-blur-md", "bg-background/60 backdrop-blur-sm")

# 2. Update textarea container to match MessageComposer
content = content.replace("bg-black/40 backdrop-blur-2xl rounded-2xl p-5 border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] mb-6 relative group transition-all focus-within:border-white/20 focus-within:bg-black/50", "bg-black/20 rounded-2xl p-4 border border-border mb-6 relative group transition-all focus-within:border-primary/50")

# 3. Update Ambient Glows
content = content.replace("bg-cyan-500/10", "bg-primary/10")
content = content.replace("bg-blue-500/10", "bg-blue-500/10") # keep one blue

# 4. Update the Orb colors from Cyan/Teal to Primary/Purple/Blue
# Core Glow
content = content.replace("bg-cyan-500/30 group-hover:bg-cyan-500/40", "bg-primary/20 group-hover:bg-primary/30")
# Core Dot
content = content.replace("bg-white z-10 shadow-[0_0_30px_#22d3ee]", "bg-primary z-10 shadow-[0_0_30px_rgba(var(--primary),0.8)]")
# Center Icon color
content = content.replace("text-cyan-600", "text-primary-foreground")

# Ring 1
content = content.replace("border-t-cyan-400/90 border-b-cyan-400/90 shadow-[0_0_15px_rgba(34,211,238,0.5)]", "border-t-primary border-b-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]")
# Ring 2
content = content.replace("border-r-teal-300/80 border-l-teal-300/80 shadow-[0_0_15px_rgba(94,234,212,0.4)]", "border-r-purple-500/80 border-l-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.4)]")
# Ring 3 (Keep blue but maybe adjust)
content = content.replace("border-t-blue-400/80 border-b-blue-400/80 shadow-[0_0_15px_rgba(96,165,250,0.4)]", "border-t-blue-500/80 border-b-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]")

# 5. Buttons and Text
content = content.replace("text-cyan-400/90", "text-primary/90")
content = content.replace("text-cyan-400", "text-primary")
content = content.replace("bg-cyan-500 hover:bg-cyan-400 transition-all text-[#0c1015] font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]", "bg-primary hover:bg-primary/90 transition-all text-primary-foreground font-semibold text-sm shadow-lg")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)

print("Updated SpeechToTextModal.tsx to match SYNERGi theme")
