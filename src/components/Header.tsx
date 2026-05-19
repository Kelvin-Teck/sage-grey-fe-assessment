import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Compass, Menu } from 'lucide-react';
import { useStarWars } from '../context/StarWarsContext';
import { useDebounce } from '../hooks/useDebounce';
import type { KeyboardEvent } from 'react';
import '../styles/Header.css';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchHistory, addSearchQuery, clearSearchHistory } = useStarWars();

  const queryParams = new URLSearchParams(location.search);
  const initialQuery = location.pathname === '/search' ? queryParams.get('q') || '' : '';

  const [searchVal, setSearchVal] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isUserTyping = useRef(false);

  // Sync input value with URL changes (back button, suggestion clicks)
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setSearchVal(q);
    } else {
      setSearchVal('');
    }
  }, [location]);

  const debouncedSearchVal = useDebounce(searchVal, 300);

  useEffect(() => {
    // Only perform the sync navigation if the change was explicitly triggered by user typing
    if (!isUserTyping.current) return;

    const trimmed = debouncedSearchVal.trim();
    if (trimmed) {
      const currentQuery = new URLSearchParams(location.search).get('q') || '';
      if (trimmed !== currentQuery || location.pathname !== '/search') {
        addSearchQuery(trimmed);
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    } else if (location.pathname === '/search') {
      // Debounced value is empty — user cleared the input, return home
      navigate('/');
    }

    if (debouncedSearchVal === searchVal) {
      isUserTyping.current = false;
    }
  }, [debouncedSearchVal, searchVal, navigate, addSearchQuery, location.pathname, location.search]);

  // Close dropdown on outside click
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
    isUserTyping.current = true;
    setSearchVal(e.target.value);
    setShowDropdown(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchVal(suggestion);
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleSuggestionKeyDown = (e: KeyboardEvent<HTMLDivElement>, suggestion: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSuggestionClick(suggestion);
    }
    // Allow Escape to close the dropdown
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
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
              marginRight: '0.5rem',
            }}
            className="mobile-menu-toggle"
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        )}
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Compass
            size={24}
            className="film-icon"
            style={{ marginRight: '0.5rem', color: 'var(--color-cyan)' }}
          />
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
            
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowDropdown(false);
              if (e.key === 'ArrowDown' && showDropdown) {
                // Move focus to first suggestion
                const first = dropdownRef.current?.querySelector<HTMLElement>('.autocomplete-item');
                first?.focus();
              }
            }}
            aria-autocomplete="list"
            aria-expanded={showDropdown && searchHistory.length > 0}
            aria-controls="search-history-listbox"
          />
        </div>

        
        {showDropdown && searchHistory.length > 0 && (
          <div
            className="autocomplete-dropdown"
            id="search-history-listbox"
            role="listbox"
            aria-label="Recent Searches"
          >
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
            {searchHistory.map((historyItem) => (
              <div
                key={historyItem}
                className="autocomplete-item"
                role="option"
                aria-selected={false}
                tabIndex={0}
                onClick={() => handleSuggestionClick(historyItem)}
                onKeyDown={(e) => handleSuggestionKeyDown(e, historyItem)}
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
