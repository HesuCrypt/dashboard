export type Tab = 'dashboard' | 'tasks' | 'overtime' | 'finance' | 'calendar' | 'notes' | 'anime';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export type AnimeStatus = 'Watching' | 'Completed' | 'Plan to Watch' | 'Dropped';

export interface Anime {
  id: string;
  title: string;
  episodesWatched: number;
  totalEpisodes: number | null;
  status: AnimeStatus;
  rating: number | null;
  linkUrl?: string;
  imageUrl?: string;
}

export type TaskCategory = 'Work' | 'Personal' | 'Urgent' | 'None';

export interface Task {
  id: string;
  description: string;
  category: TaskCategory;
  deadline: string; // YYYY-MM-DD or empty
  important: boolean;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  archived?: boolean;
}

export interface OvertimeLog {
  id: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:mm
  timeOut: string; // HH:mm
  totalMinutes: number;
  regularMinutes: number; // 540 (9 hours)
  overtimeMinutes: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
}

export interface FinanceData {
  bankBalance: number;
  homeGoal: number;
  bills: Bill[];
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
}

export interface AppData {
  notes: Note[];
  tasks: Task[];
  overtimeLogs: OvertimeLog[];
  finance: FinanceData;
  calendarEvents: CalendarEvent[];
  animeList: Anime[];
}
