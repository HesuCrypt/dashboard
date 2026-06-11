import React, { createContext, useContext } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppData, Note, Task, OvertimeLog, FinanceData, CalendarEvent, Anime } from './types';

// Default Data
const defaultFinance: FinanceData = {
  bankBalance: 0,
  homeGoal: 0,
  bills: [],
};

interface AppContextType {
  notes: Note[];
  setNotes: (val: Note[] | ((val: Note[]) => Note[])) => void;
  tasks: Task[];
  setTasks: (val: Task[] | ((val: Task[]) => Task[])) => void;
  overtimeLogs: OvertimeLog[];
  setOvertimeLogs: (val: OvertimeLog[] | ((val: OvertimeLog[]) => OvertimeLog[])) => void;
  finance: FinanceData;
  setFinance: (val: FinanceData | ((val: FinanceData) => FinanceData)) => void;
  calendarEvents: CalendarEvent[];
  setCalendarEvents: (val: CalendarEvent[] | ((val: CalendarEvent[]) => CalendarEvent[])) => void;
  animeList: Anime[];
  setAnimeList: (val: Anime[] | ((val: Anime[]) => Anime[])) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useLocalStorage<Note[]>('dash_notes', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('dash_tasks', []);
  const [overtimeLogs, setOvertimeLogs] = useLocalStorage<OvertimeLog[]>('dash_overtime', []);
  const [finance, setFinance] = useLocalStorage<FinanceData>('dash_finance', defaultFinance);
  const [calendarEvents, setCalendarEvents] = useLocalStorage<CalendarEvent[]>('dash_calendar', []);
  const [animeList, setAnimeList] = useLocalStorage<Anime[]>('dash_animelist', []);

  return (
    <AppContext.Provider value={{
      notes, setNotes,
      tasks, setTasks,
      overtimeLogs, setOvertimeLogs,
      finance, setFinance,
      calendarEvents, setCalendarEvents,
      animeList, setAnimeList
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
