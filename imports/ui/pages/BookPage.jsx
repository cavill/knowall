import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Books } from '/imports/api/books/books';

export const BookPage = () => {
  const { id } = useParams();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const { book, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('book', id);
    return {
      book: Books.findOne(id),
      isLoading: !handle.ready(),
    };
  });

  const handleRegenerateRecommendations = async () => {
    setIsRegenerating(true);
    setError(null);
    
    try {
      await Meteor.callAsync('books.regenerateRecommendations', id);
    } catch (error) {
      console.error('Error regenerating recommendations:', error);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Check if recommendations failed (contains the error message)
  const hasFailedRecommendations = book?.recommendations?.books?.[0] === "Unable to generate book recommendations";

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="error-state">
        <h2>Book Not Found</h2>
        <p>Sorry, we couldn't find the book you're looking for.</p>
        <Link to="/" className="button">Return to Search</Link>
      </div>
    );
  }

  return (
    <div className="book-page">
      <div className="book-header">
        {book.thumbnail && (
          <img src={book.thumbnail} alt={book.title} className="book-cover" />
        )}
        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          {book.year && <p className="year">Published: {book.year}</p>}
          <p className="description">{book.description}</p>
          
          <div className="share-buttons">
            <button onClick={() => navigator.clipboard.writeText(window.location.href)}>
              Copy Link
            </button>
          </div>
        </div>
      </div>

      <div className="recommendations-section">
        <h2>Recommended for you</h2>
        
        {!book.recommendations ? (
          <div className="loading-recommendations">
            <div className="loading-spinner"></div>
            <p>AI is generating personalized recommendations...</p>
            <p className="loading-note">This may take a few moments</p>
          </div>
        ) : hasFailedRecommendations ? (
          <div className="failed-recommendations">
            <p>Unable to generate recommendations.</p>
            <button 
              onClick={handleRegenerateRecommendations}
              disabled={isRegenerating}
              className="regenerate-button"
            >
              {isRegenerating ? 'Generating...' : 'Try Again'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        ) : (
          <div className="recommendations-grid">
            <div className="recommendation-category">
              <h3>Similar Books</h3>
              <ul>
                {book.recommendations.books?.map((rec, index) => (
                  <li key={`book-${index}`}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation-category">
              <h3>Movies & TV Shows</h3>
              <ul>
                {book.recommendations.visualMedia?.map((rec, index) => (
                  <li key={`media-${index}`}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation-category">
              <h3>Podcasts & Audiobooks</h3>
              <ul>
                {book.recommendations.audio?.map((rec, index) => (
                  <li key={`audio-${index}`}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 