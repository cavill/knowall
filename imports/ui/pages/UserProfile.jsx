import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Books } from '/imports/api/books/books';
import { useUser } from '@clerk/clerk-react';

export const UserProfile = () => {
  const { username } = useParams();
  const [userId, setUserId] = useState(null);
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    Meteor.call('users.getUserId', username, (error, result) => {
      if (error) {
        console.error('Error getting userId:', error);
      } else {
        setUserId(result);
      }
    });
  }, [username]);
  
  const { recommendations, isLoading } = useTracker(() => {
    if (!userId) return { recommendations: [], isLoading: true };

    const handle = Meteor.subscribe('books');
    const books = Books.find({}).fetch();
    
    const userRecs = books.reduce((acc, book) => {
      const recs = book.recommendations?.filter(
        rec => rec.recommendedBy.userId === userId
      ) || [];
      
      return [...acc, ...recs.map(rec => ({
        ...rec,
        sourceBook: {
          _id: book._id,
          title: book.title
        }
      }))];
    }, []);

    return {
      recommendations: userRecs,
      isLoading: !handle.ready()
    };
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>@{username}'s Recommendations</h2>
      
      <ul className="recommendations-list">
        {recommendations?.map((rec, index) => (
          <li key={index} className="recommendation-item">
            <div>
              Recommended <Link to={`/book/${rec.bookId}`}>{rec.title}</Link>
              <br />
              for <Link to={`/book/${rec.sourceBook._id}`}>{rec.sourceBook.title}</Link>
            </div>
            <div className="recommendation-reason">{rec.reason}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 