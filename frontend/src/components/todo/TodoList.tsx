import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodoStore } from '@/store/useTodoStore';
import type { Task } from '@/store/useTodoStore';
import { CheckCircle2, Circle, Clock, Calendar } from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export default function TodoList({ tasks, onEditTask }: TodoListProps) {
  const { moveTask, categories } = useTodoStore();

  const toggleStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    moveTask(task.id, task.status === 'DONE' ? 'TODO' : 'DONE');
  };

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground opacity-50">
        <p>No tasks found for the current filter.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
      <AnimatePresence>
        {tasks.map(task => {
          const category = categories.find(c => c.id === task.categoryId);
          const isDone = task.status === 'DONE';

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onEditTask(task)}
              className={`interactive-glass flex items-center gap-4 p-3 rounded-xl cursor-pointer border border-[var(--glass-border)] transition-all ${
                isDone ? 'bg-black/5 dark:bg-white/5 opacity-60' : 'bg-white/50 dark:bg-[#0c1222]/50 hover:shadow-md'
              }`}
            >
              <button 
                onClick={(e) => toggleStatus(e, task)}
                className={`shrink-0 p-1 rounded-full transition-colors ${
                  isDone ? 'text-emerald-500' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </button>

              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-[15px] truncate ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  {category && (
                    <span className={`font-medium flex items-center gap-1`}>
                      <div className={`w-2 h-2 rounded-full ${category.color}`} />
                      {category.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${
                      new Date(task.dueDate) < new Date() && !isDone 
                        ? 'text-red-500 font-medium' 
                        : 'text-muted-foreground'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  task.priority === 'URGENT' ? 'bg-red-500 text-white' :
                  task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                  task.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                  'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                }`}>
                  {task.priority}
                </span>
                {!isDone && task.status === 'IN_PROGRESS' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    In Progress
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
