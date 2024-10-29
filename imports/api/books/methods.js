import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Books } from './books';
import { generateRecommendations } from '../ai/recommendations';

Meteor.methods({
  async 'books.createFromGoogle'(bookData) {
    check(bookData, {
      title: String,
      author: String,
      description: String,
      year: Match.Maybe(Match.Integer),
      thumbnail: Match.Maybe(String),
      googleBooksId: String
    });

    console.log('Creating/finding book:', bookData.title);

    try {
      // Check if book already exists
      const existingBook = await Books.findOneAsync({ googleBooksId: bookData.googleBooksId });
      if (existingBook) {
        console.log('Book already exists, checking recommendations');
        
        // If the book exists but has no recommendations, generate them
        if (!existingBook.recommendations) {
          console.log('No recommendations found, generating new ones');
          Meteor.defer(async () => {
            try {
              const recommendations = await generateRecommendations(bookData);
              await Books.updateAsync(existingBook._id, {
                $set: { recommendations }
              });
              console.log('Updated existing book with new recommendations');
            } catch (error) {
              console.error('Error generating recommendations for existing book:', error);
            }
          });
        }
        
        return existingBook._id;
      }

      // Create new book
      const bookId = await Books.insertAsync({
        ...bookData,
        createdAt: new Date(),
        recommendations: null
      });

      console.log('Created new book:', bookId);

      // Generate AI recommendations asynchronously
      Meteor.defer(async () => {
        console.log('Starting AI recommendations generation for new book:', bookId);
        try {
          const recommendations = await generateRecommendations(bookData);
          await Books.updateAsync(bookId, {
            $set: { recommendations }
          });
          console.log('Updated new book with recommendations');
        } catch (error) {
          console.error('Error generating recommendations:', error);
        }
      });

      return bookId;
    } catch (error) {
      console.error('Server error creating book:', error);
      throw new Meteor.Error('create-error', 'Failed to create book: ' + error.message);
    }
  },

  async 'books.ensureRecommendations'(bookId) {
    check(bookId, String);

    try {
      const book = await Books.findOneAsync(bookId);
      if (!book) {
        throw new Meteor.Error('not-found', 'Book not found');
      }

      if (!book.recommendations) {
        console.log('Generating missing recommendations for book:', book.title);
        Meteor.defer(async () => {
          try {
            const recommendations = await generateRecommendations(book);
            await Books.updateAsync(bookId, {
              $set: { recommendations }
            });
            console.log('Generated recommendations for existing book');
          } catch (error) {
            console.error('Error generating recommendations:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error ensuring recommendations:', error);
      throw new Meteor.Error('ensure-recommendations-error', error.message);
    }
  },

  async 'books.regenerateRecommendations'(bookId) {
    check(bookId, String);

    try {
      const book = await Books.findOneAsync(bookId);
      if (!book) {
        throw new Meteor.Error('not-found', 'Book not found');
      }

      console.log('Regenerating recommendations for book:', book.title);
      const recommendations = await generateRecommendations(book);
      
      await Books.updateAsync(bookId, {
        $set: { recommendations }
      });
      
      console.log('Successfully regenerated recommendations');
      return recommendations;
    } catch (error) {
      console.error('Error regenerating recommendations:', error);
      throw new Meteor.Error('regenerate-error', 'Failed to regenerate recommendations');
    }
  }
});