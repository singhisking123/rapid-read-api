require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

// importing schemas
const Book = require("./schema/book");
const Author = require("./schema/author");
const Publication = require("./schema/publication");

const App = express();

App.use(express.json());

let Database = require("./database");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

App.get("/", (req, res) => {
  res.json({ message: "Test Server is Running" });
});

// Route    - /book
// Des      - To get all books
// Access   - Public
// Method   - GET
// Params   - none
// Body     - none
App.get("/book", async (req, res) => {
  const bookCollection = await Book.find();
  return res.json({ Books: bookCollection });
});

// Route    - /book/:bookName
// Des      - To get a specific books by bookID
// Access   - Public
// Method   - GET
// Params   - bookName
// Body     - none
App.get("/book/:bookID", async (req, res) => {
  const bookName = await Book.findOne({ ISBN: req.params.bookID });
  if (!bookName)
    return res.json({
      error: `No book with ISBN ${req.params.bookID}`,
    });
  return res.json({ book: bookName });
});

// Route    - /book/c/:category
// Des      - To get a specific books by category
// Access   - Public
// Method   - GET
// Params   - category
// Body     - none
App.get("/book/c/:category", async (req, res) => {

  const bookNames = await Book.find({category: req.params.category});
  if(!bookNames)
  return res.json({error: `No book with category ${req.params.category}`});

  return res.json({books: bookNames});
});

// Route    - /book/a/:authorID
// Des      - To get a specific books by authorID
// Access   - Public
// Method   - GET
// Params   - authorID
// Body     - none
App.get("/book/a/:authorID", async (req, res) => {
  const autId = parseInt(req.params.authorID);
  const bookNames = await Book.find({authors: autId});
  if(!bookNames)
  return res.json({error: `No book with authorID ${autId}`});

  return res.json({books: bookNames});
});

// Route    - /book/new
// Des      - To add a book(reform it)
// Access   - Public
// Method   - POST
// Params   - none
// Body     - present
App.post("/book/new", async (req, res) => {
  try {
    const { newBook } = req.body;

    await Book.create(newBook);

    return res.json({message: 'Book added successfully'});
  } 
  catch (e) {
    return res.json({ error: e.message });
  }
});

// Route    - /book/update/:isbn
// Des      - To update a book(reform it)
// Access   - Public
// Method   - PUT
// Params   - isbn
// Body     - present
App.put("/book/updateTitle/:isbn/:newTitle", async (req, res) => {
  const bookTitle = req.params.newTitle;
  const isbn = req.params.isbn;
  const book = await Book.findOne({ISBN: isbn});
  if(!book)
  {
    return res.json({ error: `There exist no book with ISBN ${isbn}`});
  }
  await Book.findOneAndUpdate(
    {
      ISBN: isbn 
    },
    {
      title: bookTitle
    }
  );

  return res.json({message: "Title changed successfully"});
});

// Route    - /book/addAuthor/:isbn
// Des      - To add an author to a book(reform it)
// Access   - Public
// Method   - PUT
// Params   - isbn
// Body     - none
App.put("/book/addAuthor/:isbn/:id", async (req, res) => {
  const ID = req.params.id;
  const isbn = req.params.isbn;
  const book = await Book.findOne({ISBN: isbn});
  if(!book){
    return res.json({ error: `There exist no book with ISBN ${isbn}`});
  }

  await Book.findOneAndUpdate(
    {
      ISBN: isbn
    },
    {
      $addToSet: {
        authors: ID
      }
    }
  );

  await Author.findOneAndUpdate(
    {
      id: ID
    },
    {
      $addToSet: {
        books: isbn
      }
    }
  );

  return res.json({ message: "Author added successfully" });
});

// Route    - /book/delete/:isbn
// Des      - To delete a book(reform it)
// Access   - Public
// Method   - Delete
// Params   - isbn
// Body     - none
App.delete("/book/delete/:bookID", async (req, res) => {
  const isbn = req.params.bookID;
  const book = await Book.findOne({ISBN: isbn});
  if(!book){
    return res.json({ error: `There exist no book with ISBN ${isbn}`});
  }

  await Book.remove({ISBN: isbn});
  return res.json({message: "Book deleted successfully"});
});

// Route    - /book/deleteAuthor/:isbn/:id
// Des      - To delete an author from a book(reform it)
// Access   - Public
// Method   - Delete
// Params   - isbn, id
// Body     - none
App.delete("/book/deleteAuthor/:isbn/:id", async (req, res) => {
  const isbn = req.params.isbn;
  const ID = req.params.id;
  const book = await Book.findOne({ISBN: isbn});
  if(!book){
    return res.json({ error: `There exist no book with ISBN ${isbn}`});
  }
  const aut = await Author.findOne({id: ID});
  if(!aut){
    return res.json({ error: `There exist no author with id ${ID}`});
  }

  await Book.findOneAndUpdate(
    {
      ISBN: isbn
    },
    {
      $pull: {
        authors: ID
      }
    }
  );

  await Author.findOneAndUpdate(
    {
      id: ID
    },
    {
      $pull: {
        books: isbn
      }
    }
  );

  return res.json({message: `Author deleted from the book with ISBN ${isbn} successfully`});

});

// Route    - /author
// Des      - To get all authors
// Access   - Public
// Method   - GET
// Params   - none
// Body     - none
App.get("/author", async (req, res) => {
  
});

// Route    - /author/:authorID
// Des      - To get a author by authorID
// Access   - Public
// Method   - GET
// Params   - authorID
// Body     - none
App.get("/author/:authorID", (req, res) => {
  const autId = parseInt(req.params.authorID, 10);
  const authorName = Database.Author.filter((author) => author.id === autId);
  return res.json({ Author: authorName });
});

// Route    - /author/b/:bookID
// Des      - To get a list of authors based on bookID
// Access   - Public
// Method   - GET
// Params   - bookID
// Body     - none
App.get("/author/b/:bookID", (req, res) => {
  const authorName = Database.Author.filter((author) =>
    author.books.includes(req.params.bookID)
  );
  return res.json({ Author: authorName });
});

// Route    - /author/new
// Des      - To add a author
// Access   - Public
// Method   - POST
// Params   - none
// Body     - present
App.post("/author/new", (req, res) => {
  const { newAuthor } = req.body;
  Database.Author.push(newAuthor);
  return res.json(Database.Author);
});

// Route    - /author/updateName/:id/:newName
// Des      - To update author name
// Access   - Public
// Method   - PUT
// Params   - id, newName
// Body     - none
App.put("/author/updateName/:id/:newName", (req, res) => {
  Database.Author.forEach((author) => {
    if (author.id === parseInt(req.params.id)) {
      author.name = req.params.newName;
      return author;
    }
    return author;
  });
  return res.json(Database.Author);
});

// Route    - /author/delete/:id
// Des      - To delete an author(reform it)
// Access   - Public
// Method   - Delete
// Params   - id
// Body     - none
App.delete("/author/delete/:id", (req, res) => {
  Database.Author = Database.Author.filter(
    (author) => author.id !== parseInt(req.params.id)
  );
  return res.json(Database.Author);
});

// Route    - /publication
// Des      - To get all publications
// Access   - Public
// Method   - GET
// Params   - none
// Body     - none
App.get("/publication", (req, res) => {
  return res.json({ Publication: Database.Publication });
});

// Route    - /publication/:publicationID
// Des      - To get all publications
// Access   - Public
// Method   - GET
// Params   - publicationID
// Body     - none
App.get("/publication/:publicationID", (req, res) => {
  const pubID = parseInt(req.params.publicationID);
  const publicationName = Database.Publication.filter(
    (pub) => pub.id === pubID
  );
  return res.json({ Publication: publicationName });
});

// Route    - /publication/b/:bookID
// Des      - To get a list of publications based on bookID
// Access   - Public
// Method   - GET
// Params   - bookID
// Body     - none
App.get("/publication/b/:bookID", (req, res) => {
  const publicationName = Database.Publication.filter((pub) =>
    pub.books.includes(req.params.bookID)
  );
  return res.json({ Publication: publicationName });
});

// Route    - /publication/new
// Des      - To add a publication
// Access   - Public
// Method   - POST
// Params   - none
// Body     - present
App.post("/publication/new", (req, res) => {
  const { newPublication } = req.body;
  Database.Publication.push(newPublication);
  return res.json(Database.Publication);
});

// Route    - /publication/updateName/:id/:newName
// Des      - To update publication name
// Access   - Public
// Method   - PUT
// Params   - id, newName
// Body     - none
App.put("/publication/updateName/:id/:newName", (req, res) => {
  Database.Publication.forEach((pub) => {
    if (pub.id === parseInt(req.params.id)) {
      pub.name = req.params.newName;
      return pub;
    }
    return pub;
  });
  return res.json(Database.Publication);
});

// Route    - /publication/updateBook/:id/:bookISBN
// Des      - To update/add a book a publication
// Access   - Public
// Method   - PUT
// Params   - id, bookISBN
// Body     - none
App.put("/publication/addBook/:id/:bookISBN", (req, res) => {
  let f = 0;
  const ID = req.params.id;
  const isbn = req.params.bookISBN;
  Database.Book.forEach((book) => {
    if (book.ISBN === isbn) {
      f = book.publication;
      book.publication = parseInt(ID);
      return book;
    }
    return book;
  });

  Database.Publication.forEach((pub) => {
    if (pub.id === f) {
      pub.books = pub.books.filter((bookisbn) => bookisbn !== isbn);
    } else if (pub.id === parseInt(ID)) {
      pub.books.push(isbn);
    }
  });

  return res.json({ books: Database.Book, publications: Database.Publication });
});

// Route    - /publication/delete/:id
// Des      - To delete a publication(reform it)
// Access   - Public
// Method   - Delete
// Params   - id
// Body     - none
App.delete("/publication/delete/:id", (req, res) => {
  Database.Publication = Database.Publication.filter(
    (pub) => pub.id !== parseInt(req.params.id)
  );
  return res.json(Database.Publication);
});

// Route    - /publication/deleteBook/:isbn/:id
// Des      - To delete a book from a publication(reform it)
// Access   - Public
// Method   - Delete
// Params   - isbn, id
// Body     - none
App.delete("/publication/deleteBook/:isbn/:id", (req, res) => {
  const { isbn, id } = req.params;
  Database.Book.forEach((book) => {
    if (book.ISBN === isbn) {
      book.publication = -1;
      return book;
    }
    return book;
  });

  Database.Publication.forEach((publication) => {
    if (publication.id === parseInt(id)) {
      publication.books = publication.books.filter(
        (bookISBN) => bookISBN !== isbn
      );
      return publication;
    }
    return publication;
  });
  return res.json({ books: Database.Book, publications: Database.Publication });
});

App.listen(4000, () => console.log("Test Run"));
