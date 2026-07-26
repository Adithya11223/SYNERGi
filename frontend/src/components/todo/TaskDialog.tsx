import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Tag, X, ListTodo, Trash2 } from "lucide-react";
import { useTodoStore } from "@/store/useTodoStore";
import type { Task, TaskPriority, TaskStatus, Subtask } from "@/store/useTodoStore";


interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: Task | null;
}

export default function TaskDialog({ open, onOpenChange, taskToEdit }: TaskDialogProps) {
  const { addTask, updateTask, deleteTask, categories } = useTodoStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [categoryId, setCategoryId] = useState<string>('none');
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Omit<Subtask, 'id'>[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  // Reset or populate fields when dialog opens
  useEffect(() => {
    if (open) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description);
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setCategoryId(taskToEdit.categoryId || 'none');
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
        setTags(taskToEdit.tags || []);
        setSubtasks(taskToEdit.subtasks || []);
      } else {
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setStatus('TODO');
        setCategoryId('none');
        setDueDate('');
        setTags([]);
        setSubtasks([]);
      }
    }
  }, [open, taskToEdit]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, { title: subtaskInput.trim(), completed: false }]);
      setSubtaskInput('');
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      categoryId: categoryId === 'none' ? null : categoryId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      tags,
      subtasks: subtasks.map(s => ({ ...s, id: s.title + Math.random() })),
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] glass-surface border-[var(--glass-border)] !bg-[#ffffff95] dark:!bg-[#0c1222e6] backdrop-blur-3xl shadow-2xl p-0 gap-0 overflow-hidden rounded-[24px]">
        <div className="p-6 pb-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </div>
        
        <div className="p-6 py-4 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Title & Desc */}
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2 block">Task Title *</Label>
              <Input 
                autoFocus
                placeholder="What needs to be done?" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="bg-white/50 dark:bg-black/20 text-lg font-medium py-6"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2 block">Description</Label>
              <Textarea 
                placeholder="Add more details about this task..." 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="bg-white/50 dark:bg-black/20 min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Category</Label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="none">None</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Priority</Label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full h-10 px-3 rounded-md border border-input bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Status (Only on Edit) */}
            {taskToEdit && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Status</Label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            )}

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Due Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className="bg-white/50 dark:bg-black/20 pl-9"
                />
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Subtasks</Label>
            <div className="space-y-2">
              {subtasks.map((st, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5">
                  <span className="text-sm">{st.title}</span>
                  <button onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a subtask..." 
                  value={subtaskInput} 
                  onChange={e => setSubtaskInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  className="bg-white/50 dark:bg-black/20 h-9"
                />
                <Button variant="secondary" size="sm" onClick={handleAddSubtask} className="px-3 shrink-0">Add</Button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <Input 
              placeholder="Type tag and press Enter" 
              value={tagInput} 
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-white/50 dark:bg-black/20 h-9"
            />
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between sm:justify-between">
          {taskToEdit ? (
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => { deleteTask(taskToEdit.id); onOpenChange(false); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Task
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="glass-surface">Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim()} className="shadow-glow min-w-[120px]">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
