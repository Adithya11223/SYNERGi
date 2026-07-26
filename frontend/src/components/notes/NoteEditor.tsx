import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { useNotesStore } from "@/store/useNotesStore";
import NoteToolbar from "./NoteToolbar";
import { Input } from "@/components/ui/input";
import { Pin, Star, Lock, Settings, FileText,Trash2, Hash, Save, FileImage, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NoteEditorProps {
  noteId: string;
}

export default function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, updateNote, togglePin, toggleFavorite, toggleLock, deleteNote } = useNotesStore();
  const note = notes.find(n => n.id === noteId);

  const [title, setTitle] = useState(note?.title || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Start typing your notes here...",
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: note?.content || "",
    onUpdate: ({ editor }) => {
      updateNote(noteId, { content: editor.getHTML() });
    },
  });

  // Update editor content when active note changes
  useEffect(() => {
    if (editor && note && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
      setTitle(note.title);
    }
  }, [noteId, editor]);

  if (!note || !editor) return null;

  const handleSave = () => {
    updateNote(noteId, { content: editor.getHTML() });
    toast.success("Note saved successfully!");
  };

  const handleExportWord = () => {
    const html = editor.getHTML();
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head><body>${html}</body></html>
    `;
    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'Untitled'}.doc`;
    a.click();
    toast.success("Note exported as Word Document!");
  };

  const handleExportPDF = () => {
    // A trick to trigger native PDF export using print dialog
    window.print();
    toast.info("Select 'Save as PDF' in the print dialog.");
  };

  const handleExportPPT = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Generating PowerPoint presentation...',
        success: 'Presentation generated successfully! (Mock)',
        error: 'Failed to generate presentation',
      }
    );
  };

  const showWordCount = () => {
    const words = editor.getText().split(/\s+/).filter(w => w.length > 0).length;
    const chars = editor.getText().length;
    toast(`Word Count: ${words} words, ${chars} characters`);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId);
      toast.success("Note deleted");
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between p-4 lg:px-8 border-b border-black/5 dark:border-white/10 shrink-0">
        <div className="flex-1 mr-4">
          <Input 
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateNote(noteId, { title: e.target.value });
            }}
            placeholder="Note Title" 
            className="text-2xl font-bold border-none bg-transparent shadow-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto py-1"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => togglePin(noteId)}
            className={`w-8 h-8 rounded-full ${note.isPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
          >
            <Pin className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toggleFavorite(noteId)}
            className={`w-8 h-8 rounded-full ${note.isFavorite ? 'text-yellow-500 bg-yellow-500/10' : 'text-muted-foreground'}`}
          >
            <Star className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              toggleLock(noteId);
              toast.success(note.isLocked ? "Note unlocked" : "Note locked");
            }}
            className={`w-8 h-8 rounded-full ${note.isLocked ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:bg-red-500/10 hover:text-red-500'}`}
          >
            <Lock className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Save Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWord}>
                <FileImage className="w-4 h-4 mr-2" /> Export as Word (.doc)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPPT}>
                <Presentation className="w-4 h-4 mr-2" /> Export as PPT
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={showWordCount}>
                <Hash className="w-4 h-4 mr-2" /> Word Count
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Editor Toolbar */}
      <NoteToolbar editor={editor} />

      {/* Tiptap Editor Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm md:prose-base dark:prose-invert max-w-3xl mx-auto focus:outline-none min-h-[500px]" 
        />
      </div>

    </div>
  );
}
