import React, { useEffect, useState } from 'react';
import { Star, Calendar, Globe, Heart, X, Film } from 'lucide-react';
import { getPosterUrl, getRecommendations, type TMDBMovie } from '../utils/tmdb';
import { useWatchlist } from '../context/WatchlistContext';

interface MovieDetailsModalProps {
    movie: any;
    isOpen: boolean;
    onClose: () => void;
    onMovieClick: (movie: TMDBMovie) => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, isOpen, onClose, onMovieClick }) => {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
    const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);

    useEffect(() => {
        if (movie?.id) {
            getRecommendations(movie.id).then(setRecommendations);
        }
    }, [movie?.id]);

    if (!isOpen || !movie) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-neutral-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Backdrop */}
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={getPosterUrl(movie.backdrop_path || movie.poster_path, 'original')}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Title & Rating */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-2">{movie.title}</h2>
                            {movie.tagline && (
                                <p className="text-white-muted italic">{movie.tagline}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 align-end">
                            <div className="bg-primary/20 border border-primary/30 rounded-xl px-4 py-2 flex items-center gap-2 self-end">
                                <Star size={24} className="text-primary fill-primary" />
                                <span className="text-2xl font-bold text-primary">{movie.vote_average.toFixed(1)}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isInWatchlist(movie.id)) {
                                        removeFromWatchlist(movie.id);
                                    } else {
                                        addToWatchlist(movie);
                                    }
                                }}
                                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${isInWatchlist(movie.id)
                                    ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
                                    : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <Heart size={18} className={isInWatchlist(movie.id) ? "fill-current" : ""} />
                                {isInWatchlist(movie.id) ? 'Saved' : 'My List'}
                            </button>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-white-muted">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} />
                            {movie.release_date}
                        </span>
                        <span className="flex items-center gap-2">
                            <Globe size={16} />
                            {movie.original_language.toUpperCase()}
                        </span>
                        <span>{movie.runtime} min</span>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                        {movie.genres?.map((genre: any) => (
                            <span
                                key={genre.id}
                                className="bg-white/10 text-white px-3 py-1 rounded-full text-sm"
                            >
                                {genre.name}
                            </span>
                        ))}
                    </div>

                    {/* Overview */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Overview</h3>
                        <p className="text-white-muted leading-relaxed">{movie.overview}</p>
                    </div>

                    {/* Cast */}
                    {movie.credits?.cast && movie.credits.cast.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Cast</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {movie.credits.cast.slice(0, 6).map((person: any) => (
                                    <div key={person.id} className="text-sm">
                                        <p className="text-white font-medium">{person.name}</p>
                                        <p className="text-white-muted text-xs">{person.character}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations / More Like This */}
                    {recommendations.length > 0 && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Film className="text-primary" /> More Like This
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {recommendations.slice(0, 5).map((rec) => (
                                    <div
                                        key={rec.id}
                                        className="group cursor-pointer space-y-2"
                                        onClick={() => onMovieClick(rec)}
                                    >
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 transition-all">
                                            <img
                                                src={getPosterUrl(rec.poster_path, 'w342')}
                                                alt={rec.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-1 right-1 bg-black/80 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold text-primary flex items-center gap-0.5">
                                                <Star size={8} className="fill-current" />
                                                {rec.vote_average.toFixed(1)}
                                            </div>
                                        </div>
                                        <p className="text-white text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                            {rec.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsModal;
