import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation = () => {
  const user = Meteor.user();
  const userEmail = user?.emails?.[0]?.address;

  const handleLogout = () => {
    Meteor.logout(error => {
      if (error) console.error('Logout error:', error);
    });
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-brand">
          <Link to="/">Knowall</Link>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          {user ? (
            <>
              <span className="user-email">{userEmail}</span>
              <button onClick={handleLogout} className="nav-button">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="nav-button">Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
}; 