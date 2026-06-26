const express = require("express");
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
} = require("../controllers/bookController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { createBookRules, updateBookRules, handleValidationErrors } = require("../validators/bookValidator");

const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: List books (paginated, searchable, filterable)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         description: Search by title or author
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of books with pagination
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getBooks);

/**
 * @swagger
 * /api/books:
 *   post:
 *     tags: [Books]
 *     summary: Create a new book (librarian only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, isbn, category, quantity]
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               isbn: { type: string }
 *               category: { type: string }
 *               quantity: { type: integer }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Book created
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Duplicate ISBN
 */
router.post("/", protect, authorize("librarian"), createBookRules, handleValidationErrors, createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get a book by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Not found
 */
router.get("/:id", protect, getBookById);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     tags: [Books]
 *     summary: Update a book (librarian only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               isbn: { type: string }
 *               category: { type: string }
 *               quantity: { type: integer }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Book updated
 *       404:
 *         description: Not found
 */
router.put("/:id", protect, authorize("librarian"), updateBookRules, handleValidationErrors, updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Delete a book (librarian only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       409:
 *         description: Book has active borrows
 */
router.delete("/:id", protect, authorize("librarian"), deleteBook);

/**
 * @swagger
 * /api/books/{id}/borrow:
 *   post:
 *     tags: [Borrow]
 *     summary: Borrow a book (member only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Borrowed successfully
 *       400:
 *         description: No copies available
 *       409:
 *         description: Already borrowed
 */
router.post("/:id/borrow", protect, authorize("member"), borrowBook);

/**
 * @swagger
 * /api/books/{id}/return:
 *   post:
 *     tags: [Borrow]
 *     summary: Return a book (member only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Returned successfully
 *       404:
 *         description: No active borrow found
 */
router.post("/:id/return", protect, authorize("member"), returnBook);

module.exports = router;
