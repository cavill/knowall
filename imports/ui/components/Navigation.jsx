import React from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, useUser, UserButton } from '@clerk/clerk-react';

export const Navigation = () => {
  const { user, isLoaded } = useUser();

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
                <Link to={`/user/${user.username}`}>@{user.username}</Link>
                <UserButton />
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