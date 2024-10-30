import React, { useState } from 'react';

export const SuggestBook = ({ bookId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchGoogleBooks = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggest = async (item) => {
    try {
      const book = {
        googleId: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown Author',
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || '',
        description: item.volumeInfo.description || '',
        publishedDate: item.volumeInfo.publishedDate || ''
      };

      const suggestedBookId = await Meteor.callAsync('books.createFromGoogle', book);
      await Meteor.callAsync('books.addRecommendation', bookId, {
        bookId: suggestedBookId,
        title: book.title,
        author: book.author,
        recommendedBy: {
          type: 'user',
          userId: Meteor.userId()
        },
        reason: '',
        createdAt: new Date()
      });

      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error suggesting book:', error);
    }
  };

  return (
    <div className="suggest-book">
      <h3>Suggest a Related Book</h3>
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a book to suggest..."
        />
        <button onClick={searchGoogleBooks} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="search-results">
        {searchResults.map((item) => (
          <div key={item.id} className="book-result">
            {item.volumeInfo.imageLinks?.thumbnail && 
              <img src={item.volumeInfo.imageLinks.thumbnail} alt={item.volumeInfo.title} />
            }
            <div>
              <h4>{item.volumeInfo.title}</h4>
              <p>{item.volumeInfo.authors?.[0] || 'Unknown Author'}</p>
              <button onClick={() => handleSuggest(item)}>
                Suggest This Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 