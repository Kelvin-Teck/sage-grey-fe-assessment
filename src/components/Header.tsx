import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Compass, Menu } from 'lucide-react';
import { useStarWars } from '../context/StarWarsContext';
import { useDebounce } from '../hooks/useDebounce';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchHistory, addSearchQuery, clearSearchHistory } = useStarWars();
  
  // Read search term from URL query parameter if present
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = location.pathname === '/search' ? queryParams.get('q') || '' : '';
  
  const [searchVal, setSearchVal] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Sync input value with URL changes (e.g. back button, clicking suggestions)
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setSearchVal(q);
    } else {
      setSearchVal('');
    }
  }, [location]);

  // Debounce the input search value
  const debouncedSearchVal = useDebounce(searchVal, 300);

  // Automatically navigate on debounced change
  useEffect(() => {
    const trimmed = debouncedSearchVal.trim();
    if (trimmed) {
      addSearchQuery(trimmed);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else if (location.pathname === '/search' && !searchVal.trim()) {
      // If user clears the input on the search page, go back home
      navigate('/');
    }
  }, [debouncedSearchVal]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    setShowDropdown(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchVal(suggestion);
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <header className="header-wrapper">
      <div className="logo-section">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginRight: '0.5rem'
            }}
            className="mobile-menu-toggle"
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Compass size={24} className="film-icon" style={{ marginRight: '0.5rem', color: 'var(--color-cyan)' }} />
          <span className="logo-text">SWAPI Explorer</span>
        </div>
      </div>

      <div className="search-section" ref={dropdownRef}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search characters (e.g. Luke, Obi-Wan)..."
            value={searchVal}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
          />
        </div>

        {showDropdown && searchHistory.length > 0 && (
          <div className="autocomplete-dropdown">
            <div className="autocomplete-header">
              <span>Recent Searches</span>
              <button 
                className="clear-history-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearSearchHistory();
                }}
                title="Clear All"
              >
                Clear
              </button>
            </div>
            {searchHistory.map((historyItem, idx) => (
              <div
                key={idx}
                className="autocomplete-item"
                onClick={() => handleSuggestionClick(historyItem)}
              >
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{historyItem}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
