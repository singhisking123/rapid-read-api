const mongoose = require("mongoose");

//create a author schema
const AuthorSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  books: [String],
});

// create a author model
const AuthorModel = mongoose.model('authors', AuthorSchema);

module.exports = AuthorModel;