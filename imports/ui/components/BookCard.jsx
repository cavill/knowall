import React from 'react';
import { Link } from 'react-router-dom';

export const BookCard = ({ book }) => {
  return (
    <Link to={`/book/${book._id}`} className="book-card">
      {book.thumbnail && (
        <img src={book.thumbnail} alt={book.title} className="book-thumbnail" />
      )}
      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="author">{book.author}</p>
        {book.year && <p className="year">{book.year}</p>}
      </div>
    </Link>
  );
};
