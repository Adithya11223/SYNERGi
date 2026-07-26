import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# We will regex replace the entire renderSiriOrb block up to the return statement.
match = re.search(r"  const renderSiriOrb = \(\) => \{.*?(?=  return \(\n    <AnimatePresence>)", content, re.DOTALL)
if match:
    content = content.replace(match.group(0), """  const renderPerplexityOrb = () => {
    const isRecording = state === 'recording';
    const isProcessing = state === 'processing';
    
    const scaleMult = isRecording ? smoothedLevel : (isProcessing ? 1.05 : 1);
    const speed = isRecording ? 0.4 : (isProcessing ? 0.6 : 1.2);

    return (
      <div 
        className="relative flex items-center justify-center my-8 group cursor-pointer w-40 h-40 mx-auto"
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="absolute inset-0 rounded-full blur-[40px] bg-cyan-500/30 group-hover:bg-cyan-500/40 transition-colors"
          animate={{ scale: [1, 1.3 * scaleMult, 1] }}
          transition={{ duration: 2 * speed, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-white z-10 shadow-[0_0_30px_#22d3ee] flex items-center justify-center"
          animate={{ scale: [1, 1.2 * scaleMult, 1] }}
          transition={{ duration: 1.5 * speed, repeat: Infinity, ease: 'easeInOut' }}
        >
          {isProcessing ? (
             <RefreshCw className="w-5 h-5 text-cyan-600 animate-spin" />
          ) : (
             <SpeechToTextIcon size={24} className="text-cyan-600" />
          )}
        </motion.div>

        <motion.div
          className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-cyan-400/90 border-b-cyan-400/90 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 180],
            scale: [1, 1.05 * scaleMult, 1]
          }}
          transition={{
            rotateX: { duration: 4 * speed, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 6 * speed, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2 * speed, repeat: Infinity, ease: 'easeInOut' }
          }}
        />

        <motion.div
          className="absolute inset-4 rounded-full border-[2px] border-transparent border-r-teal-300/80 border-l-teal-300/80 shadow-[0_0_15px_rgba(94,234,212,0.4)] z-20 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [180, -180],
            rotateY: [0, 360],
            rotateZ: [0, 90],
            scale: [1, 1.1 * scaleMult, 1]
          }}
          transition={{
            rotateX: { duration: 5 * speed, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 4.5 * speed, repeat: Infinity, ease: 'linear' },
            rotateZ: { duration: 7 * speed, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2.2 * speed, repeat: Infinity, ease: 'easeInOut' }
          }}
        />

        <motion.div
          className="absolute inset-6 rounded-full border-[2px] border-transparent border-t-blue-400/80 border-b-blue-400/80 shadow-[0_0_15px_rgba(96,165,250,0.4)] z-20 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [0, -360],
            rotateY: [360, 0],
            rotateZ: [360, 0],
            scale: [1, 1.15 * scaleMult, 1]
          }}
          transition={{
            rotateX: { duration: 5.5 * speed, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 3.5 * speed, repeat: Infinity, ease: 'linear' },
            rotateZ: { duration: 6 * speed, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.8 * speed, repeat: Infinity, ease: 'easeInOut' }
          }}
        />
      </div>
    );
  };
""")

content = content.replace("{renderSiriOrb()}", "{renderPerplexityOrb()}")

# Change background glow to match perplexity colors (cyan/blue instead of pink/purple)
content = content.replace("bg-purple-500/10", "bg-cyan-500/10")
content = content.replace("bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-white font-semibold text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]", "bg-cyan-500 hover:bg-cyan-400 transition-all text-[#0c1015] font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]")
content = content.replace("text-pink-400/90", "text-cyan-400/90")
content = content.replace("text-purple-400", "text-cyan-400")

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)

print("Updated SpeechToTextModal.tsx to Perplexity AI style")
