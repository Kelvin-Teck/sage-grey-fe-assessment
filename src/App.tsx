import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StarWarsProvider } from './context/StarWarsContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Details from './pages/Details';
import SearchResults from './pages/SearchResults';

export default function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <StarWarsProvider>
      <BrowserRouter>
        <div className="app-container">
          {/* Overlay to close sidebar on mobile click outside */}
          {mobileSidebarOpen && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 85,
                backdropFilter: 'blur(4px)'
              }}
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar Navigation */}
          <Sidebar isOpen={mobileSidebarOpen} onClose={closeSidebar} />

          {/* Main Layout Area */}
          <div className="main-content">
            {/* Header with Search and Mobile Menu Trigger */}
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
