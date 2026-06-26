const asyncHandler = require("../middleware/asyncHandler");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

/**
 * @desc    Create a new book
 * @route   POST /api/books
 * @access  Librarian
 */
const createBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, description, quantity } = req.body;

  const existing = await Book.findOne({ isbn });
  if (existing) {
    return res.status(409).json({ success: false, message: "A book with this ISBN already exists" });
  }

  const book = await Book.create({ title, author, isbn, category, description, quantity });

  res.status(201).json({ success: true, message: "Book created successfully", data: book });
});

/**
 * @desc    Get all books with pagination, search, category filter
 * @route   GET /api/books
 * @access  Any authenticated user
 */
const getBooks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.search) {
    const re = new RegExp(req.query.search, "i");
    filter.$or = [{ title: re }, { author: re }];
  }

  if (req.query.category) {
    filter.category = new RegExp(`^${req.query.category}$`, "i");
  }

  const [books, total] = await Promise.all([
    Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Book.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get a single book by ID
 * @route   GET /api/books/:id
 * @access  Any authenticated user
 */
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }
  res.json({ success: true, data: book });
});

/**
 * @desc    Update a book
 * @route   PUT /api/books/:id
 * @access  Librarian
 */
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  // If ISBN is being changed, check for duplicates
  if (req.body.isbn && req.body.isbn !== book.isbn) {
    const dup = await Book.findOne({ isbn: req.body.isbn });
    if (dup) {
      return res.status(409).json({ success: false, message: "A book with this ISBN already exists" });
    }
  }

  // Adjust availableQuantity when total quantity changes
  if (req.body.quantity !== undefined) {
    const diff = req.body.quantity - book.quantity;
    req.body.availableQuantity = Math.max(0, book.availableQuantity + diff);
  }

  const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: "Book updated successfully", data: updated });
});

/**
 * @desc    Delete a book
 * @route   DELETE /api/books/:id
 * @access  Librarian
 */
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  const activeBorrow = await Borrow.findOne({ book: req.params.id, status: "borrowed" });
  if (activeBorrow) {
    return res.status(409).json({
      success: false,
      message: "Cannot delete a book that is currently borrowed",
    });
  }

  await Borrow.deleteMany({ book: req.params.id });
  await book.deleteOne();

  res.json({ success: true, message: "Book deleted successfully" });
});

/**
 * @desc    Borrow a book
 * @route   POST /api/books/:id/borrow
 * @access  Member
 */
const borrowBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  const alreadyBorrowed = await Borrow.findOne({
    user: req.user._id,
    book: req.params.id,
    status: "borrowed",
  });
  if (alreadyBorrowed) {
    return res.status(409).json({ success: false, message: "You have already borrowed this book" });
  }

  if (book.availableQuantity < 1) {
    return res.status(400).json({ success: false, message: "No copies available" });
  }

  book.availableQuantity -= 1;
  await book.save();

  const borrow = await Borrow.create({ user: req.user._id, book: req.params.id });

  res.status(201).json({
    success: true,
    message: "Book borrowed successfully",
    data: borrow,
  });
});

/**
 * @desc    Return a book
 * @route   POST /api/books/:id/return
 * @access  Member
 */
const returnBook = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findOne({
    user: req.user._id,
    book: req.params.id,
    status: "borrowed",
  });

  if (!borrow) {
    return res.status(404).json({ success: false, message: "No active borrow record found for this book" });
  }

  borrow.status = "returned";
  borrow.returnedAt = new Date();
  await borrow.save();

  await Book.findByIdAndUpdate(req.params.id, { $inc: { availableQuantity: 1 } });

  res.json({ success: true, message: "Book returned successfully", data: borrow });
});

module.exports = { createBook, getBooks, getBookById, updateBook, deleteBook, borrowBook, returnBook };
