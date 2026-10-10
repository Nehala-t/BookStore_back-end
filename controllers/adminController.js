import User from "../models/User.js";
import Book from "../models/Book.js";
import Checkout from "../models/Checkout.js";
import { sendEmail } from "../mail/nodemailer.js";

import {
  bookDeleteTemplate,accountStatusTemplate
} from "../mail/emailTemplate.js";

// ==========================================
// ADMIN DASHBOARD
// ==========================================

export const getDashboardData = async (req, res, next) => {
  try {
    // ==========================================
    // ACTIVE USERS
    // ==========================================

    const activeUsers = await User.countDocuments({
      role: { $in: ["user", "seller"] },
      status: "Accepted",
      isDeleted: false,
    });

    // ==========================================
    // TOTAL BOOKS
    // ==========================================

    const totalBooks = await Book.countDocuments({
      isDeleted: false,
      status: "available",
    });

    // ==========================================
    // TOTAL ORDERS
    // ==========================================

    const totalOrders = await Checkout.countDocuments({
      isDeleted: false,
    });

    // ==========================================
    // TOTAL REVENUE
    // Only paid orders
    // ==========================================

    const revenueResult = await Checkout.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    // ==========================================
    // RECENT CHECKOUTS
    // ==========================================

    const recentOrders = await Checkout.find({
      isDeleted: false,
    })
      .populate(
        "userId",
        "firstName lastName email"
      )
      .populate(
        "products.bookId",
        "title author"
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ==========================================
    // FORMAT ORDERS FOR ADMIN DASHBOARD
    // ==========================================

    const transactions = recentOrders.map(
      (order) => {
        const user = order.userId;

        // Get first book from the order
        const firstProduct =
          order.products?.[0];

        const book = firstProduct?.bookId;

        const customerName = user
          ? `${user.firstName || ""} ${
              user.lastName || ""
            }`.trim()
          : "Unknown User";

        const initials = customerName
          .split(" ")
          .map((name) => name.charAt(0))
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return {
          id: order._id,

          name: customerName,

          email: user?.email || "No email",

          status:
            order.paymentStatus === "paid"
              ? "Completed"
              : order.paymentStatus === "failed"
              ? "Failed"
              : "Pending",

          date: order.createdAt,

          amount: `₹${order.totalAmount}`,

          initials,

          book: book?.title || "Book",

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,
        };
      }
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message:
        "Dashboard data fetched successfully",

      data: {
        metrics: {
          totalRevenue,
          totalOrders,
          activeUsers,
          totalBooks,
        },

        transactions,
      },
    });
  } catch (error) {
    console.error(
      "Get Dashboard Data Error:",
      error
    );

    next(error);
  }
};


// =====================================================
// GET ALL USERS
// =====================================================

export const getAllUsers = async (
  req,
  res,
  next
) => {
  try {
    const { search } = req.query;

    const filter = {
      $or: [
        {
          isDeleted: false,
        },
        {
          isDeleted: {
            $exists: false,
          },
        },
      ],
    };

    // Search users
    if (search && search.trim()) {
      filter.$and = [
        {
          $or: [
            {
              firstName: {
                $regex: search.trim(),
                $options: "i",
              },
            },
            {
              lastName: {
                $regex: search.trim(),
                $options: "i",
              },
            },
            {
              email: {
                $regex: search.trim(),
                $options: "i",
              },
            },
            {
              role: {
                $regex: search.trim(),
                $options: "i",
              },
            },
          ],
        },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error(
      "Get All Users Error:",
      error
    );

    next(error);
  }
};

// =====================================================
// UPDATE USER STATUS
// =====================================================

export const updateUserStatus = async (
  req,
  res,
  next
) => {
  try {
    const { userId } = req.params;

    const { status } = req.body;

    // =================================================
    // VALIDATE STATUS
    // =================================================

    if (
      !["Active", "Blocked"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // ADMIN STATUS CANNOT BE CHANGED
    // =================================================

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin status cannot be changed",
      });
    }

    // =================================================
    // UPDATE STATUS
    // =================================================

    user.status = status;

    await user.save();

    console.log(
      `User ${user.email} status changed to ${status}`
    );

    // =================================================
    // SEND ACCOUNT STATUS EMAIL
    // =================================================

    try {
      const html =
        accountStatusTemplate({
          firstName: user.firstName,
          status: user.status,
        });

      await sendEmail({
        to: user.email,

        subject:
          status === "Blocked"
            ? "Your BookStore Account Has Been Blocked"
            : "Your BookStore Account Is Active",

        html,
      });

      console.log(
        `Status email successfully sent to ${user.email}`
      );
    } catch (emailError) {
      console.error(
        "Status email sending failed:",
        emailError.message
      );

      // Do not fail the status update
      // if email sending fails.
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        status === "Blocked"
          ? "User blocked successfully"
          : "User activated successfully",

      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        isDeleted: user.isDeleted,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Update User Status Error:",
      error
    );

    next(error);
  }
};


export const getActiveUsersCount = async (req, res, next) => {
  try {
    const activeUsers = await User.countDocuments({
      role: { $in: ["user", "seller"] },
      status: "Accepted",
      isDeleted: false,
    });

    return res.status(200).json({
      success: true,
      message: "Active users count fetched successfully",
      data: {
        activeUsers,
      },
    });
  } catch (error) {
    console.error(
      "Get Active Users Count Error:",
      error
    );

    next(error);
  }
};



// =====================================================
// GET ALL BOOKS FOR ADMIN DASHBOARD
// =====================================================

export const getAdminBooks = async (req, res, next) => {
  try {
    const { search } = req.query;

    const filter = {
      isDeleted: false,
    };

    // Search books
    if (search && search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          author: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          category: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          isbn: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const totalCatalog = books.length;

    const lowStockItems = books.filter(
      (book) =>
        Number(book.stock) > 0 &&
        Number(book.stock) <= 10
    ).length;

    const outOfStock = books.filter(
      (book) => Number(book.stock) === 0
    ).length;

    return res.status(200).json({
      success: true,
      message: "Admin books fetched successfully",
      data: {
        books,
        stats: {
          totalCatalog,
          lowStockItems,
          outOfStock,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get Admin Books Error:",
      error
    );

    next(error);
  }
};


export const deleteBook = async (req, res, next) => {
  try {
    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================

    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // ==========================================
    // CHECK ADMIN ROLE
    // ==========================================

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete books",
      });
    }

    const { id } = req.params;

    // ==========================================
    // FIND BOOK
    // ==========================================

    const book = await Book.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // ==========================================
    // FIND SELLER
    // ==========================================

    const seller = await User.findById(
      book.sellerId
    ).select(
      "firstName lastName email"
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // ==========================================
    // SOFT DELETE
    // ==========================================

    book.isDeleted = true;

    await book.save();

    // ==========================================
    // SELLER NAME
    // ==========================================

    const sellerName =
      `${seller.firstName || ""} ${
        seller.lastName || ""
      }`.trim() || "Seller";

    // ==========================================
    // HANDLEBARS TEMPLATE
    // ==========================================

    const emailHtml = bookDeleteTemplate({
      sellerName,
      bookTitle: book.title,
      author: book.author || "Unknown Author",
    });

    // ==========================================
    // SEND EMAIL
    // ==========================================

    try {
      await sendEmail({
        to: seller.email,

        subject:
          "Your book has been removed from BookStore",

        html: emailHtml,
      });

      console.log(
        `Book deletion email sent to ${seller.email}`
      );

    } catch (emailError) {

      console.error(
        "Book deleted but seller email failed:",
        emailError
      );

    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",

      data: {
        bookId: book._id,
      },
    });

  } catch (error) {

    console.error(
      "Delete Book Error:",
      error
    );

    next(error);
  }
};