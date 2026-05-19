import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StarWarsProvider } from './context/StarWarsContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Details from './pages/Details';
import SearchResults from './pages/SearchResults';


function useDebouncedResize(callback: () => void, delay = 150) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(callback, delay);
    };
    window.addEventListener('resize', handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handler);
    };
  }, [callback, delay]);
}

export default function App() {
  // Sidebar is open by default on desktop (>1024px), closed on mobile/tablet
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 1024);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Only auto-close when tapping the overlay on mobile/tablet
  const closeSidebar = () => {
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  };

  // Fix #8: Debounced resize listener — re-evaluates breakpoint after user
  // stops resizing, avoiding cascading state updates during continuous drag.
  useDebouncedResize(() => {
    setSidebarOpen(window.innerWidth > 1024);
  }, 150);

  return (
    <StarWarsProvider>
      <BrowserRouter>
        {/* Fix #3: The root class drives ALL sidebar visibility via CSS rules.
            No conflicting inline styles on the overlay element. */}
        <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
          {/* Overlay: CSS hides this on desktop via display:none in .mobile-overlay.
              Only visible on viewports ≤1024px when the sidebar is open. */}
          {sidebarOpen && (
            <div className="mobile-overlay" onClick={closeSidebar} />
          )}

          {/* Sidebar Navigation */}
          <Sidebar onClose={closeSidebar} />

          {/* Main Layout Area */}
          <div className="main-content">
            {/* Header with Search and Menu Trigger */}
            <Header onToggleSidebar={toggleSidebar} />

            {/* Render Routing Viewports */}
            <main className="content-viewport">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/character/:id" element={<Details />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </StarWarsProvider>
  );
}
