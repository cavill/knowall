import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';

export const UserAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    console.log('Form submitted with isLogin:', isLogin);

    if (isLogin === true) {
      // Login
      Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          console.error('Login error:', error);
          setError(error.reason || 'Login failed');
        } else {
          console.log('Login successful');
          navigate('/');
        }
      });
    } else {
      // Registration
      console.log('Attempting registration with:', email);
      Accounts.createUser({
        email: email,
        password: password
      }, (error) => {
        if (error) {
          console.error('Registration error:', error);
          setError(error.reason || 'Registration failed');
        } else {
          console.log('Registration successful');
          navigate('/');
        }
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="auth-button">
          {isLogin ? 'Login' : 'Register'}
        </button>

        <button 
          type="button" 
          className="toggle-auth-button"
          onClick={() => {
            console.log('Toggling isLogin from:', isLogin, 'to:', !isLogin);
            setIsLogin(!isLogin);
            setError(null);
          }}
        >
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </form>
    </div>
  );
}; 