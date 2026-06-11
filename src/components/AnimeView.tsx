import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { Anime, AnimeStatus } from '../types';
import { Plus, Trash2, Star, PlayCircle, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

export default function AnimeView() {
  const { animeList, setAnimeList } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<AnimeStatus>('Watching');
  const [episodesWatched, setEpisodesWatched] = useState<number | ''>('');
  const [totalEpisodes, setTotalEpisodes] = useState<number | ''>('');
  const [rating, setRating] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [showForm, setShowForm] = useState(false);

  const addAnime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAnime: Anime = {
      id: crypto.randomUUID(),
      title: title.trim(),
      status,
      episodesWatched: Number(episodesWatched) || 0,
      totalEpisodes: totalEpisodes !== '' ? Number(totalEpisodes) : null,
      rating: rating !== '' ? Number(rating) : null,
      imageUrl: imageUrl.trim() || undefined
    };

    setAnimeList(prev => [...prev, newAnime]);
    
    // reset
    setTitle('');
    setStatus('Watching');
    setEpisodesWatched('');
    setTotalEpisodes('');
    setRating('');
    setImageUrl('');
    setShowForm(false);
  };

  const deleteAnime = (id: string) => {
    setAnimeList(prev => prev.filter(a => a.id !== id));
  };

  const updateProgress = (id: string, newProgress: number) => {
    setAnimeList(prev => prev.map(a => {
      if (a.id === id) {
        const total = a.totalEpisodes;
        const validProgress = total ? Math.min(newProgress, total) : newProgress;
        return { ...a, episodesWatched: validProgress };
      }
      return a;
    }));
  };

  const grouped = {
    Watching: animeList.filter(a => a.status === 'Watching'),
    'Plan to Watch': animeList.filter(a => a.status === 'Plan to Watch'),
    Completed: animeList.filter(a => a.status === 'Completed'),
    Dropped: animeList.filter(a => a.status === 'Dropped'),
  };

  const AnimeCard = ({ anime }: { anime: Anime }) => {
    const progressPercent = anime.totalEpisodes ? (anime.episodesWatched / anime.totalEpisodes) * 100 : 0;
    
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50 flex flex-col gap-4 group hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
      >
        <button 
          onClick={() => deleteAnime(anime.id)}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          <Trash2 size={16} />
        </button>

        <div className="flex gap-4">
          <div className="w-20 h-28 shrink-0 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
            {anime.imageUrl ? (
              <img src={anime.imageUrl} alt={anime.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={24} className="text-slate-300" />
            )}
          </div>
          
          <div className="flex flex-col py-1 overflow-hidden">
            <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-1 truncate">{anime.title}</h3>
            
            <div className="flex items-center gap-2 mb-3">
              {anime.rating && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  <Star size={10} className="fill-amber-500" /> {anime.rating}/10
                </div>
              )}
              <span className={clsx(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                anime.status === 'Watching' ? "bg-blue-100 text-blue-600" :
                anime.status === 'Completed' ? "bg-emerald-100 text-emerald-600" :
                anime.status === 'Dropped' ? "bg-slate-100 text-slate-500" :
                "bg-purple-100 text-purple-600"
              )}>
                {anime.status}
              </span>
            </div>
            
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-medium text-slate-500">
                  <span className="text-slate-800 font-bold">{anime.episodesWatched}</span>
                  {anime.totalEpisodes ? ` / ${anime.totalEpisodes}` : ' eps'}
                </span>
                
                {anime.status === 'Watching' && (
                  <button 
                    onClick={() => updateProgress(anime.id, anime.episodesWatched + 1)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              
              {anime.totalEpisodes && (
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={clsx(
                      "h-full rounded-full",
                      progressPercent === 100 ? "bg-emerald-400" : "bg-blue-400"
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 h-full pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-900 mb-1 tracking-tight">Anime Log</h1>
          <p className="text-sm text-slate-500 font-medium">Track what you're watching, completed, and what's next</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-2xl transition-all shadow-sm shadow-blue-500/20 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {showForm ? <Trash2 size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Anime'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20, overflow: 'hidden' }}
            onSubmit={addAnime} 
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-blue-50 grid gap-6 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Title</label>
                <input type="text" required placeholder="Anime Name" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Image URL (Optional)</label>
                <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as AnimeStatus)}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all font-medium appearance-none">
                  <option value="Watching">Watching</option>
                  <option value="Completed">Completed</option>
                  <option value="Plan to Watch">Plan to Watch</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Watched</label>
                  <input type="number" min="0" placeholder="0" value={episodesWatched} onChange={e => setEpisodesWatched(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Total Eps</label>
                  <input type="number" min="1" placeholder="?" value={totalEpisodes} onChange={e => setTotalEpisodes(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Rating</label>
                  <input type="number" min="1" max="10" placeholder="1-10" value={rating} onChange={e => setRating(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm transition-all font-medium" />
                </div>
              </div>
            </div>
            <button type="submit" className="bg-blue-100/50 hover:bg-blue-100 text-blue-600 px-6 py-3.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest w-full text-center">
              Save to List
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        {Object.entries(grouped).map(([statusName, list]) => {
          if (list.length === 0) return null;
          
          return (
            <div key={statusName} className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                {statusName === 'Watching' && <PlayCircle size={18} className="text-blue-400" />}
                {statusName} 
                <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">{list.length}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {list.map(anime => (
                    <React.Fragment key={anime.id}>
                      <AnimeCard anime={anime} />
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
        
        {animeList.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
              <PlayCircle size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">Your list is empty</h3>
            <p className="text-slate-500">Add an anime to start tracking your watch progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
