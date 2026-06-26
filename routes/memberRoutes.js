const express = require("express");
const { getMembers, getMemberStats, deleteMember, getMyBooks } = require("../controllers/memberController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/members/me/books:
 *   get:
 *     tags: [Members]
 *     summary: Get books currently borrowed by the logged-in member
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active borrows
 *       403:
 *         description: Forbidden
 */
router.get("/me/books", protect, authorize("member"), getMyBooks);

/**
 * @swagger
 * /api/members/stats:
 *   get:
 *     tags: [Members]
 *     summary: Get member count and active borrow stats (librarian only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats object
 */
router.get("/stats", protect, authorize("librarian"), getMemberStats);

/**
 * @swagger
 * /api/members:
 *   get:
 *     tags: [Members]
 *     summary: List all members (librarian only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated member list
 */
router.get("/", protect, authorize("librarian"), getMembers);

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     tags: [Members]
 *     summary: Delete a member (librarian only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member deleted
 *       404:
 *         description: Not found
 *       409:
 *         description: Member has active borrows
 */
router.delete("/:id", protect, authorize("librarian"), deleteMember);

module.exports = router;
