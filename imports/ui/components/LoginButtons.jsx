import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const LoginButtons = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const user = Meteor.user();

  const handleSubmit = (e) => {
    e.preventDefault();
    Meteor.loginWithPassword(email, password, err => {
      if (err) alert(err.reason);
      else setShowLogin(false);
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    Accounts.createUser({ email, password }, err => {
      if (err) alert(err.reason);
      else setShowLogin(false);
    });
  };

  if (user) {
    return (
      <div className="login-buttons">
        <span>Welcome, {user.emails[0].address}</span>
        <button onClick={() => Meteor.logout()}>Sign Out</button>
      </div>
    );
  }

  if (!showLogin) {
    return (
      <div className="login-buttons">
        <button onClick={() => setShowLogin(true)}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
        <button onClick={handleRegister}>Register</button>
        <button onClick={() => setShowLogin(false)}>Cancel</button>
      </form>
    </div>
  );
}; 