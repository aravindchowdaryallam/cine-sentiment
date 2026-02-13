import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { TMDBMovie } from '../utils/tmdb';
import { useAuth } from './AuthContext';

interface WatchlistContextType {
    watchlist: TMDBMovie[];
    addToWatchlist: (movie: TMDBMovie) => void;
    removeFromWatchlist: (movieId: number) => void;
    isInWatchlist: (movieId: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const useWatchlist = () => {
    const context = useContext(WatchlistContext);
    if (!context) {
        throw new Error('useWatchlist must be used within a WatchlistProvider');
    }
    return context;
};

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [watchlist, setWatchlist] = useState<TMDBMovie[]>([]);
    const { user } = useAuth();

    // Load from local storage when user changes
    useEffect(() => {
        if (!user) {
            setWatchlist([]); // Clear watchlist on logout
            return;
        }

        const saved = localStorage.getItem(`cineSentiment_watchlist_${user.id}`);
        if (saved) {
            try {
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse watchlist:', e);
            }
        } else {
            setWatchlist([]); // New user or no list
        }
    }, [user?.id]); // Re-run when user ID changes

    // Save to local storage whenever watchlist changes - ONLY if logged in
    useEffect(() => {
        if (user) {
            localStorage.setItem(`cineSentiment_watchlist_${user.id}`, JSON.stringify(watchlist));
        }
    }, [watchlist, user?.id]);

    const addToWatchlist = (movie: TMDBMovie) => {
        if (!user) return; // Prevent adding if not logged in (UI should handle this too)

        setWatchlist(prev => {
            if (prev.some(m => m.id === movie.id)) return prev;
            return [...prev, movie];
        });
    };

    const removeFromWatchlist = (movieId: number) => {
        if (!user) return;
        setWatchlist(prev => prev.filter(m => m.id !== movieId));
    };

    const isInWatchlist = (movieId: number) => {
        return watchlist.some(m => m.id === movieId);
    };

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
};
