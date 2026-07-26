import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodoStore } from '@/store/useTodoStore';
import type { Task, TaskStatus } from '@/store/useTodoStore';
import { Calendar, CheckSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TodoBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export default function TodoBoard({ tasks, onEditTask }: TodoBoardProps) {
  const { moveTask, categories } = useTodoStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, status);
    }
    setDraggedTaskId(null);
  };

  const renderColumn = (title: string, status: TaskStatus, icon: React.ReactNode, colorClass: string) => {
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      <div 
        className="flex flex-col flex-1 w-[280px] md:w-[300px] min-w-[280px] md:min-w-[300px] h-full shrink-0 snap-center"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${colorClass} bg-opacity-10 backdrop-blur-sm`}>
              {icon}
            </div>
            <h3 className="font-semibold text-foreground/90">{title}</h3>
            <span className="bg-black/5 dark:bg-white/10 text-xs font-bold px-2 py-0.5 rounded-full">
              {columnTasks.length}
            </span>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto custom-scrollbar p-2 -mx-2 rounded-xl transition-colors min-h-[200px] ${draggedTaskId ? 'bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10' : 'border border-transparent'}`}>
          <div className="space-y-3">
            <AnimatePresence>
              {columnTasks.map(task => {
                const category = categories.find(c => c.id === task.categoryId);
                const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: draggedTaskId === task.id ? 0.5 : 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    onClick={() => onEditTask(task)}
                    className="interactive-glass p-4 rounded-xl cursor-grab active:cursor-grabbing border border-[var(--glass-border)] bg-white/50 dark:bg-[#0c1222]/50 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-2">
                        {category && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${category.color} text-white`}>
                            {category.name}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          task.priority === 'URGENT' ? 'bg-red-500 text-white' :
                          task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                          task.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                          'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-[15px] mb-1.5 text-foreground/90 leading-tight">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 mt-auto">
                      <div className="flex gap-3">
                        {totalSubtasks > 0 && (
                          <div className={`flex items-center gap-1 text-[11px] font-medium ${completedSubtasks === totalSubtasks ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                          </div>
                        )}
                      </div>
                      
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 text-[11px] font-medium ${
                          new Date(task.dueDate) < new Date() && task.status !== 'DONE' 
                            ? 'text-red-500' 
                            : 'text-muted-foreground'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {columnTasks.length === 0 && !draggedTaskId && (
              <div className="h-24 flex items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl opacity-50">
                <span className="text-sm font-medium text-muted-foreground">Drop tasks here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar snap-x snap-mandatory">
      <div className="flex h-full gap-4 md:gap-6 w-max pb-2 px-1">
        {renderColumn('To Do', 'TODO', <AlertCircle className="w-4 h-4 text-blue-500" />, 'text-blue-500')}
        {renderColumn('In Progress', 'IN_PROGRESS', <Clock className="w-4 h-4 text-amber-500" />, 'text-amber-500')}
        {renderColumn('Done', 'DONE', <CheckCircle2 className="w-4 h-4 text-emerald-500" />, 'text-emerald-500')}
      </div>
    </div>
  );
}
