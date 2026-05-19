import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'An error occurred while loading data.', onRetry }: ErrorStateProps) {
  return (
    <div className="empty-state-container">
      <AlertTriangle size={48} style={{ color: 'var(--color-amber)', strokeWidth: 1.5 }} />
      <h2 className="empty-title">System Interruption</h2>
      <p className="empty-desc">{message}</p>
      {onRetry && (
        <button className="pagination-btn" onClick={onRetry} style={{ marginTop: '1rem' }}>
          <RefreshCw size={16} />
          <span>Retry Transmission</span>
        </button>
      )}
    </div>
  );
}
