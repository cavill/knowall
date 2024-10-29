import { Meteor } from 'meteor/meteor';
import { Books } from '../books';
import { check } from 'meteor/check';

Meteor.publish('books', function () {
  return Books.find();
});

Meteor.publish('book', function (bookId) {
  check(bookId, String);
  return Books.find({ _id: bookId });
}); 