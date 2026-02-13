// TMDB API Client for Movie Recommendations
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    release_date: string;
    genre_ids: number[];
    original_language: string;
    popularity: number;
}

export interface TMDBGenre {
    id: number;
    name: string;
}

export interface DiscoverFilters {
    genre?: string;
    language?: string;
    page?: number;
    sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc';
    minVoteCount?: number;
}

// Genre name to TMDB ID mapping
const GENRE_MAP: Record<string, number | string> = {
    'Action': 28,
    'Adventure': 12,
    'Animation': 16,
    'Comedy': 35,
    'Crime': 80,
    'Drama': 18,
    'Horror': 27,
    'Mystery': 9648,
    'Romance': 10749,
    'RomCom': '10749,35', // Romance AND Comedy
    'Sci-Fi': 878,
    'Thriller': 53,
};

// Language code mapping
const LANGUAGE_MAP: Record<string, string> = {
    'All': '',
    'English': 'en',
    'Hindi': 'hi',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Malayalam': 'ml',
    'Kannada': 'kn',
    'Japanese': 'ja',
};

// Indian languages that need lower vote thresholds to show more results
const INDIAN_LANGUAGES = ['hi', 'ta', 'te', 'ml', 'kn'];

/**
 * Discover movies based on filters
 */
export async function discoverMovies(filters: DiscoverFilters = {}): Promise<TMDBMovie[]> {
    const langCode = filters.language ? LANGUAGE_MAP[filters.language] : '';
    const isIndianLang = langCode && INDIAN_LANGUAGES.includes(langCode);

    // CRITICAL: For Indian languages, remove vote threshold almost entirely
    // and sort by release date to show latest movies first
    const voteThreshold = filters.minVoteCount || (isIndianLang ? 0 : 100);
    const sortBy = filters.sortBy || (isIndianLang ? 'primary_release_date.desc' : 'popularity.desc');

    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        page: (filters.page || 1).toString(),
        sort_by: sortBy,
        'vote_count.gte': voteThreshold.toString(),
        include_adult: 'false',
    });

    // Add genre filter
    if (filters.genre && GENRE_MAP[filters.genre]) {
        // Handle "RomCom" or other multi-genre strings
        const genreValue = GENRE_MAP[filters.genre];
        params.append('with_genres', genreValue.toString());
    }

    // Add language filter
    if (filters.language && LANGUAGE_MAP[filters.language]) {
        params.append('with_original_language', LANGUAGE_MAP[filters.language]);

        // If searching for Indian languages, boost with region parameter
        if (isIndianLang) {
            params.append('region', 'IN');
            params.append('with_origin_country', 'IN');
            // Also relax popularity filter for these languages
            params.delete('vote_count.gte');
        }
    }

    const url = `${TMDB_BASE_URL}/discover/movie?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Failed to discover movies:', error);
        return [];
    }
}

/**
 * Get trending movies
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovie[]> {
    const url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Failed to get trending movies:', error);
        return [];
    }
}

/**
 * Search movies by title
 */
export async function searchMovies(query: string, page: number = 1): Promise<TMDBMovie[]> {
    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        query,
        page: page.toString(),
        include_adult: 'false',
    });

    const url = `${TMDB_BASE_URL}/search/movie?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Failed to search movies:', error);
        return [];
    }
}

/**
 * Get movie details by ID
 */
export async function getMovieDetails(movieId: number): Promise<any> {
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to get movie details:', error);
        return null;
    }
}

/**
 * Get movie reviews
 */
export async function getMovieReviews(movieId: number, page: number = 1): Promise<string[]> {
    const url = `${TMDB_BASE_URL}/movie/${movieId}/reviews?api_key=${TMDB_API_KEY}&page=${page}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results.map((r: any) => r.content) || [];
    } catch (error) {
        console.error('Failed to get movie reviews:', error);
        return [];
    }
}

/**
 * Get movie recommendations (More Like This)
 */
export async function getRecommendations(movieId: number): Promise<TMDBMovie[]> {
    const url = `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Failed to get movie recommendations:', error);
        return [];
    }
}
export function getPosterUrl(posterPath: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!posterPath) {
        return 'https://via.placeholder.com/500x750/1a1a1a/666?text=No+Poster';
    }
    return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

/**
 * Get backdrop URL for a movie
 */
export function getBackdropUrl(backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!backdropPath) {
        return 'https://via.placeholder.com/1280x720/1a1a1a/666?text=No+Backdrop';
    }
    return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

/**
 * Get genre name from ID
 */
export function getGenreName(genreId: number): string {
    const entry = Object.entries(GENRE_MAP).find(([_, id]) => id === genreId);
    return entry ? entry[0] : 'Unknown';
}

/**
 * Get all available genres
 */
export function getAvailableGenres(): string[] {
    // Explicitly order genres to put popular ones first
    return ['Action', 'Comedy', 'Drama', 'RomCom', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Adventure', 'Animation', 'Mystery', 'Crime'];
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): string[] {
    return Object.keys(LANGUAGE_MAP);
}
