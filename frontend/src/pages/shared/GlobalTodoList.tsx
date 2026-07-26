import { useState, useEffect } from "react";
import { 
  CheckSquare, Plus, LayoutGrid, List as ListIcon, 
  Search, Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTodoStore } from "@/store/useTodoStore";
import type { Task } from "@/store/useTodoStore";
import TodoBoard from "@/components/todo/TodoBoard";
import TodoList from "@/components/todo/TodoList";
import TaskDialog from "@/components/todo/TaskDialog";

export default function GlobalTodoList() {
  const { tasks, categories } = useTodoStore();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    useTodoStore.getState().fetchData();
  }, []);

  // Filter tasks based on search and category
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = safeTasks.filter(task => {
    const matchesSearch = (task.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-[calc(100%+6rem)] md:h-[calc(100%+2rem)] -ml-4 sm:-ml-6 md:-ml-8 -mr-4 sm:-mr-2 md:mr-[18px] lg:mr-4 -mb-24 md:-mb-8 overflow-hidden rounded-[24px] md:rounded-3xl glass-surface border border-[var(--glass-border)] shadow-sm">
      
      {/* Sidebar for Categories & Filters */}
      <div className="hidden lg:flex flex-col w-64 h-full shrink-0 border-r border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 p-6 pt-12 md:pt-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <CheckSquare className="w-5 h-5 text-primary" /> To-Do List
          </h2>
        </div>

        <div className="space-y-1 mb-8">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" /> All Tasks
            </div>
            <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-xs">{safeTasks.length}</span>
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Categories</div>
          <div className="space-y-1">
            {(Array.isArray(categories) ? categories : []).map(category => {
              const count = safeTasks.filter(t => t.categoryId === category.id).length;
              return (
                <button 
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${category.color}`} />
                    {category.name}
                  </div>
                  <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-xs">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 lg:p-6 shrink-0 z-10 border-b border-black/5 dark:border-white/10 lg:border-none">
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">To-Do List</h1>
          </div>
          
          {/* Mobile Categories (Dropdown) */}
          <div className="lg:hidden w-full">
             <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-ring glass-surface"
              >
                <option value="all">All Tasks</option>
                {(Array.isArray(categories) ? categories : []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
          </div>

          <div className="flex-1 max-w-md w-full relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/50 dark:bg-black/20 border-[var(--glass-border)] h-10 rounded-xl w-full"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 shrink-0">
              <button 
                onClick={() => setView('board')}
                className={`p-1.5 rounded-lg transition-all ${view === 'board' ? 'bg-white dark:bg-[#1a2133] shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-[#1a2133] shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            
            <Button onClick={handleCreateTask} className="w-full sm:w-auto shadow-glow rounded-xl shrink-0 h-10">
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          </div>
        </div>

        {/* Task Board / List Container */}
        <div className="flex-1 overflow-hidden p-4 pb-32 md:pb-4 lg:p-6 lg:pt-0 flex flex-col">
          {view === 'board' ? (
            <TodoBoard tasks={filteredTasks} onEditTask={handleEditTask} />
          ) : (
            <TodoList tasks={filteredTasks} onEditTask={handleEditTask} />
          )}
        </div>

      </div>

      {/* Task Dialog */}
      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        taskToEdit={taskToEdit} 
      />
    </div>
  );
}
