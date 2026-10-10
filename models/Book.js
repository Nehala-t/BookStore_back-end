import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    images: {
  type: [String],
  required: true,
},

    category: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    publisher: {
      type: String,
      required: true,
      trim: true,
    },

    publicationDate: {
      type: Date,
      required: true,
    },

    pages: {
      type: Number,
      required: true,
      min: 1,
    },

    language: {
      type: String,
      required: true,
      trim: true,
      default: "English",
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // status: {
    //   type: String,
    //   enum: ["available", "out_of_stock", "inactive"],
    //   default: "available",
    // },
    isDeleted: {
  type: Boolean,
  default: false,
},
status: {
  type: String,
  enum: ["available", "unavailable"],
  default: "available",
},
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;