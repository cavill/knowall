import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Books } from '/imports/api/books/books';
import { SuggestBook } from '../components/SuggestBook';

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

  const { recommendedBooks } = useTracker(() => {
    if (!book?.recommendations) return { recommendedBooks: [] };
    
    const bookIds = book.recommendations.map(rec => rec.bookId);
    Meteor.subscribe('recommendedBooks', bookIds);
    
    return {
      recommendedBooks: Books.find({ _id: { $in: bookIds } }).fetch()
    };
  });

  useEffect(() => {
    // Only generate recommendations for primary books that have no recommendations
    if (book && !book.isRecommendation && (!book.recommendations || book.recommendations.length === 0)) {
      Meteor.call('books.regenerateRecommendations', id, (error) => {
        if (error) {
          console.error('Error generating initial recommendations:', error);
        }
      });
    }
  }, [book]);

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

  const renderRecommendations = () => {
    if (!book.recommendations || book.recommendations.length === 0) {
      // Only generate if we haven't already started
      if (!isRegenerating) {
        setIsRegenerating(true);
        Meteor.call('books.regenerateRecommendations', id, (error) => {
          if (error) console.error(error);
          setIsRegenerating(false);
        });
      }
      return null;
    }

    return (
      <div className="recommendations-container">
        <ul className="recommendations-list">
          {book.recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              {rec.thumbnail && <img src={rec.thumbnail} alt={rec.title} />}
              <div className="recommendation-title">
                <Link to={`/book/${rec.bookId}`}>
                  {rec.title} by {rec.author}
                </Link>
              </div>
              <div className="recommendation-reason">{rec.reason}</div>
              <div className="recommendation-source">
                Recommended by: {rec.recommendedBy.type === 'ai' ? 'AI Assistant' : `User ${rec.recommendedBy.userId}`}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

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
        <h2>Recommended Books</h2>
        {renderRecommendations()}
      </div>

      <div className="suggest-section">
        <SuggestBook bookId={id} />
      </div>
    </div>
  );
}; 