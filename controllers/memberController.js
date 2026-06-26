const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const Borrow = require("../models/Borrow");

/**
 * @desc    Get all members
 * @route   GET /api/members
 * @access  Librarian
 */
const getMembers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    User.find({ role: "member" }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments({ role: "member" }),
  ]);

  res.json({
    success: true,
    data: members,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @desc    Get member count stats
 * @route   GET /api/members/stats
 * @access  Librarian
 */
const getMemberStats = asyncHandler(async (req, res) => {
  const [totalMembers, activeborrows] = await Promise.all([
    User.countDocuments({ role: "member" }),
    Borrow.countDocuments({ status: "borrowed" }),
  ]);

  res.json({
    success: true,
    data: { totalMembers, activeBorrows: activeborrows },
  });
});

/**
 * @desc    Delete a member
 * @route   DELETE /api/members/:id
 * @access  Librarian
 */
const deleteMember = asyncHandler(async (req, res) => {
  const member = await User.findOne({ _id: req.params.id, role: "member" });
  if (!member) {
    return res.status(404).json({ success: false, message: "Member not found" });
  }

  const activeBorrow = await Borrow.findOne({ user: req.params.id, status: "borrowed" });
  if (activeBorrow) {
    return res.status(409).json({
      success: false,
      message: "Cannot delete a member who has active borrows",
    });
  }

  await Borrow.deleteMany({ user: req.params.id });
  await member.deleteOne();

  res.json({ success: true, message: "Member deleted successfully" });
});

/**
 * @desc    Get books currently borrowed by the logged-in member
 * @route   GET /api/members/me/books
 * @access  Member
 */
const getMyBooks = asyncHandler(async (req, res) => {
  const borrows = await Borrow.find({ user: req.user._id, status: "borrowed" })
    .populate("book", "title author isbn category availableQuantity")
    .sort({ borrowedAt: -1 });

  res.json({
    success: true,
    data: borrows,
  });
});

module.exports = { getMembers, getMemberStats, deleteMember, getMyBooks };
