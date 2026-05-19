import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPeople, type PersonSummary } from '../services/swapi';
import CharacterCard from '../components/CharacterCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import '../styles/Home.css';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = searchParams.get('page');
  const parsed = parseInt(pageParam ?? '', 10);
  const currentPage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<PersonSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  
  const loadCharacters = useCallback(async (page: number, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPeople(page, 12, signal);
      setCharacters(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error(err);
      setError('Unable to establish connection to the Star Wars Archives. Please try again.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    const controller = new AbortController();
    loadCharacters(currentPage, controller.signal);
    return () => controller.abort();
  }, [currentPage, loadCharacters]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return <ErrorState message={error} onRetry={() => loadCharacters(currentPage)} />;
  }

  return (
    <div>
      <h2 className="grid-title">Star Wars Universe Characters</h2>

      {loading ? (
        <LoadingSkeleton type="grid" count={12} />
      ) : (
        <>
          <div className="characters-grid">
            {characters.map((char) => (
              <CharacterCard key={char.uid} uid={char.uid} name={char.name} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span className="page-indicator">
                {currentPage} / {totalPages}
              </span>

              <button
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Next Page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
