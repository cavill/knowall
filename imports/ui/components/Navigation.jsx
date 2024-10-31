import React from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, useUser } from '@clerk/clerk-react';

export const Navigation = () => {
  const { user, isLoaded } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  const handleLogout = () => {
    // We'll update this to use Clerk's signOut
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
          {isLoaded && (
            user ? (
              <>
                <span className="user-email">{userEmail}</span>
                <button onClick={handleLogout} className="nav-button">Logout</button>
              </>
            ) : (
              <SignInButton mode="modal" />
            )
          )}
        </div>
      </div>
    </nav>
  );
}; 