import { useState } from "react";
import { Folder as FolderIcon, Lock, Pin, Plus, Search, Trash2 } from "lucide-react";
import { useNotesStore } from "@/store/useNotesStore";
import type { Note } from "@/store/useNotesStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NotesSidebarProps {
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
}

export default function NotesSidebar({ activeNoteId, setActiveNoteId }: NotesSidebarProps) {
  const { notes, folders, addNote, deleteNote, addFolder, deleteFolder } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeFolders = Array.isArray(folders) ? folders : [];

  const filteredNotes = safeNotes.filter(note => {
    const matchesSearch = (note.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (note.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolderId === null || note.folderId === activeFolderId;
    return matchesSearch && matchesFolder;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  const handleCreateNote = async () => {
    const newNoteId = await addNote({
      title: "Untitled Note",
      content: "",
      folderId: activeFolderId,
      tags: [],
      isPinned: false,
      isLocked: false,
      isFavorite: false,
      status: "draft"
    });
    setActiveNoteId(newNoteId);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (name) {
      addFolder({ name, parentId: null, icon: 'Folder' });
    }
  };

  return (
    <div className="flex flex-col w-72 h-full shrink-0 border-r border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-6 pt-12 md:pt-2">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
          <FolderIcon className="w-5 h-5 text-primary" /> Notes
        </h2>
        <Button onClick={handleCreateNote} size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..." 
          className="pl-9 bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/10 rounded-xl"
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        
        {/* Folders */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex justify-between items-center">
            Folders
            <Button onClick={handleCreateFolder} variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveFolderId(null)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeFolderId === null ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2"><FolderIcon className="w-4 h-4" /> All Notes</div>
              <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{safeNotes.length}</span>
            </button>
            
            {safeFolders.map(folder => {
              const count = safeNotes.filter(n => n.folderId === folder.id).length;
              return (
                <div key={folder.id} className="relative group">
                  <button 
                    onClick={() => setActiveFolderId(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeFolderId === folder.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-2 pr-8 truncate"><FolderIcon className="w-4 h-4 shrink-0" /> <span className="truncate">{folder.name}</span></div>
                    <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px] shrink-0">{count}</span>
                  </button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); if(activeFolderId===folder.id) setActiveFolderId(null); }}
                    className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Note List */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {activeFolderId ? safeFolders.find(f => f.id === activeFolderId)?.name : 'All Notes'}
          </div>
          
          <div className="space-y-2">
            {pinnedNotes.length > 0 && (
              <div className="mb-4 space-y-1">
                <div className="text-[10px] font-medium text-muted-foreground uppercase px-2 mb-1 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned
                </div>
                {pinnedNotes.map(note => (
                  <NoteItem 
                    key={note.id} 
                    note={note} 
                    isActive={activeNoteId === note.id} 
                    onClick={() => setActiveNoteId(note.id)} 
                    onDelete={() => handleDeleteNote(note.id)}
                  />
                ))}
              </div>
            )}
            
            <div className="space-y-1">
              {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
                <div className="text-[10px] font-medium text-muted-foreground uppercase px-2 mb-1">Recent</div>
              )}
              {unpinnedNotes.map(note => (
                <NoteItem 
                  key={note.id} 
                  note={note} 
                  isActive={activeNoteId === note.id} 
                  onClick={() => setActiveNoteId(note.id)} 
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))}
              {filteredNotes.length === 0 && (
                <div className="text-sm text-center text-muted-foreground py-8">No notes found.</div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function NoteItem({ note, isActive, onClick, onDelete }: { note: Note, isActive: boolean, onClick: () => void, onDelete: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl p-3 border transition-all duration-200",
        isActive 
          ? "bg-white dark:bg-[#1a2333] border-primary/20 shadow-sm" 
          : "bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className={cn("text-sm font-semibold truncate pr-2", isActive ? "text-primary" : "text-foreground")}>
          {note.isLocked && <Lock className="inline w-3 h-3 mr-1" />}
          {note.title || "Untitled Note"}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive -mr-1 -mt-1 transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {(note.content || "").replace(/<[^>]*>?/gm, '') || "No content..."}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-medium text-muted-foreground/70">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0,2).map(tag => (
              <span key={tag} className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
