export interface MovieDBEntry {
    id?: number;
    title: string;
    year: number;
    genres: string[];
    language: string;
    cast: string[];
    source: string;
    searchTitle: string; // Lowercase for searching
}

const DB_NAME = 'CineSentimentDB';
const DB_VERSION = 1;
const STORE_NAME = 'movies';

export class MovieDatabase {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('searchTitle', 'searchTitle', { unique: false });
                    store.createIndex('language', 'language', { unique: false });
                    store.createIndex('year', 'year', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    async seed(movies: any[]): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            console.log(`Seeding ${movies.length} movies...`);

            movies.forEach(movie => {
                store.add({
                    title: movie.title,
                    year: movie.year,
                    genres: movie.genres,
                    language: movie.language,
                    cast: movie.cast,
                    source: movie.source,
                    searchTitle: movie.title.toLowerCase()
                });
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getCount(): Promise<number> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getRecommended(mood: string, language: string, limit: number = 20): Promise<(MovieDBEntry & { acclaimScore: number })[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const candidates: (MovieDBEntry & { acclaimScore: number })[] = [];

            // We scan up to 200 matches to find the most "acclaimed" ones within that set
            const MAX_SCAN = 200;
            let scannedCount = 0;

            const request = store.openCursor();
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor && scannedCount < MAX_SCAN && candidates.length < 100) {
                    const movie = cursor.value;

                    // Simple mood logic based on genres
                    let matchesMood = false;
                    const g = movie.genres || [];

                    if (mood === 'Mass Masala' && (g.includes('Action') || g.includes('Comedy'))) matchesMood = true;
                    if (mood === 'Action Hero' && g.includes('Action')) matchesMood = true;
                    if (mood === 'Emotional Journey' && g.includes('Drama')) matchesMood = true;
                    if (mood === 'Deep Thoughts' && (g.includes('Thriller') || g.includes('Mystery') || g.includes('Crime'))) matchesMood = true;
                    if (mood === 'Epic Journey' && (g.includes('Adventure') || g.includes('History') || g.includes('War'))) matchesMood = true;
                    if (mood === 'Cyber Punk' && (g.includes('Science Fiction') || g.includes('Sci-Fi') || g.includes('Fantasy'))) matchesMood = true;
                    if (mood === 'Midnight Chills' && (g.includes('Horror') || g.includes('Supernatural'))) matchesMood = true;
                    if (mood === 'Reality Pulse' && (g.includes('Documentary') || g.includes('Biography'))) matchesMood = true;
                    if (mood === 'Family Fun' && (g.includes('Animation') || g.includes('Family') || g.includes('Adventure'))) matchesMood = true;

                    // Direct Genre match if mood doesn't match predefined set
                    if (!matchesMood && g.some((genre: string) => genre.toLowerCase() === mood.toLowerCase())) {
                        matchesMood = true;
                    }

                    const matchesLang = language === 'All' || movie.language === language;

                    if (matchesMood && matchesLang) {
                        // Calculate Acclaim Score (0-100)
                        let acclaimScore = 50; // Default for Wikipedia
                        const ratings = movie.rating || [];

                        if (movie.source === 'ghibli' && ratings.length > 0) {
                            acclaimScore = parseInt(ratings[0]) || 50;
                        } else if (movie.source === 'indian_curated' && ratings.length > 0) {
                            const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
                            acclaimScore = Math.min(avg * 10, 100);
                        } else if (movie.source === 'wikipedia') {
                            // Wikipedia movies with cast/year info are often "classic"
                            acclaimScore = 40 + (movie.cast.length > 0 ? 10 : 0);
                        }

                        candidates.push({ ...movie, acclaimScore });
                    }
                    scannedCount++;
                    cursor.continue();
                } else {
                    // Sort candidates by acclaimScore descending
                    const sorted = candidates.sort((a, b) => b.acclaimScore - a.acclaimScore);
                    resolve(sorted.slice(0, limit));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async clearDB(): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const movieDB = new MovieDatabase();
