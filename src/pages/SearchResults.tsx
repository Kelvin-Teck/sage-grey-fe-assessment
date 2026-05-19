import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchCode } from 'lucide-react';
import { searchPeople, type PersonDetail } from '../services/swapi';
import CharacterCard from '../components/CharacterCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PersonDetail[]>([]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchPeople(searchTerm);
      setResults(data.result);
    } catch (err) {
      console.error(err);
      setError('Search failure. The archive system is currently overloaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(query);
  }, [query]);

  if (error) {
    return <ErrorState message={error} onRetry={() => performSearch(query)} />;
  }

  return (
    <div>
      <h2 className="grid-title">
        {loading ? 'Searching Archive...' : `Search Results for "${query}"`}
      </h2>

      {loading ? (
        <LoadingSkeleton type="grid" count={5} />
      ) : results.length === 0 ? (
        <div className="empty-state-container">
          <SearchCode size={48} style={{ color: 'var(--text-muted)', strokeWidth: 1.5 }} />
          <h2 className="empty-title">No Records Found</h2>
          <p className="empty-desc">
            No characters in our star maps match the name "{query}". Try checking your spelling or search for alternative entities.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Found {results.length} record{results.length > 1 ? 's' : ''} in databases
          </p>
          <div className="characters-grid">
            {results.map((char) => (
              <CharacterCard 
                key={char.uid} 
                uid={char.uid} 
                name={char.properties.name} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
