import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const ClerkUserName = ({ userId }) => {
  const [username, setUsername] = useState('loading...');

  useEffect(() => {
    Meteor.call('users.getUsername', userId, (error, result) => {
      if (error) {
        console.error('Error:', error);
        setUsername('unknown');
      } else {
        setUsername(result);
      }
    });
  }, [userId]);

  return <Link to={`/user/${username}`}>@{username}</Link>;
}; 