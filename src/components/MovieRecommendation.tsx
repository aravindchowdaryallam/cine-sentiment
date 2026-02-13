import React, { useState, useEffect } from 'react';
import { Film, Loader2, ChevronDown, Heart, Star } from 'lucide-react';
import { discoverMovies, getPosterUrl, getAvailableLanguages, getMovieDetails, type TMDBMovie } from '../utils/tmdb.ts';
import { useWatchlist } from '../context/WatchlistContext';
import MovieDetailsModal from './MovieDetailsModal';

const MovieRecommendation: React.FC = () => {
    const [selectedGenre, setSelectedGenre] = useState<string>('Action');
    const [selectedLang, setSelectedLang] = useState<string>('All');
    const [movies, setMovies] = useState<TMDBMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

    // Explicitly include RomCom if not present
    const availableGenres = ['Action', 'Comedy', 'Drama', 'RomCom', 'Sci-Fi', 'Horror', 'Thriller', 'Adventure', 'Animation', 'Mystery', 'Crime'];
    const languages = getAvailableLanguages();

    // Fetch movies when genre or language changes
    useEffect(() => {
        fetchMovies(1);
    }, [selectedGenre, selectedLang]);

    const fetchMovies = async (page: number = 1) => {
        setLoading(true);
        try {
            const results = await discoverMovies({
                genre: selectedGenre,
                language: selectedLang,
                page,
                sortBy: 'popularity.desc',
                minVoteCount: 100
            });

            if (page === 1) {
                setMovies(results);
            } else {
                setMovies(prev => [...prev, ...results]);
            }
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        fetchMovies(currentPage + 1);
    };

    const handleMovieClick = async (movie: TMDBMovie) => {
        try {
            const details = await getMovieDetails(movie.id);
            setSelectedMovie(details);
        } catch (error) {
            console.error('Failed to load movie details:', error);
        }
    };

    const closeModal = () => {
        setSelectedMovie(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-serif font-bold text-white tracking-tight flex items-center justify-center gap-3">
                    <Film className="text-primary" size={48} />
                    Movie <span className="text-primary italic">Discovery</span>
                </h1>
                <p className="text-white-muted font-light text-lg max-w-2xl mx-auto">
                    Explore thousands of movies powered by The Movie Database (TMDB)
                </p>
            </div>

            {/* Filters */}
            <div className="space-y-6">
                {/* Genre Selection */}
                <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Film size={20} className="text-primary" />
                        Select Genre
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {availableGenres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-4 py-2 rounded-full font-medium transition-all ${selectedGenre === genre
                                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language Selection */}
                <div>
                    <h3 className="text-white font-semibold mb-3">Language</h3>
                    <div className="flex flex-wrap gap-2">
                        {languages.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLang(lang)}
                                className={`px-4 py-2 rounded-full font-medium transition-all ${selectedLang === lang
                                    ? 'bg-primary text-black'
                                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && movies.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            )}

            {/* Movie Grid */}
            {movies.length > 0 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => handleMovieClick(movie)}
                                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer"
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

                                    {/* Watchlist Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isInWatchlist(movie.id)) {
                                                removeFromWatchlist(movie.id);
                                            } else {
                                                addToWatchlist(movie);
                                            }
                                        }}
                                        className="absolute top-2 left-2 bg-black/80 p-2 rounded-full text-white hover:text-red-500 transition-colors z-10"
                                    >
                                        <Heart
                                            size={16}
                                            className={isInWatchlist(movie.id) ? "fill-red-500 text-red-500" : ""}
                                        />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-2">
                                    <h3 className="font-semibold text-white line-clamp-2 text-sm leading-tight">
                                        {movie.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs text-white-muted">
                                        <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                                        <span className="uppercase">{movie.original_language}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={20} />
                                    Load More
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && movies.length === 0 && (
                <div className="text-center py-20 text-white-muted">
                    <Film size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No movies found. Try adjusting your filters or search query.</p>
                </div>
            )}
            {/* Movie Details Modal */}
            <MovieDetailsModal
                movie={selectedMovie}
                isOpen={!!selectedMovie}
                onClose={closeModal}
                onMovieClick={(movie) => handleMovieClick(movie)}
            />
        </div>
    );
};

export default MovieRecommendation;
