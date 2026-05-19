import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPeople, type PersonSummary } from '../services/swapi';
import CharacterCard from '../components/CharacterCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read current page from URL params (defaults to 1)
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<PersonSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const loadCharacters = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPeople(page, 10);
      setCharacters(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
      setError('Unable to establish connection to the Star Wars Archives. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when currentPage URL query parameter changes
  useEffect(() => {
    loadCharacters(currentPage);
  }, [currentPage]);

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
        <LoadingSkeleton type="grid" count={10} />
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
