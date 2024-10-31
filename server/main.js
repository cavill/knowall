import { Meteor } from 'meteor/meteor';
import { Books } from '/imports/api/books/books';
import '/imports/api/books/server/publications';
import '/imports/api/books/methods';
import '/imports/api/users/methods';

Meteor.startup(async () => {
  if (!Meteor.settings.private?.openai?.apiKey) {
    console.warn('Warning: OpenAI API key is not configured');
  }

  const booksCount = await Books.find().countAsync();
  if (booksCount === 0) {
    await Books.insertAsync({
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      description: "A fantasy novel about Bilbo Baggins' journey.",
      year: 1937,
      createdAt: new Date(),
    });
  }
});
