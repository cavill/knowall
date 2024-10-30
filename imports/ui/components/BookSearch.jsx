import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import axios from 'axios';

export const BookSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const searchBooks = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Meteor settings:', Meteor.settings);
      const apiKey = Meteor.settings.public.googleBooks.apiKey;
      console.log('API Key:', apiKey);
      
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`
      );
      const books = response.data.items.map(item => ({
        googleId: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown',
        description: item.volumeInfo.description || 'No description available',
        publishedDate: item.volumeInfo.publishedDate || '',
        thumbnail: item.volumeInfo.imageLinks?.thumbnail
      }));
      setResults(books);
    } catch (error) {
      console.error('Error searching books:', error);
    }
    setIsLoading(false);
  };

  const handleBookSelect = async (book) => {
    setError(null);
    try {
      const bookId = await new Promise((resolve, reject) => {
        Meteor.call('books.createFromGoogle', book, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
      
      console.log('Book created/found with ID:', bookId);
      navigate(`/book/${bookId}`);
    } catch (error) {
      console.error('Error handling book selection:', error);
      setError('Failed to load book details. Please try again.');
    }
  };

  return (
    <div className="book-search">
      <form onSubmit={searchBooks}>
        <div className="search-input">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a book..."
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="search-results">
        {results.map((book, index) => (
          <div 
            key={index} 
            className="search-result" 
            onClick={() => handleBookSelect(book)}
          >
            {book.thumbnail && (
              <img src={book.thumbnail} alt={book.title} className="book-thumbnail" />
            )}
            <div className="book-info">
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              {book.year && <p>{book.year}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 