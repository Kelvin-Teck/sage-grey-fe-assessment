import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
  // Caching mechanism
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
    } catch {
      return [];
    }
  });

  // Search History State (Persisted in localStorage)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sw_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // In-memory relationship caches to avoid duplicate network requests
  const [planetCache, setPlanetCache] = useState<Record<string, string>>({});
  const [filmCache, setFilmCache] = useState<Record<string, string>>({});
  const [characterCache, setCharacterCache] = useState<Record<string, PersonDetail>>({});

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem('sw_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync search history with localStorage
  useEffect(() => {
    localStorage.setItem('sw_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addFavorite = (uid: string, name: string) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.uid === uid)) return prev;
      return [...prev, { uid, name }];
    });
  };

  const removeFavorite = (uid: string) => {
    setFavorites((prev) => prev.filter((item) => item.uid !== uid));
  };

  const isFavorite = (uid: string) => {
    return favorites.some((item) => item.uid === uid);
  };

  const addSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchHistory((prev) => {
      // Remove query if it already exists, then push to front
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered];
      // Keep maximum 5 items
      return updated.slice(0, 5);
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  // Optimized homeworld name getter using local cache or API fetch
  const getPlanetName = async (url: string): Promise<string> => {
    if (planetCache[url]) {
      return planetCache[url];
    }
    try {
      const data = await fetchPlanetDetails(url);
      const name = data.result.properties.name;
      setPlanetCache((prev) => ({ ...prev, [url]: name }));
      return name;
    } catch (err) {
      console.error(`Failed to resolve planet name from URL ${url}:`, err);
      return 'Unknown Planet';
    }
  };

  // Optimized film title getter using local cache or API fetch
  const getFilmTitle = async (url: string): Promise<string> => {
    if (filmCache[url]) {
      return filmCache[url];
    }
    try {
      const data = await fetchFilmDetails(url);
      const title = data.result.properties.title;
      setFilmCache((prev) => ({ ...prev, [url]: title }));
      return title;
    } catch (err) {
      console.error(`Failed to resolve film title from URL ${url}:`, err);
      return 'Unknown Episode';
    }
  };

  const getCachedCharacter = (uid: string): PersonDetail | null => {
    return characterCache[uid] || null;
  };

  const setCachedCharacter = (uid: string, data: PersonDetail) => {
    setCharacterCache((prev) => ({ ...prev, [uid]: data }));
  };

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
