import { motion, AnimatePresence } from 'motion/react';
import { Bill } from '../types';
import { useAppContext } from '../AppContext';
import React, { useState } from 'react';
import { Plus, Trash2, Check, AlertTriangle, Target, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { differenceInDays } from 'date-fns';
import { clsx } from 'clsx';

export default function FinanceView() {
  const { finance, setFinance } = useAppContext();
  
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState('');

  const updateFinance = (key: 'bankBalance' | 'homeGoal', val: string) => {
    const num = parseFloat(val) || 0;
    setFinance(prev => ({ ...prev, [key]: num }));
  };

  const addBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName || !billAmount || !billDate) return;
    
    const newBill: Bill = {
      id: Date.now().toString(),
      name: billName,
      amount: parseFloat(billAmount) || 0,
      dueDate: billDate,
      paid: false
    };

    setFinance(prev => ({ 
      ...prev, 
      bills: [...prev.bills, newBill].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    }));
    
    setBillName('');
    setBillAmount('');
    setBillDate('');
  };

  const toggleBill = (id: string) => {
    setFinance(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b)
    }));
  };

  const deleteBill = (id: string) => {
    setFinance(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id)
    }));
  };

  const activeBills = finance.bills.filter(b => !b.paid);
  const paidBills = finance.bills.filter(b => b.paid);
  
  const totalActiveBills = activeBills.reduce((sum, b) => sum + b.amount, 0);

  // For chart: Aggregate by active bill name or just 'Bills' vs 'Remaining'
  const goalProgress = finance.homeGoal > 0 ? (finance.bankBalance / finance.homeGoal) * 100 : 0;

  const chartData = activeBills.map(b => ({ name: b.name, value: b.amount }));
  const COLORS = ['#93c5fd', '#3b82f6', '#1d4ed8', '#60a5fa', '#bfdbfe', '#2563eb'];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 h-full pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-900 mb-1 tracking-tight">Finance</h1>
          <p className="text-sm text-slate-500 font-medium">Track balance, goals, and upcoming expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balances */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col gap-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              <Wallet size={14} /> Bank Balance
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-medium font-sans">₱</span>
              <input 
                type="number" 
                value={finance.bankBalance || ''} 
                onChange={e => updateFinance('bankBalance', e.target.value)}
                className="w-full bg-slate-50/50 font-medium text-2xl border border-transparent rounded-2xl pl-10 pr-4 py-4 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-800 transition-all font-sans"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              <Target size={14} /> Home Goal
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-medium font-sans">₱</span>
              <input 
                type="number" 
                value={finance.homeGoal || ''} 
                onChange={e => updateFinance('homeGoal', e.target.value)}
                className="w-full bg-slate-50/50 font-medium text-2xl border border-transparent rounded-2xl pl-10 pr-4 py-4 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-800 transition-all font-sans"
              />
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-slate-50">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
              <span className="text-slate-400">Progress</span>
              <span className="text-blue-500">{Math.min(100, goalProgress).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} animate={{ width: `${Math.min(100, goalProgress)}%` }}
                 className="h-full bg-blue-400 rounded-full"
               />
            </div>
          </div>
        </div>

        {/* Expenses Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-blue-50 flex flex-col sm:flex-row items-center gap-10">
          <div className="w-full sm:w-1/2 h-56">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-dashed flex items-center justify-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest">No Data</span>
                  </div>
                </div>
             )}
          </div>
          <div className="w-full sm:w-1/2 flex flex-col justify-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Active Bills Total</h3>
            <p className="text-5xl font-light text-slate-900 mb-8 tracking-tight">{formatCurrency(totalActiveBills)}</p>
            
            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
               {chartData.map((data, i) => (
                 <div key={i} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3">
                     <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                     <span className="text-slate-600 font-medium">{data.name}</span>
                   </div>
                   <span className="font-semibold text-slate-800">{formatCurrency(data.value)}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden flex flex-col flex-1 min-h-[300px]">
        <div className="px-8 py-6 border-b border-slate-50 bg-white">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Upcoming Bills</h2>
        </div>
        
        <form onSubmit={addBill} className="p-6 border-b border-slate-50 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Bill Name</label>
              <input type="text" required placeholder="e.g. Electricity" value={billName} onChange={e => setBillName(e.target.value)}
                className="w-full bg-white border border-transparent rounded-2xl px-4 py-3 outline-none focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all text-sm font-medium" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Amount</label>
              <input type="number" required placeholder="0.00" value={billAmount} onChange={e => setBillAmount(e.target.value)}
                className="w-full bg-white border border-transparent rounded-2xl px-4 py-3 outline-none focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all text-sm font-medium" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Due Date</label>
              <input type="date" required value={billDate} onChange={e => setBillDate(e.target.value)}
                className="w-full bg-white border border-transparent rounded-2xl px-4 py-3 outline-none focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all text-sm font-medium" />
           </div>
           <button type="submit" disabled={!billName || !billAmount || !billDate} className="bg-blue-100/50 hover:bg-blue-100 text-blue-600 px-4 py-3 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto h-[46px] disabled:opacity-50">
             <Plus size={16} /> Add
           </button>
        </form>

        <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {finance.bills.map((bill) => {
              const daysUntilDue = differenceInDays(new Date(bill.dueDate), new Date());
              const isUrgent = !bill.paid && daysUntilDue <= 3 && daysUntilDue >= 0;
              const isOverdue = !bill.paid && daysUntilDue < 0;

              return (
                <motion.div 
                  layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  key={bill.id} 
                  className={clsx(
                    "p-4 px-6 flex items-center gap-4 group transition-colors",
                    bill.paid ? "bg-slate-50/50 opacity-60" : "hover:bg-blue-50/20"
                  )}
                >
                  <button 
                    onClick={() => toggleBill(bill.id)}
                    className={clsx(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      bill.paid ? "bg-emerald-400 border-emerald-400 text-white" : "border-slate-300 hover:border-blue-400 text-transparent"
                    )}
                  >
                    <Check size={14} className={bill.paid ? "opacity-100" : "opacity-0"} />
                  </button>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                    <p className={clsx("font-medium", bill.paid ? "line-through text-slate-500" : "text-slate-700")}>
                      {bill.name}
                    </p>
                    <p className={clsx("font-medium text-sm sm:text-base", bill.paid ? "text-slate-400" : "text-slate-800")}>
                      {formatCurrency(bill.amount)}
                    </p>
                    <div className="flex items-center gap-2">
                       <span className="text-sm text-slate-500">{new Date(bill.dueDate).toLocaleDateString()}</span>
                       {isUrgent && (
                         <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                           <AlertTriangle size={16} className="text-orange-500" />
                         </motion.div>
                       )}
                       {isOverdue && (
                         <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">Overdue</span>
                       )}
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteBill(bill.id)}
                    className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              );
            })}
            {finance.bills.length === 0 && (
              <div className="p-8 text-center text-slate-400">No bills added yet.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
