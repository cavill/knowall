import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Books } from '/imports/api/books/books';
import { BookCard } from '../components/BookCard';
import { BookSearch } from '../components/BookSearch';

export const Home = () => {
  const { books, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('books');
    return {
      books: Books.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !handle.ready(),
    };
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page home-page">
      <p className="subtitle">Discover books and related content</p>
      <BookSearch />
      <div className="books-list">
        {books.map(book => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </div>
  );
};
