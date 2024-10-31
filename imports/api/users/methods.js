import { Meteor } from 'meteor/meteor';

Meteor.methods({
  'users.getUsername': async function(userId) {
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${Meteor.settings.private.clerk.secretKey}`,
        }
      });
      const user = await response.json();
      return user.username;
    } catch (error) {
      console.error('Error fetching username:', error);
      return 'unknown';
    }
  },

  'users.getUserId': async function(username) {
    try {
      const response = await fetch('https://api.clerk.com/v1/users', {
        headers: {
          'Authorization': `Bearer ${Meteor.settings.private.clerk.secretKey}`,
        }
      });
      const users = await response.json();
      const user = users.find(u => u.username === username);
      return user?.id;
    } catch (error) {
      console.error('Error fetching userId:', error);
      throw new Meteor.Error('fetch-error', error.message);
    }
  }
}); 