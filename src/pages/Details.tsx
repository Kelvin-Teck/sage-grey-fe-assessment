import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Film, Globe } from 'lucide-react';
import { useStarWars } from '../context/StarWarsContext';
import { fetchPersonDetails, type PersonDetail } from '../services/swapi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import '../styles/Details.css';

export default function Details() {
  const { id } = useParams<{ id: string }>();
  
  const navigate = useNavigate();

  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    getCachedCharacter,
    setCachedCharacter,
    getPlanetName,
    getFilmTitle,
  } = useStarWars();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<PersonDetail | null>(null);
  const [homeworldName, setHomeworldName] = useState<string>('Resolving coordinates...');
  const [filmTitles, setFilmTitles] = useState<string[]>([]);

  const fav = id ? isFavorite(id) : false;

  const loadCharacterDetails = useCallback(async (uid: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    setHomeworldName('Resolving coordinates...');
    setFilmTitles([]);

    try {
      let charData = getCachedCharacter(uid);

      if (!charData) {
        
        const response = await fetchPersonDetails(uid, signal);
        if (signal?.aborted) return;
        charData = response.result;
        setCachedCharacter(uid, charData);
      }

      setCharacter(charData);

      const props = charData.properties;

      const homeworldPromise = getPlanetName(props.homeworld)
        .then((name) => { if (!signal?.aborted) setHomeworldName(name); })
        .catch(() => { if (!signal?.aborted) setHomeworldName('Unknown Sector'); });

      const filmsPromise =
        props.films && props.films.length > 0
          ? Promise.all(props.films.map((url) => getFilmTitle(url)))
              .then((titles) => { if (!signal?.aborted) setFilmTitles(titles); })
              .catch(() => { if (!signal?.aborted) setFilmTitles(['Unknown Galactic Records']); })
          : Promise.resolve().then(() => {
              if (!signal?.aborted) setFilmTitles(['No record of active combat appearances']);
            });

      await Promise.all([homeworldPromise, filmsPromise]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error(err);
      setError('System malfunction. Could not decrypt database archives for this entity.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [getCachedCharacter, setCachedCharacter, getPlanetName, getFilmTitle]);

  
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    loadCharacterDetails(id, controller.signal);
    return () => controller.abort();
  }, [id, loadCharacterDetails]);

  const handleFavoriteToggle = () => {
    if (!id || !character) return;
    if (fav) {
      removeFavorite(id);
    } else {
      addFavorite(id, character.properties.name);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={() => id && loadCharacterDetails(id)} />;
  }

  if (loading || !character) {
    return (
      <div>
        <div className="back-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
        </div>
        <LoadingSkeleton type="details" />
      </div>
    );
  }

  const props = character.properties;

  return (
    <div>
      
      <div className="back-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>

      <article className="details-card">
        <div className="details-header">
          <div className="details-title-section">
            <span className="details-subtitle">Datapad Specification Sheet</span>
            <h1 className="details-name">{props.name}</h1>
          </div>

          <button
            className={`details-fav-toggle-btn ${fav ? 'is-fav' : ''}`}
            onClick={handleFavoriteToggle}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={fav ? 'var(--color-amber)' : 'none'} />
            <span>{fav ? 'FAVOURITE' : 'MARK AS FAVOURITE'}</span>
          </button>
        </div>

        <div className="details-grid">
          <div>
            <h3 className="details-section-title">Physical Attributes</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Height</span>
                <span className="spec-value">
                  {props.height !== 'unknown' ? `${props.height} cm` : 'Unknown'}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Mass</span>
                <span className="spec-value">
                  {props.mass !== 'unknown' ? `${props.mass} kg` : 'Unknown'}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Gender</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                  {props.gender}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Birth Year</span>
                <span className="spec-value">{props.birth_year}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Eye Color</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                  {props.eye_color}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Hair Color</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                  {props.hair_color}
                </span>
              </div>
              <div className="spec-item" style={{ gridColumn: 'span 2' }}>
                <span className="spec-label">Skin Tone</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                  {props.skin_color}
                </span>
              </div>
            </div>
          </div>

          <div className="relationships-section">
            <div>
              <h3 className="details-section-title">Sector Coordinates</h3>
              <div className="film-item">
                <Globe size={16} className="film-icon" />
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Homeworld: </span>
                <span>{homeworldName}</span>
              </div>
            </div>

            <div>
              <h3 className="details-section-title">Galactic Event Chronology</h3>
              <div className="films-list">
                {filmTitles.map((title) => (
                  <div key={title} className="film-item">
                    <Film size={16} className="film-icon" />
                    <span>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
