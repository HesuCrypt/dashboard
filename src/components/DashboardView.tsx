import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';
import { formatCurrency, formatTimeExact } from '../utils';
import { CheckSquare, Clock, Wallet, Calendar as CalIcon, FileText, Sparkles, Target, Tv } from 'lucide-react';
import { Tab } from '../types';
import { format } from 'date-fns';

interface Props {
  onNavigate: (tab: Tab) => void;
}

export default function DashboardView({ onNavigate }: Props) {
  const { tasks, overtimeLogs, finance, calendarEvents, notes, animeList } = useAppContext();

  // Basic counters
  const activeTasksCount = tasks.filter(t => !t.completed && !t.archived).length;
  const totalOtMinutes = overtimeLogs.reduce((sum, log) => sum + Math.max(0, log.overtimeMinutes), 0);
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayEventsCount = calendarEvents.filter(e => e.date === todayStr).length;
  const urgentBillsCount = finance.bills.filter(b => !b.paid && (new Date(b.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 3).length;

  // Monthly logic for new floating card
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const thisMonthOtMinutes = overtimeLogs
    .filter(log => log.date.startsWith(currentMonthStr))
    .reduce((sum, log) => sum + Math.max(0, log.overtimeMinutes), 0);
  const thisMonthOtHours = (thisMonthOtMinutes / 60).toFixed(1);
  
  const savingsProgress = finance.homeGoal > 0 
    ? Math.min(100, Math.round((finance.bankBalance / finance.homeGoal) * 100))
    : 0;

  const watchingAnimeCount = animeList.filter(a => a.status === 'Watching').length;

  return (
    <div className="flex flex-col gap-6 h-full">

      {/* Floating Monthly Summary Card - Spirited Away Animation */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} />
        </div>
        
        <div className="flex flex-col z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            Monthly Pulse
          </h2>
          <p className="text-slate-200 font-medium">Your current progress at a glance</p>
        </div>

        <div className="flex flex-wrap gap-4 z-10 w-full md:w-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-1 flex-1 md:flex-initial min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Tasks</span>
            <div className="flex items-center gap-2 text-white">
              <CheckSquare size={16} className="text-blue-400" />
              <span className="text-xl font-light">{activeTasksCount}</span>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-1 flex-1 md:flex-initial min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">OT Hours</span>
            <div className="flex items-center gap-2 text-white">
              <Clock size={16} className="text-purple-400" />
              <span className="text-xl font-light">{thisMonthOtHours}h</span>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-1 flex-1 md:flex-initial min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Savings</span>
            <div className="flex items-center gap-2 text-white">
              <Target size={16} className="text-emerald-400" />
              <span className="text-xl font-light">{savingsProgress}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tasks Summary */}
        <motion.button 
          whileHover={{ y: -6, scale: 1.02 }} 
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={() => onNavigate('tasks')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col text-left group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 w-full">
             <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Active Tasks</h2>
             <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <CheckSquare size={14} />
             </div>
          </div>
          <p className="text-3xl font-light text-slate-900">{activeTasksCount}</p>
          <p className="text-[10px] text-blue-500 font-medium mt-auto pt-4 uppercase">Tasks Pending</p>
        </motion.button>

        {/* Finance Summary */}
        <motion.button 
          whileHover={{ y: -6, scale: 1.02 }} 
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={() => onNavigate('finance')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col text-left group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 w-full">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Bank Balance</h2>
             <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <Wallet size={14} />
             </div>
          </div>
          <p className="text-3xl font-light text-slate-900 truncate w-full">{formatCurrency(finance.bankBalance)}</p>
          {urgentBillsCount > 0 ? (
            <p className="text-[10px] text-red-500 font-bold mt-auto pt-4 uppercase tracking-tighter">{urgentBillsCount} bills due soon</p>
          ) : (
            <p className="text-[10px] text-slate-400 font-medium mt-auto pt-4 uppercase tracking-tighter">No urgent bills</p>
          )}
        </motion.button>

        {/* Overtime Summary */}
        <motion.button 
          whileHover={{ y: -6, scale: 1.02 }} 
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={() => onNavigate('overtime')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col text-left group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 w-full">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Overtime</h2>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <Clock size={14} />
             </div>
          </div>
          <p className="text-3xl font-light text-slate-900">{formatTimeExact(totalOtMinutes)}</p>
          <p className="text-[10px] text-blue-500 font-medium mt-auto pt-4 uppercase">Extra Hours</p>
        </motion.button>

        {/* Calendar Summary */}
        <motion.button 
          whileHover={{ y: -6, scale: 1.02 }} 
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={() => onNavigate('calendar')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col text-left group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 w-full">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Events Today</h2>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <CalIcon size={14} />
             </div>
          </div>
          <p className="text-3xl font-light text-slate-900">{todayEventsCount}</p>
          <p className="text-[10px] text-blue-500 font-medium mt-auto pt-4 uppercase">Scheduled</p>
        </motion.button>

        {/* Notes Summary */}
        <motion.button 
          whileHover={{ y: -6, scale: 1.02 }} 
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={() => onNavigate('notes')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col text-left group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 w-full">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Quick Notes</h2>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <FileText size={14} />
             </div>
          </div>
          <p className="text-3xl font-light text-slate-900">{notes.length}</p>
          <p className="text-[10px] text-blue-500 font-medium mt-auto pt-4 uppercase">Stored thoughts</p>
        </motion.button>

        {/* Anime Summary */}
        <motion.button 
          whileHover={{ y: -6, scale: 1.02 }} 
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={() => onNavigate('anime')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col text-left group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 w-full">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Watching Anime</h2>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <Tv size={14} />
             </div>
          </div>
          <p className="text-3xl font-light text-slate-900">{watchingAnimeCount}</p>
          <p className="text-[10px] text-blue-500 font-medium mt-auto pt-4 uppercase">Currently tracking</p>
        </motion.button>

      </div>
    </div>
  );
}
