import { Link } from 'react-router-dom';
import { Heart, Trash2, ShieldAlert } from 'lucide-react';
import { useStarWars } from '../context/StarWarsContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { favorites, removeFavorite } = useStarWars();

  return (
    <aside className={`sidebar-wrapper ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-title-section">
        <Heart size={16} style={{ color: 'var(--color-red)' }} />
        <h2 className="sidebar-title">FAVORITES ({favorites.length})</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <ShieldAlert size={28} style={{ color: 'var(--text-muted)' }} />
          <p>No favorites saved yet.</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
            Click the star/heart button on a character to add them.
          </span>
        </div>
      ) : (
        <ul className="favorites-list">
          {favorites.map((fav) => (
            <li key={fav.uid} className="favorite-item-wrapper">
              <Link 
                to={`/character/${fav.uid}`} 
                className="favorite-link"
                onClick={onClose}
              >
                {fav.name}
              </Link>
              <button
                className="unfavorite-btn"
                onClick={() => removeFavorite(fav.uid)}
                aria-label={`Remove ${fav.name} from favorites`}
                title="Remove favorite"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
