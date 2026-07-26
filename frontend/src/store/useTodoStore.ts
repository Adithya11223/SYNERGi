import { create } from 'zustand';
import { todoService } from '../services/todoService';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId: string | null;
  tags: string[];
  dueDate: string | null; // ISO string
  createdAt: string; // ISO string
  subtasks: Subtask[];
}

interface TodoState {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, status: TaskStatus) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_personal', name: 'Personal', color: 'bg-blue-500' },
  { id: 'cat_work', name: 'Work', color: 'bg-indigo-500' },
  { id: 'cat_ideas', name: 'Ideas', color: 'bg-amber-500' },
];

export const useTodoStore = create<TodoState>()((set, get) => ({
  tasks: [],
  categories: DEFAULT_CATEGORIES,
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [tasksRes, categoriesRes] = await Promise.all([
        todoService.getAllTasks(),
        todoService.getAllCategories()
      ]);
      set({ 
        tasks: tasksRes.data,
        categories: categoriesRes.data.length > 0 ? categoriesRes.data : get().categories,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      set({ isLoading: false });
    }
  },

  addTask: async (taskData) => {
    // Note: To perfectly implement optimistic UI we would generate a UUID here,
    // but the backend will return the final object anyway.
    const tempId = `temp_${Date.now()}`;
    const newTask = {
      ...taskData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    
    try {
      const res = await todoService.createTask(taskData);
      set((state) => ({
        tasks: state.tasks.map(t => t.id === tempId ? res.data : t)
      }));
    } catch (err) {
      console.error("Failed to save task to backend, but keeping it in local UI state:", err);
    }
  },

  updateTask: async (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }));
    await todoService.updateTask(id, updates);
  },

  deleteTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id)
    }));
    await todoService.deleteTask(id);
  },

  moveTask: async (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t))
    }));
    await todoService.updateTask(id, { status });
  },

  addCategory: async (catData) => {
    const tempId = `temp_cat_${Date.now()}`;
    const newCategory = { ...catData, id: tempId };
    
    set((state) => {
      const safeCategories = Array.isArray(state.categories) ? state.categories : [];
      return { categories: [...safeCategories, newCategory] };
    });
    
    try {
      const res = await todoService.createCategory(catData);
      set((state) => {
        const safeCategories = Array.isArray(state.categories) ? state.categories : [];
        return { categories: safeCategories.map(c => c.id === tempId ? res.data : c) };
      });
    } catch (err) {
      console.error("Failed to save category to backend, but keeping it in local UI state:", err);
    }
  },

  deleteCategory: async (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      tasks: state.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t))
    }));
    await todoService.deleteCategory(id);
  }
}));
