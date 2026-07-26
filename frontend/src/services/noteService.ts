import { apiClient } from '@/lib/apiClient';
import type { Note, Folder } from '../store/useNotesStore';

export const noteService = {
  getAllNotes: () => apiClient.get<Note[]>('/notes'),
  
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<Note>('/notes', note),
    
  updateNote: (id: string, updates: Partial<Note>) => 
    apiClient.put<Note>(`/notes/${id}`, updates),
    
  deleteNote: (id: string) => apiClient.delete(`/notes/${id}`),
  
  getAllFolders: () => apiClient.get<Folder[]>('/notes/folders'),
  
  createFolder: (folder: Omit<Folder, 'id'>) => 
    apiClient.post<Folder>('/notes/folders', folder),
    
  updateFolder: (id: string, updates: Partial<Folder>) => 
    apiClient.put<Folder>(`/notes/folders/${id}`, updates),
    
  deleteFolder: (id: string) => apiClient.delete(`/notes/folders/${id}`),
};
