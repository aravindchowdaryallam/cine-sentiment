import React from 'react';
import { Film, Calendar, Globe, Star, Trash2 } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getPosterUrl } from '../utils/tmdb';

const Watchlist: React.FC = () => {
    const { watchlist, removeFromWatchlist } = useWatchlist();

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-serif font-bold text-white tracking-tight flex items-center justify-center gap-3">
                    <Film className="text-secondary" size={48} />
                    My <span className="text-secondary italic">List</span>
                </h1>
                <p className="text-white-muted font-light text-lg max-w-2xl mx-auto">
                    Your personal collection of movies to watch
                </p>
            </div>

            {/* Empty State */}
            {watchlist.length === 0 ? (
                <div className="text-center py-20 text-white-muted">
                    <Film size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Your list is empty. Start adding movies!</p>
                </div>
            ) : (
                /* Movie Grid */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {watchlist.map((movie) => (
                        <div
                            key={movie.id}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 group relative"
                        >
                            {/* Poster */}
                            <div className="relative aspect-[2/3] overflow-hidden bg-black/40">
                                <img
                                    src={getPosterUrl(movie.poster_path, 'w500')}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                                {/* Rating Badge */}
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                                    <Star size={14} className="text-primary fill-primary" />
                                    <span className="text-white font-bold text-sm">{movie.vote_average.toFixed(1)}</span>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromWatchlist(movie.id);
                                    }}
                                    className="absolute top-2 left-2 bg-black/80 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                                    title="Remove from list"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-3 space-y-2">
                                <h3 className="font-semibold text-white line-clamp-2 text-sm leading-tight">
                                    {movie.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-white-muted">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {movie.release_date?.split('-')[0] || 'N/A'}
                                    </span>
                                    <span className="uppercase flex items-center gap-1">
                                        <Globe size={12} />
                                        {movie.original_language}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist;
