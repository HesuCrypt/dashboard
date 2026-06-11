import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { CalendarEvent } from '../types';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function CalendarView() {
  const { calendarEvents, setCalendarEvents } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventText, setNewEventText] = useState('');

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const eventsForDay = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    return calendarEvents.filter(e => e.date === formatted);
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newEventText.trim()) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      text: newEventText
    };

    setCalendarEvents(prev => [...prev, newEvent]);
    setNewEventText('');
  };

  const deleteEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 h-full pb-24">
      {/* Main Calendar Area */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Main Calendar */}
        <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-blue-50 flex flex-col min-h-[600px]">
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-3xl font-light text-slate-900 tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2.5 bg-slate-50/50 hover:bg-slate-100 rounded-2xl transition-colors text-slate-600">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2.5 bg-slate-50/50 hover:bg-slate-100 rounded-2xl transition-colors text-slate-600">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px mb-4 px-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, ix) => (
              <div key={day} className={clsx("text-center text-[10px] font-bold uppercase tracking-widest py-2", ix === 0 || ix === 6 ? "text-slate-300" : "text-slate-400")}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 flex-1">
            {days.map((day, i) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const events = eventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={clsx(
                    "relative flex flex-col items-center p-2 rounded-2xl min-h-[88px] transition-all overflow-hidden border border-transparent",
                    !isCurrentMonth && "opacity-30",
                    isSelected ? "bg-blue-50/50 border-blue-100 ring-4 ring-blue-50/50" : "hover:bg-slate-50/80 hover:border-slate-100",
                    isCurrentDay && !isSelected ? "bg-slate-50 border-slate-100/50" : ""
                  )}
                >
                  <div className={clsx(
                    "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium mb-1.5 transition-colors",
                    isCurrentDay ? "bg-blue-500 text-white shadow-sm font-bold" : isSelected ? "text-blue-700 font-bold" : "text-slate-600"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="flex flex-col gap-1 w-full flex-1 px-1 mt-1 overflow-hidden">
                     {events.slice(0, 2).map(e => (
                       <div key={e.id} className="text-[10px] truncate bg-blue-100/40 text-blue-700 px-1.5 py-0.5 rounded-lg font-medium leading-tight text-left">
                         {e.text}
                       </div>
                     ))}
                     {events.length > 2 && (
                       <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-left pl-1.5 pt-0.5">+{events.length - 2} more</div>
                     )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel for Date Details */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full md:w-80 lg:w-96 bg-white rounded-3xl p-8 shadow-sm border border-blue-50 flex flex-col relative"
            >
              <button 
                onClick={() => setSelectedDate(null)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors p-2 bg-slate-50/50 hover:bg-slate-100 rounded-full"
              >
                 <X size={18} />
              </button>

              <h3 className="text-2xl font-light text-slate-900 mb-1 tracking-tight pr-10">
                {format(selectedDate, 'MMMM d')}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">{format(selectedDate, 'EEEE')}</p>

              <form onSubmit={addEvent} className="mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Add Event</label>
                <div className="relative group">
                   <input 
                     type="text" 
                     value={newEventText}
                     onChange={e => setNewEventText(e.target.value)}
                     placeholder="E.g., Doctor appointment"
                     className="w-full bg-slate-50/50 border border-transparent rounded-2xl pl-4 pr-12 py-3.5 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all text-sm font-medium"
                   />
                   <button 
                     type="submit" 
                     disabled={!newEventText.trim()}
                     className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-100/50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all disabled:opacity-50"
                   >
                     <Plus size={16} />
                   </button>
                </div>
              </form>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {eventsForDay(selectedDate).map(event => (
                    <motion.div 
                      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      key={event.id}
                      className="group bg-slate-50/80 border border-slate-50 rounded-2xl p-4 flex items-start gap-4 transition-colors hover:border-blue-100"
                    >
                      <p className="text-sm text-slate-700 flex-1 leading-relaxed font-medium">{event.text}</p>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                  {eventsForDay(selectedDate).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest">No Events</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
