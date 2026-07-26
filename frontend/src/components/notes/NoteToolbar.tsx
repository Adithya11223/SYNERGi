import { type Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  AlignLeft, AlignCenter, AlignRight, Highlighter, Image as ImageIcon,
  Mic, Sparkles, Languages, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState, useRef} from 'react';
import { Play, Pause, X, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface NoteToolbarProps {
  editor: Editor;
}

export default function NoteToolbar({ editor }: NoteToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVoiceWidgetOpen, setIsVoiceWidgetOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser.");
      setIsVoiceWidgetOpen(false);
      return;
    }

    // Always create a fresh instance on start to reset closure state (interim tracking) 
    // and avoid "recognition already started" errors from the buggy Web Speech API.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let interimStart = 0;
    let lastInterimLength = 0;
    let hasInterim = false;

    recognition.onresult = (event: any) => {
      let currentInterim = "";
      let finalTranscripts = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscripts += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      editor.chain().focus().command(({ tr, dispatch }) => {
        if (dispatch) {
          if (hasInterim) {
            if (tr.doc.content.size >= interimStart + lastInterimLength) {
              tr.delete(interimStart, interimStart + lastInterimLength);
            }
            hasInterim = false;
          }
          
          if (finalTranscripts) {
            tr.insertText(finalTranscripts);
          }
          
          if (currentInterim) {
            interimStart = tr.selection.to;
            tr.insertText(currentInterim);
            lastInterimLength = currentInterim.length;
            hasInterim = true;
          }
        }
        return true;
      }).run();
    };
    
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        toast.error(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      }
    };
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const closeVoiceWidget = () => {
    stopRecording();
    setIsVoiceWidgetOpen(false);
  };

  const openVoiceWidget = () => {
    setIsVoiceWidgetOpen(true);
    startRecording();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          editor.chain().focus().setImage({ src: event.target.result as string }).run();
          toast.success("Image inserted!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-black/5 dark:border-white/10 shrink-0 bg-white/30 dark:bg-black/10 backdrop-blur-sm sticky top-0 z-10">
      
      {/* Basic Formatting */}
      <div className="flex items-center gap-1 pr-2 border-r border-black/5 dark:border-white/10">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')} 
          icon={<Bold className="w-4 h-4" />} 
          title="Bold"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')} 
          icon={<Italic className="w-4 h-4" />} 
          title="Italic"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive('underline')} 
          icon={<UnderlineIcon className="w-4 h-4" />} 
          title="Underline"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          isActive={editor.isActive('strike')} 
          icon={<Strikethrough className="w-4 h-4" />} 
          title="Strikethrough"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHighlight().run()} 
          isActive={editor.isActive('highlight')} 
          icon={<Highlighter className="w-4 h-4" />} 
          title="Highlight"
        />
      </div>

      {/* Headings & Alignment */}
      <div className="flex items-center gap-1 px-2 border-r border-black/5 dark:border-white/10">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 className="w-4 h-4" />} title="Heading 1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 className="w-4 h-4" />} title="Heading 2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={<Heading3 className="w-4 h-4" />} title="Heading 3" />
        <div className="w-px h-4 mx-1 bg-black/10 dark:bg-white/10" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft className="w-4 h-4" />} title="Align Left" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter className="w-4 h-4" />} title="Align Center" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight className="w-4 h-4" />} title="Align Right" />
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 px-2 border-r border-black/5 dark:border-white/10">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List className="w-4 h-4" />} title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered className="w-4 h-4" />} title="Ordered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={<CheckSquare className="w-4 h-4" />} title="Checklist" />
      </div>

      {/* Advanced Prototype Features */}
      <div className="flex items-center gap-1 pl-2 ml-auto">
        
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />

        {/* Insert Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
              <Plus className="w-4 h-4" /> Insert
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-4 h-4 mr-2" /> Image</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openVoiceWidget}>
              <Mic className="w-4 h-4 mr-2 text-blue-500" /> 
              Voice Note (Speech to Text)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 shadow-sm border-none">
              <Sparkles className="w-4 h-4" /> AI Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: "Summarizing Note...", success: "Summarized!" })}><Sparkles className="w-4 h-4 mr-2 text-purple-500" /> Summarize Note</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: "Rewriting text...", success: "Text polished!" })}><Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> Rewrite & Polish</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: "Translating...", success: "Translated!" })}><Languages className="w-4 h-4 mr-2 text-blue-500" /> Translate to...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {isVoiceWidgetOpen && (
        <motion.div 
          drag
          dragMomentum={false}
          className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 p-3 pl-2 max-w-sm rounded-3xl glass-surface border border-[var(--glass-border)] shadow-[var(--shadow-glass-lg)] cursor-move"
          style={{ x: "-50%" }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          whileDrag={{ scale: 1.05, opacity: 0.9, cursor: "grabbing" }}
        >
          <div className="text-muted-foreground/50 hover:text-muted-foreground transition-colors pr-1">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); toggleRecording(); }}
              className={`w-10 h-10 shrink-0 rounded-full ${isRecording ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </Button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{isRecording ? "Listening..." : "Paused"}</span>
              <span className="text-xs text-muted-foreground">
                {isRecording ? "Speak now" : "Edit directly in notepad"}
              </span>
            </div>
          </div>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10 mx-2 shrink-0" />
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); closeVoiceWidget(); }} className="w-8 h-8 shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function ToolbarButton({ 
  onClick, isActive, icon, title 
}: { 
  onClick: () => void, isActive: boolean, icon: React.ReactNode, title: string 
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary/20 text-primary hover:bg-primary/30' 
          : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'
      }`}
    >
      {icon}
    </Button>
  );
}
