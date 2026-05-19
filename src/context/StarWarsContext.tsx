import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { fetchPlanetDetails, fetchFilmDetails, type PersonDetail } from '../services/swapi';

export interface FavoriteItem {
  uid: string;
  name: string;
}

interface StarWarsContextType {
  favorites: FavoriteItem[];
  addFavorite: (uid: string, name: string) => void;
  removeFavorite: (uid: string) => void;
  isFavorite: (uid: string) => boolean;
  searchHistory: string[];
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  getPlanetName: (url: string) => Promise<string>;
  getFilmTitle: (url: string) => Promise<string>;
  getCachedCharacter: (uid: string) => PersonDetail | null;
  setCachedCharacter: (uid: string, data: PersonDetail) => void;
}

const StarWarsContext = createContext<StarWarsContextType | undefined>(undefined);

export function StarWarsProvider({ children }: { children: ReactNode }) {
  // Favorites State (Persisted in localStorage)
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem('sw_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sw_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // In-memory caches as refs — writes are synchronous and never trigger re-renders
  const planetCache = useRef<Record<string, string>>({});
  const filmCache = useRef<Record<string, string>>({});
  const characterCache = useRef<Record<string, PersonDetail>>({});

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem('sw_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync search history with localStorage
  useEffect(() => {
    localStorage.setItem('sw_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addFavorite = useCallback((uid: string, name: string) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.uid === uid)) return prev;
      return [...prev, { uid, name }];
    });
  }, []);

  const removeFavorite = useCallback((uid: string) => {
    setFavorites((prev) => prev.filter((item) => item.uid !== uid));
  }, []);

  
  const favoriteUids = useMemo(() => new Set(favorites.map((f) => f.uid)), [favorites]);
  const isFavorite = useCallback((uid: string) => favoriteUids.has(uid), [favoriteUids]);

  const addSearchQuery = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      // Remove query if it already exists, then push to front
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 5);
    });
  }, []);

  const clearSearchHistory = useCallback(() => setSearchHistory([]), []);

  
  const getPlanetName = useCallback(async (url: string): Promise<string> => {
    if (planetCache.current[url]) return planetCache.current[url];
    try {
      const data = await fetchPlanetDetails(url);
      const name = data.result.properties.name;
      planetCache.current[url] = name;
      return name;
    } catch (err) {
      console.error(`Failed to resolve planet name from URL ${url}:`, err);
      return 'Unknown Planet';
    }
  }, []);

  const getFilmTitle = useCallback(async (url: string): Promise<string> => {
    if (filmCache.current[url]) return filmCache.current[url];
    try {
      const data = await fetchFilmDetails(url);
      const title = data.result.properties.title;
      filmCache.current[url] = title;
      return title;
    } catch (err) {
      console.error(`Failed to resolve film title from URL ${url}:`, err);
      return 'Unknown Episode';
    }
  }, []);

  const getCachedCharacter = useCallback(
    (uid: string): PersonDetail | null => characterCache.current[uid] ?? null,
    [],
  );

  const setCachedCharacter = useCallback((uid: string, data: PersonDetail) => {
    characterCache.current[uid] = data;
  }, []);

  return (
    <StarWarsContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        searchHistory,
        addSearchQuery,
        clearSearchHistory,
        getPlanetName,
        getFilmTitle,
        getCachedCharacter,
        setCachedCharacter,
      }}
    >
      {children}
    </StarWarsContext.Provider>
  );
}

export function useStarWars() {
  const context = useContext(StarWarsContext);
  if (context === undefined) {
    throw new Error('useStarWars must be used within a StarWarsProvider');
  }
  return context;
}
