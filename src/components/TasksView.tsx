import { motion, AnimatePresence } from 'motion/react';
import { Task, TaskCategory } from '../types';
import { useAppContext } from '../AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, AlertCircle, Calendar as CalIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export default function TasksView() {
  const { tasks, setTasks } = useAppContext();
  
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('None');
  const [deadline, setDeadline] = useState('');
  const [important, setImportant] = useState(false);
  const [autoArchive, setAutoArchive] = useLocalStorage('tasks_auto_archive', false);

  useEffect(() => {
    if (autoArchive) {
      let changed = false;
      const newTasks = tasks.map(t => {
        if (t.completed && !t.archived) {
          changed = true;
          return { ...t, archived: true };
        }
        return t;
      });
      if (changed) {
        setTasks(newTasks);
      }
    }
  }, [autoArchive, tasks, setTasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      description,
      category,
      deadline,
      important,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    setDescription('');
    setCategory('None');
    setDeadline('');
    setImportant(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, 
      completed: !t.completed,
      completedAt: !t.completed ? new Date().toISOString() : undefined
    } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const categories: TaskCategory[] = ['None', 'Work', 'Personal', 'Urgent'];

  const uncompletedTasks = tasks.filter(t => !t.completed && !t.archived);
  const completedTasks = tasks.filter(t => t.completed && !t.archived);

  return (
    <div className="flex flex-col gap-6">
      
      <section className="bg-white rounded-3xl p-6 border border-blue-50 shadow-sm flex flex-col">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Add Task</h2>
        <form onSubmit={addTask} className="space-y-4">
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-blue-50/50 border border-blue-50 rounded-2xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-200 transition-all font-medium"
          />
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="bg-blue-50/50 border border-blue-50 rounded-xl px-3 py-2 outline-none text-xs font-medium text-slate-600 focus:border-blue-200"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="bg-blue-50/50 border border-blue-50 rounded-xl px-3 py-2 outline-none text-xs font-medium text-slate-600 focus:border-blue-200 min-w-[130px]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={clsx(
                  "w-8 h-5 rounded-full transition-colors relative flex items-center shadow-inner",
                  important ? "bg-red-400" : "bg-slate-200"
                )}>
                  <motion.div 
                    className="w-3.5 h-3.5 bg-white rounded-full mx-0.5 shadow-sm"
                    animate={{ x: important ? 12 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  Important
                </span>
              </label>
            </div>
            <button 
              type="submit"
              disabled={!description.trim()}
              className="bg-blue-100/50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-3xl p-6 border border-blue-50 shadow-sm flex flex-col min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Task List</h2>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={autoArchive as boolean} 
              onChange={(e) => setAutoArchive(e.target.checked)} 
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Auto-Archive on complete</span>
            <div className={clsx(
              "w-8 h-5 rounded-full transition-colors relative flex items-center shadow-inner",
              autoArchive ? "bg-blue-400" : "bg-slate-200"
            )}>
              <motion.div 
                className="w-3.5 h-3.5 bg-white rounded-full mx-0.5 shadow-sm"
                animate={{ x: autoArchive ? 12 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
          </label>
        </div>
        <div className="space-y-6">
          <TaskList title="Active" tasks={uncompletedTasks} onToggle={toggleTask} onDelete={deleteTask} />
          {completedTasks.length > 0 && (
            <TaskList title="Completed" tasks={completedTasks} onToggle={toggleTask} onDelete={deleteTask} />
          )}
          {tasks.length === 0 && (
            <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-300 mt-12 py-12">No tasks available</div>
          )}
        </div>
      </section>
    </div>
  );
}

function TaskList({ title, tasks, onToggle, onDelete }: { title: string, tasks: Task[], onToggle: (id: string) => void, onDelete: (id: string) => void }) {
  if (tasks.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</h3>
      <div className="space-y-3 overflow-hidden">
        <AnimatePresence mode='popLayout'>
          {tasks.map(task => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              key={task.id} 
              className={clsx(
                "flex items-center gap-3 p-3 rounded-2xl group transition-all",
                task.completed ? "opacity-50 grayscale" : (task.important ? "bg-blue-50/20 border border-blue-100" : "bg-blue-50/30 border border-blue-50")
              )}
            >
              <button 
                onClick={() => onToggle(task.id)}
                className={clsx(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  task.completed ? "bg-blue-400 text-white" : "border-2 border-blue-200 hover:bg-blue-100 text-transparent"
                )}
              >
                {task.completed && <Check size={12} strokeWidth={3} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  "text-sm",
                  task.completed ? "line-through text-slate-500 font-normal" : "text-slate-800 font-medium"
                )}>
                  {task.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px]">
                  {task.category !== 'None' && (
                    <span className="text-slate-400">
                      {task.category}
                    </span>
                  )}
                  {task.category !== 'None' && task.deadline && <span className="text-slate-300">•</span>}
                  {task.deadline && (
                    <span className="text-slate-400">
                      {format(new Date(task.deadline), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {task.important && !task.completed && (
                 <div className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight mr-2">Urgent</div>
              )}

              <button 
                onClick={() => onDelete(task.id)}
                className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
