import React, { useRef } from 'react';
import { useAppContext } from '../AppContext';
import { Download, Upload } from 'lucide-react';
import { AppData, Note, Task, OvertimeLog, FinanceData, CalendarEvent, Anime } from '../types';

export default function DataSyncManager() {
  const { 
    notes, setNotes, 
    tasks, setTasks, 
    overtimeLogs, setOvertimeLogs, 
    finance, setFinance, 
    calendarEvents, setCalendarEvents, 
    animeList, setAnimeList 
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: AppData = {
      notes,
      tasks,
      overtimeLogs,
      finance,
      calendarEvents,
      animeList
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as AppData;
        
        if (data.notes) setNotes(data.notes);
        if (data.tasks) setTasks(data.tasks);
        if (data.overtimeLogs) setOvertimeLogs(data.overtimeLogs);
        if (data.finance) setFinance(data.finance);
        if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
        if (data.animeList) setAnimeList(data.animeList);

        alert('Data imported successfully!');
      } catch (error) {
        console.error('Failed to parse backup file', error);
        alert('Invalid backup file.');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
        title="Import Data"
      >
        <Upload size={16} />
      </button>
      <button 
        onClick={handleExport}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-green-500 transition-colors"
        title="Export Data"
      >
        <Download size={16} />
      </button>
    </div>
  );
}
