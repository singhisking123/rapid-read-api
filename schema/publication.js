const mongoose = require("mongoose");

//create a publication schema
const PublicationSchema = mongoose.Schema({
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

// create a publication model
const PublicationModel = mongoose.model('publications', PublicationSchema);

module.exports = PublicationModel;