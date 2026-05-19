import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useStarWars } from '../context/StarWarsContext';
import type { MouseEvent } from 'react';
import '../styles/CharacterCard.css';

interface CharacterCardProps {
  uid: string;
  name: string;
}

export default function CharacterCard({ uid, name }: CharacterCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useStarWars();
  const fav = isFavorite(uid);

  const handleFavoriteClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fav) {
      removeFavorite(uid);
    } else {
      addFavorite(uid, name);
    }
  };

  return (
    <div className="character-card">
      <div className="card-info">
        <span className="character-meta">Star Wars Character</span>
        <h3 className="character-name">{name}</h3>
      </div>
      
      <div className="card-actions">
        <Link to={`/character/${uid}`} className="card-link">
          <span>Details</span>
          <ArrowRight size={14} />
        </Link>
        <button
          className={`card-fav-btn ${fav ? 'is-fav' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={16}
            fill={fav ? 'var(--color-amber)' : 'none'}
            style={{ stroke: fav ? 'var(--color-amber)' : 'var(--text-secondary)' }}
          />
        </button>
      </div>
    </div>
  );
}
