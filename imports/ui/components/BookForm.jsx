import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { BookSearch } from './BookSearch';

export const BookForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    year: '',
  });

  const handleBookSelect = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      year: book.year || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    Meteor.call('books.insert', {
      ...formData,
      year: Number(formData.year),
    }, (error) => {
      if (error) {
        console.error('Error inserting book:', error);
      } else {
        setFormData({
          title: '',
          author: '',
          description: '',
          year: '',
        });
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="book-form-container">
      <BookSearch onBookSelect={handleBookSelect} />
      
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Book Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="year"
            placeholder="Publication Year"
            value={formData.year}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}; 