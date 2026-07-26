import { apiClient } from '@/lib/apiClient';
import type { Task, Category } from '../store/useTodoStore';

export const todoService = {
  getAllTasks: () => apiClient.get<Task[]>('/todos'),
  
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => 
    apiClient.post<Task>('/todos', task),
    
  updateTask: (id: string, updates: Partial<Task>) => 
    apiClient.put<Task>(`/todos/${id}`, updates),
    
  deleteTask: (id: string) => apiClient.delete(`/todos/${id}`),
  
  getAllCategories: () => apiClient.get<Category[]>('/todos/categories'),
  
  createCategory: (category: Omit<Category, 'id'>) => 
    apiClient.post<Category>('/todos/categories', category),
    
  updateCategory: (id: string, updates: Partial<Category>) => 
    apiClient.put<Category>(`/todos/categories/${id}`, updates),
    
  deleteCategory: (id: string) => apiClient.delete(`/todos/categories/${id}`),
};
