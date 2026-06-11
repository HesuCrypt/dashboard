import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tab } from './types';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import OvertimeView from './components/OvertimeView';
import FinanceView from './components/FinanceView';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import AnimeView from './components/AnimeView';
import DeadlineAlerts from './components/DeadlineAlerts';
import DataSyncManager from './components/DataSyncManager';
import { AppProvider } from './AppContext';
import { LayoutDashboard, CheckSquare, Clock, Wallet, Calendar as CalIcon, FileText, Tv } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={14} /> },
  { id: 'overtime', label: 'Overtime', icon: <Clock size={14} /> },
  { id: 'finance', label: 'Finance', icon: <Wallet size={14} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalIcon size={14} /> },
  { id: 'notes', label: 'Notes', icon: <FileText size={14} /> },
  { id: 'anime', label: 'Anime List', icon: <Tv size={14} /> },
];

const pochaccoRightUrl = new URL('../pochacco.gif', import.meta.url).toString();
const pochaccoLeftUrl = new URL('../pochacco 1.gif', import.meta.url).toString();

function CornerPochaccos() {
  if (typeof document === 'undefined') return null;

  const [rightGifNonce, setRightGifNonce] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRightGifNonce((v) => v + 1);
    }, 3200);
    return () => window.clearInterval(intervalId);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] pointer-events-none select-none">
      <img
        src={pochaccoLeftUrl}
        alt="Pochacco"
        className="absolute bottom-7 left-4 h-24 w-24 md:h-28 md:w-28 object-contain drop-shadow"
      />
      <img  
        src={`${pochaccoRightUrl}?v=${rightGifNonce}`}
        alt="Pochacco"
        className="absolute bottom-4 right-4 h-24 w-24 md:h-28 md:w-28 object-contain drop-shadow"
      />
    </div>,
    document.body
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <AppProvider>
      <div className="h-[100dvh] bg-blue-50 flex flex-col font-sans text-slate-800 overflow-hidden">
        
        {/* Header Navigation */}
        <header className="bg-white border-b border-blue-100 px-4 py-4 md:px-8 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white">
              <span className="text-xs font-bold">D</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Dashboard</h1>
          </div>
          
          <nav className="flex flex-wrap gap-2 md:gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    active ? "bg-blue-100 text-blue-600" : "text-slate-500 hover:text-blue-500"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="hidden lg:inline-block">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="hidden lg:block h-4 w-px bg-slate-200"></div>
            <DataSyncManager />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-4 lg:p-6 w-full max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <DashboardView onNavigate={(t) => setActiveTab(t)} />}
              {activeTab === 'tasks' && <TasksView />}
              {activeTab === 'overtime' && <OvertimeView />}
              {activeTab === 'finance' && <FinanceView />}
              {activeTab === 'calendar' && <CalendarView />}
              {activeTab === 'notes' && <NotesView />}
              {activeTab === 'anime' && <AnimeView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Status Bar */}
        <footer className="hidden md:flex bg-white h-8 border-t border-blue-50 px-8 items-center justify-between text-[10px] text-slate-400 uppercase tracking-tighter shrink-0">
          <div className="flex gap-4">
            <span>Dashboard Active</span>
            <span>All Systems Nominal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>Local Sync Active</span>
          </div>
        </footer>

        <CornerPochaccos />

        <DeadlineAlerts />
      </div>
    </AppProvider>
  );
}
