import User from "../models/User.js";
import Book from "../models/Book.js";
import HttpError from "../utils/httpError.js";


export const getSellerProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    if (req.user.role !== "seller") {
      return next(
        new HttpError("Only sellers can access this", 403)
      );
    }

    const seller = await User.findById(
      req.user.user_id
    ).select("-password");

    if (!seller) {
      return next(
        new HttpError("Seller not found", 404)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Seller profile fetched successfully",
      data: seller,
    });

  } catch (error) {
    next(error);
  }
};


export const getSellerBooks = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    if (req.user.role !== "seller") {
      return next(
        new HttpError("Only sellers can view books", 403)
      );
    }

    const sellerId = req.user.user_id;

    const books = await Book.find({
      sellerId,
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Seller books fetched successfully",
      data: books,
    });

  } catch (error) {
    next(error);
  }
};


// export const getSellerBookCount = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.user_id) {
//       return next(
//         new HttpError("Unauthorized user", 401)
//       );
//     }

//     if (req.user.role !== "seller") {
//       return next(
//         new HttpError("Only sellers can access this", 403)
//       );
//     }

//     const count = await Book.countDocuments({
//       sellerId: req.user.user_id,
//       isDeleted: false,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Seller book count fetched successfully",
//       data: {
//         count,
//       },
//     });

//   } catch (error) {
//     next(error);
//   }
// };


export const getSellerDashboard = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    if (req.user.role !== "seller") {
      return next(
        new HttpError("Only sellers can access dashboard", 403)
      );
    }

    const sellerId = req.user.user_id;

    const totalBooks = await Book.countDocuments({
      sellerId,
      isDeleted: false,
    });

    const seller = await User.findById(
      sellerId
    ).select(
      "firstName lastName email role"
    );

    if (!seller) {
      return next(
        new HttpError("Seller not found", 404)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Seller dashboard fetched successfully",
      data: {
        seller,
        totalBooks,
      },
    });

  } catch (error) {
    next(error);
  }
};