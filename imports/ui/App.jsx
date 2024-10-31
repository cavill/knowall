import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { BookSearch } from './components/BookSearch';
import { BookPage } from './pages/BookPage';
import { Home } from './pages/Home';
import { ClerkWrapper } from './ClerkProvider';

export const App = () => {
  return (
    <ClerkWrapper>
      <Router>
        <div className="app-container">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookPage />} />
          </Routes>
        </div>
      </Router>
    </ClerkWrapper>
  );
};
