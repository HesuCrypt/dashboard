import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { Bell, X } from 'lucide-react';
import { Task } from '../types';

export default function DeadlineAlerts() {
  const { tasks } = useAppContext();
  const [alerts, setAlerts] = useState<Task[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date().getTime();
      const next24h = now + 24 * 60 * 60 * 1000;
      
      const upcoming = tasks.filter(t => {
        if (t.completed || t.archived || !t.deadline) return false;
        if (dismissed.has(t.id)) return false;
        
        const deadlineTime = new Date(t.deadline).getTime();
        return deadlineTime > now && deadlineTime <= next24h;
      });

      setAlerts(upcoming);
    };

    checkDeadlines();
    // Check every minute
    const interval = setInterval(checkDeadlines, 60000);
    return () => clearInterval(interval);
  }, [tasks, dismissed]);

  const dismissAlert = (id: string) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {alerts.map(task => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            className="bg-white rounded-2xl p-4 shadow-xl border-l-4 border-l-amber-400 border-y border-r border-slate-100 flex items-start gap-4 w-80 pointer-events-auto"
          >
            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl shrink-0 mt-0.5">
              <Bell size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Due Soon</h4>
              <p className="text-sm font-medium text-slate-800 truncate">{task.text}</p>
            </div>
            <button 
              onClick={() => dismissAlert(task.id)}
              className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
