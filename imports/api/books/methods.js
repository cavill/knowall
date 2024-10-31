import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Books } from './books';
import { generateRecommendations } from '../ai/recommendations';

Meteor.methods({
  async 'books.reset'() {
    if (!Meteor.isDevelopment) {
      throw new Meteor.Error('not-allowed', 'Reset only allowed in development');
    }
    return await Books.removeAsync({});
  },

  async 'books.createFromGoogle'(googleBookData, isRecommendation = false) {
    try {
      check(googleBookData, Match.ObjectIncluding({
        googleId: String,
        title: String,
        author: String,
        thumbnail: Match.Optional(String),
        description: Match.Optional(String),
        publishedDate: Match.Optional(String)
      }));

      // Try to find existing book first
      const existingBook = await Books.findOneAsync({ googleId: googleBookData.googleId });
      if (existingBook) {
        return existingBook._id;
      }

      // Create new book
      const bookId = await Books.insertAsync({
        ...googleBookData,
        createdAt: new Date(),
        recommendations: [],
        recommendedFor: [],
        isRecommendation
      });

      return bookId;
    } catch (error) {
      console.error('Error in books.createFromGoogle:', error);
      throw new Meteor.Error('create-book-failed', error.message);
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

  'books.regenerateRecommendations': async function(bookId) {
    check(bookId, String);
    
    const book = await Books.findOneAsync(bookId);
    if (!book) throw new Meteor.Error('book-not-found');

    // Add this check to prevent regenerating if recommendations exist
    if (book.recommendations && book.recommendations.length > 0) {
      return book.recommendations;
    }

    console.log('Regenerating recommendations for book:', book.title);
    return generateRecommendations(book);
  },

  async 'books.addRecommendation'(bookId, recommendation) {
    check(bookId, String);
    check(recommendation, {
      bookId: String,
      title: String,
      author: String,
      thumbnail: String,
      recommendedBy: Object,
      reason: String,
      createdAt: Date
    });

    return Books.updateAsync(bookId, {
      $push: { recommendations: recommendation }
    });
  },

  async 'debug.getBook'(bookId) {
    const book = await Books.findOneAsync(bookId);
    console.log('Book structure:', book);
    return book;
  },

  async 'debug.showBook'(bookId) {
    const book = await Books.findOneAsync(bookId);
    console.log('Book data:', JSON.stringify(book, null, 2));
    return book;
  },

  async 'debug.listBooks'() {
    try {
      console.log('Attempting to find books...');
      const books = await Books.find({}).fetchAsync();
      console.log('Found books count:', books.length);
      console.log('First few books:', JSON.stringify(books.slice(0, 3), null, 2));
      return books;
    } catch (error) {
      console.error('Error listing books:', error);
      return [];
    }
  },

  async 'debug.addTestBook'() {
    try {
      const testBook = {
        googleId: 'test123',
        title: 'Test Book',
        author: 'Test Author',
        thumbnail: '',
        description: 'A test book',
        publishedDate: '2023',
        recommendations: []
      };
      
      const id = await Books.insertAsync(testBook);
      console.log('Added test book with ID:', id);
      return id;
    } catch (error) {
      console.error('Error adding test book:', error);
      return null;
    }
  },

  'books.debug'(bookId) {
    check(bookId, String);
    return Books.findOne(bookId);
  },

  'books.updateRecommendationReason'(bookId, recommendationBookId, reason) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    check(bookId, String);
    check(recommendationBookId, String);
    check(reason, String);

    return Books.updateAsync(
      { 
        _id: bookId, 
        'recommendations.bookId': recommendationBookId,
        'recommendations.recommendedBy.userId': this.userId 
      },
      { 
        $set: { 'recommendations.$.reason': reason }
      }
    );
  }
});