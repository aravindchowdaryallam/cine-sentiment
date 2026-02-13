const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com/';

export interface OMDbMovie {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
    Genre?: string;
    Plot?: string;
    imdbRating?: string;
}

export const searchMovies = async (query: string): Promise<OMDbMovie[]> => {
    if (!query) return [];
    try {
        const response = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        return data.Search || [];
    } catch (error) {
        console.error('OMDb Search Error:', error);
        return [];
    }
};

export const getMovieDetails = async (id: string): Promise<OMDbMovie | null> => {
    try {
        const response = await fetch(`${BASE_URL}?i=${id}&plot=short&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        return data.Response === 'True' ? data : null;
    } catch (error) {
        console.error('OMDb Details Error:', error);
        return null;
    }
};
