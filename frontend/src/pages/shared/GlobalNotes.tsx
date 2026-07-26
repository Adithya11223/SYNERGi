import { useState, useEffect } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import NotesSidebar from "@/components/notes/NotesSidebar";
import NoteEditor from "@/components/notes/NoteEditor";

export default function GlobalNotes() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    useNotesStore.getState().fetchData();
  }, []);

  return (
    <div className="flex h-[calc(100%+6rem)] md:h-[calc(100%+2rem)] -ml-4 sm:-ml-6 md:-ml-8 -mr-4 sm:-mr-2 md:mr-[18px] lg:mr-4 -mb-24 md:-mb-8 overflow-hidden rounded-[24px] md:rounded-3xl glass-surface border border-[var(--glass-border)] shadow-sm">
      
      {/* Left Sidebar */}
      <NotesSidebar 
        activeNoteId={activeNoteId} 
        setActiveNoteId={setActiveNoteId} 
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
        {activeNoteId ? (
          <NoteEditor noteId={activeNoteId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-primary/20">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Select a Note</h3>
            <p className="max-w-md text-sm leading-relaxed mb-8">
              Choose a note from the sidebar or create a new one to start writing, organizing, and syncing your ideas with AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
