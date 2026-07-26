import { create } from 'zustand';
import { noteService } from '../services/noteService';

export type NoteStatus = 'draft' | 'published' | 'archived';

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
  password?: string;
  isFavorite: boolean;
  status: NoteStatus;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface NotesState {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  isLoading: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleLock: (id: string) => Promise<void>;
  
  addFolder: (folder: Omit<Folder, 'id'>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  
  addTag: (tag: Omit<Tag, 'id'>) => void;
  deleteTag: (id: string) => void;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  folders: [
    { id: '1', name: 'Personal', parentId: null, icon: 'User' },
    { id: '2', name: 'Work', parentId: null, icon: 'Briefcase' },
    { id: '3', name: 'Ideas', parentId: null, icon: 'Lightbulb' },
  ],
  tags: [
    { id: '1', name: 'Important', color: 'bg-red-500' },
    { id: '2', name: 'Review', color: 'bg-yellow-500' },
    { id: '3', name: 'Done', color: 'bg-green-500' },
  ],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [notesRes, foldersRes] = await Promise.all([
        noteService.getAllNotes(),
        noteService.getAllFolders()
      ]);
      set({ 
        notes: notesRes.data,
        // Optional: you can merge default folders with backend folders or just use backend folders.
        // For now, we will append backend folders to default if you prefer, or just overwrite.
        folders: foldersRes.data.length > 0 ? foldersRes.data : get().folders,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      set({ isLoading: false });
    }
  },

  addNote: async (note) => {
    // Optimistic UI updates could go here, but for simplicity we wait for the server
    const res = await noteService.createNote(note);
    set((state) => ({ notes: [res.data, ...state.notes] }));
    return res.data.id;
  },
  
  updateNote: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      notes: state.notes.map(note => note.id === id ? { ...note, ...updates, updatedAt: new Date() as any } : note)
    }));
    try {
      await noteService.updateNote(id, updates);
    } catch(err) {
      // Revert in real app
      console.error(err);
    }
  },
  
  deleteNote: async (id) => {
    set((state) => ({ notes: state.notes.filter(n => n.id !== id) }));
    await noteService.deleteNote(id);
  },
  
  togglePin: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (note) {
      get().updateNote(id, { isPinned: !note.isPinned });
    }
  },
  
  toggleFavorite: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (note) {
      get().updateNote(id, { isFavorite: !note.isFavorite });
    }
  },
  
  toggleLock: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (note) {
      get().updateNote(id, { isLocked: !note.isLocked });
    }
  },

  addFolder: async (folder) => {
    const res = await noteService.createFolder(folder);
    set((state) => ({ folders: [...state.folders, res.data] }));
  },
  
  updateFolder: async (id, updates) => {
    set((state) => ({
      folders: state.folders.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
    await noteService.updateFolder(id, updates);
  },
  
  deleteFolder: async (id) => {
    set((state) => ({
      folders: state.folders.filter(f => f.id !== id),
      notes: state.notes.map(n => n.folderId === id ? { ...n, folderId: null } : n)
    }));
    await noteService.deleteFolder(id);
  },

  addTag: (tag) => set((state) => ({
    tags: [...state.tags, { ...tag, id: crypto.randomUUID() }]
  })),
  
  deleteTag: (id) => set((state) => ({
    tags: state.tags.filter(t => t.id !== id),
    notes: state.notes.map(n => ({
      ...n,
      tags: n.tags.filter(tId => tId !== id)
    }))
  })),
}));
