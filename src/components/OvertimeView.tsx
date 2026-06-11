import { motion, AnimatePresence } from 'motion/react';
import { OvertimeLog } from '../types';
import { useAppContext } from '../AppContext';
import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calculator } from 'lucide-react';
import { formatTimeExact } from '../utils';

export default function OvertimeView() {
  const { overtimeLogs, setOvertimeLogs } = useAppContext();
  
  const [date, setDate] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const regularShiftMinutes = 9 * 60;

  const calculateMinutes = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;
    if (endTotal < startTotal) {
      endTotal += 24 * 60; // Next day
    }
    return endTotal - startTotal;
  };

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeIn || !timeOut) return;
    
    const totalMinutes = calculateMinutes(timeIn, timeOut);
    const regularMinutes = Math.min(totalMinutes, regularShiftMinutes);
    const overtimeMinutes = Math.max(0, totalMinutes - regularShiftMinutes);

    const log: OvertimeLog = {
      id: Date.now().toString(),
      date,
      timeIn,
      timeOut,
      totalMinutes,
      regularMinutes,
      overtimeMinutes
    };

    setOvertimeLogs(prev => {
      const newLogs = [...prev, log];
      return newLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    setTimeIn('');
    setTimeOut('');
  };

  const deleteLog = (id: string) => {
    setOvertimeLogs(prev => prev.filter(l => l.id !== id));
  };

  const totalAccumulatedOtMinutes = overtimeLogs.reduce((sum, log) => sum + Math.max(0, log.overtimeMinutes), 0);
  const totalUndertimeMinutes = overtimeLogs.reduce((sum, log) => sum + Math.max(0, regularShiftMinutes - log.totalMinutes), 0);
  const lastEntry = overtimeLogs[0];


  return (
    <div className="flex flex-col gap-6 h-full">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.section 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 md:col-span-1"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Overtime Summary</h2>
          <div className="flex flex-col h-full justify-between pb-8">
            <div>
               <p className="text-4xl font-light text-slate-900">{formatTimeExact(totalAccumulatedOtMinutes)}</p>
               <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Accumulated overall</p>
            </div>
            {lastEntry && (
              <div className="mt-8 text-[10px] text-slate-400 font-medium">
                <p>Last Entry: {new Date(lastEntry.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                <p>Shift: {lastEntry.timeIn} - {lastEntry.timeOut}</p>
              </div>
            )}
            {!lastEntry && (
              <div className="mt-8 text-[10px] text-slate-400 font-medium">
                <p>No entries yet</p>
              </div>
            )}
          </div>
        </motion.section>
        
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 md:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Log Hours</h2>
          <form onSubmit={addLog} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Date</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-50 rounded-xl px-4 py-2.5 outline-none focus:border-blue-200 text-sm text-slate-700 font-medium" />
                </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Time In</label>
                <input type="time" required value={timeIn} onChange={e => setTimeIn(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-50 rounded-xl px-4 py-2.5 outline-none focus:border-blue-200 text-sm text-slate-700 font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Time Out</label>
                <input type="time" required value={timeOut} onChange={e => setTimeOut(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-50 rounded-xl px-4 py-2.5 outline-none focus:border-blue-200 text-sm text-slate-700 font-medium" />
              </div>
            </div>
            <div className="flex justify-end mt-2">
               <button type="submit" className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-6 py-2.5 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Plus size={14} /> Log Time
               </button>
            </div>
          </form>
        </section>
      </div>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex-1 flex flex-col min-h-[300px]">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Time Logs</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <AnimatePresence mode="popLayout">
            {overtimeLogs.map((log) => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                key={log.id} 
                className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50 mb-3 flex flex-wrap items-center justify-between gap-4 group hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex gap-6 sm:gap-12 items-center flex-1">
                  <div className="w-20 sm:w-24">
                    <p className="text-sm font-medium text-slate-800">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(log.date).getFullYear()}</p>
                  </div>
                  <div className="text-sm text-slate-600 flex-1">
                    <p className="font-medium text-slate-800">{log.timeIn} - {log.timeOut}</p>
                  </div>
                  <div className="text-sm text-slate-600 w-24">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Total</p>
                    <p className="font-medium text-slate-800">{formatTimeExact(log.totalMinutes)}</p>
                  </div>
                  <div className="text-sm w-28 text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Overtime</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold tracking-tight uppercase ${
                      log.overtimeMinutes > 0 ? "bg-blue-100 text-blue-600" :
                      log.overtimeMinutes < 0 ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"
                    }`}>
                      {log.overtimeMinutes > 0 ? '+' : ''}{formatTimeExact(log.overtimeMinutes)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteLog(log.id)}
                  className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
            {overtimeLogs.length === 0 && (
              <div className="py-12 text-center text-[10px] uppercase font-bold tracking-widest text-slate-300">No time logs yet.</div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
