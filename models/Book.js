const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    availableQuantity: {
      type: Number,
      min: [0, "Available quantity cannot be negative"],
    },
  },
  { timestamps: true }
);

bookSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableQuantity = this.quantity;
  }
  next();
});

module.exports = mongoose.model("Book", bookSchema);
