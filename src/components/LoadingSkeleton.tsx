interface LoadingSkeletonProps {
  type?: 'grid' | 'details';
  count?: number;
}

export default function LoadingSkeleton({ type = 'grid', count = 10 }: LoadingSkeletonProps) {
  if (type === 'details') {
    return (
      <div className="details-card" style={{ border: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="skeleton-line" style={{ width: '250px', height: '2.5rem' }} />
              <div className="skeleton-line" style={{ width: '120px', height: '1rem', marginTop: '0.5rem' }} />
            </div>
            <div className="skeleton-line" style={{ width: '150px', height: '2.5rem', borderRadius: '50px' }} />
          </div>
          
          <div className="details-grid" style={{ marginTop: '2rem' }}>
            <div>
              <div className="skeleton-line" style={{ width: '150px', height: '1.25rem', marginBottom: '1.5rem' }} />
              <div className="specs-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div className="skeleton-line" style={{ width: '60px', height: '0.75rem' }} />
                    <div className="skeleton-line" style={{ width: '100px', height: '1.25rem', marginTop: '0.25rem' }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="skeleton-line" style={{ width: '150px', height: '1.25rem', marginBottom: '1.5rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-line" style={{ height: '3.5rem', borderRadius: '8px' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="characters-grid">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
