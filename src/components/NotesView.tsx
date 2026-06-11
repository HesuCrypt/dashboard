import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';
import { useAppContext } from '../AppContext';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function NotesView() {
  const { notes, setNotes } = useAppContext();
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      createdAt: new Date().toISOString()
    };
    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      <section className="bg-blue-100/50 rounded-3xl p-6 border border-blue-100 flex flex-col shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Capture</h2>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-blue-50 flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400 min-h-[40px] p-2 leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addNote();
              }
            }}
          />
          <button 
            onClick={addNote}
            className="bg-blue-50 text-blue-500 hover:bg-blue-100/80 rounded-xl p-3 h-fit self-end transition-colors flex shrink-0"
          >
            <Plus size={20} className="stroke-[3]" />
          </button>
        </div>
      </section>

      <section className="bg-blue-100/30 rounded-3xl p-6 border border-blue-50 flex-1 overflow-y-auto">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Your Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
          <AnimatePresence>
            {notes.map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={clsx(
                  "bg-white rounded-2xl p-4 shadow-sm group relative flex flex-col gap-3 hover:shadow-xl hover:border-blue-100 transition-all duration-300 border border-white",
                  idx % 3 === 0 ? "border-t-4 border-t-blue-400" :
                  idx % 3 === 1 ? "border-t-4 border-t-indigo-300" :
                  "border-t-4 border-t-sky-300"
                )}
              >
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">{note.content}</p>
                <span className="text-[10px] text-slate-400 mt-auto pt-3 border-t border-slate-50/50 uppercase tracking-widest font-bold">
                  {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-3 right-3 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 bg-white rounded-full shadow-sm"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {notes.length === 0 && (
          <div className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-12 mb-8">No notes yet</div>
        )}
      </section>
    </div>
  );
}
