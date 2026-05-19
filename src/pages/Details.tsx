import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Film, Globe } from 'lucide-react';
import { useStarWars } from '../context/StarWarsContext';
import { fetchPersonDetails, type PersonDetail } from '../services/swapi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const { 
    isFavorite, 
    addFavorite, 
    removeFavorite,
    getCachedCharacter,
    setCachedCharacter,
    getPlanetName,
    getFilmTitle
  } = useStarWars();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<PersonDetail | null>(null);
  const [homeworldName, setHomeworldName] = useState<string>('Resolving coordinates...');
  const [filmTitles, setFilmTitles] = useState<string[]>([]);

  const fav = id ? isFavorite(id) : false;

  const loadCharacterDetails = async (uid: string) => {
    setLoading(true);
    setError(null);
    setHomeworldName('Resolving coordinates...');
    setFilmTitles([]);

    try {
      // Check cache first for character details
      let charData = getCachedCharacter(uid);
      
      if (!charData) {
        const response = await fetchPersonDetails(uid);
        charData = response.result;
        setCachedCharacter(uid, charData);
      }
      
      setCharacter(charData);

      // Now resolve planet and film details in parallel
      const props = charData.properties;
      
      // Homeworld resolver
      const homeworldPromise = getPlanetName(props.homeworld)
        .then(name => setHomeworldName(name))
        .catch(() => setHomeworldName('Unknown Sector'));

      // Film titles resolver (parallel execution!)
      const filmsPromise = props.films && props.films.length > 0
        ? Promise.all(props.films.map(url => getFilmTitle(url)))
            .then(titles => setFilmTitles(titles))
            .catch(() => setFilmTitles(['Unknown Galactic Records']))
        : Promise.resolve().then(() => setFilmTitles(['No record of active combat appearances']));

      await Promise.all([homeworldPromise, filmsPromise]);

    } catch (err) {
      console.error(err);
      setError('System malfunction. Could not decrypt database archives for this entity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCharacterDetails(id);
    }
  }, [id]);

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
          <Link to="/" className="back-btn">
            <ArrowLeft size={16} />
            <span>Return to System Directory</span>
          </Link>
        </div>
        <LoadingSkeleton type="details" />
      </div>
    );
  }

  const props = character.properties;

  return (
    <div>
      <div className="back-nav">
        <Link to="/" className="back-btn">
          <ArrowLeft size={16} />
          <span>Return to System Directory</span>
        </Link>
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
            <span>{fav ? 'FAVORITED' : 'MARK AS FAVORITE'}</span>
          </button>
        </div>

        <div className="details-grid">
          <div>
            <h3 className="details-section-title">Physical Attributes</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Height</span>
                <span className="spec-value">{props.height !== 'unknown' ? `${props.height} cm` : 'Unknown'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Mass</span>
                <span className="spec-value">{props.mass !== 'unknown' ? `${props.mass} kg` : 'Unknown'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Gender</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>{props.gender}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Birth Year</span>
                <span className="spec-value">{props.birth_year}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Eye Color</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>{props.eye_color}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Hair Color</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>{props.hair_color}</span>
              </div>
              <div className="spec-item" style={{ gridColumn: 'span 2' }}>
                <span className="spec-label">Skin Tone</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>{props.skin_color}</span>
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
                {filmTitles.map((title, idx) => (
                  <div key={idx} className="film-item">
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
