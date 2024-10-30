// Add this new publication
Meteor.publish('recommendedBooks', function(bookIds) {
  check(bookIds, [String]);
  return Books.find({ _id: { $in: bookIds } });
}); 