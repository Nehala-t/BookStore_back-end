import HttpError from "../utils/httpError.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// =====================================================
// USER REGISTER
// =====================================================

export const userRegister = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return next(
        new HttpError(
          "Please provide all required fields",
          400
        )
      );
    }

    // Normalize email
    const normalizedEmail =
      email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return next(
        new HttpError(
          "Email already exists",
          400
        )
      );
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,

      role:
        role === "seller"
          ? "seller"
          : "user",

      // New users are active immediately
      status: "Active",

      // Account is not deleted
      isDeleted: false,
    });

    // =================================================
    // CREATE JWT
    // =================================================

    const token = jwt.sign(
      {
        user_id: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_TOKEN_EXPIRY,
      }
    );

    // =================================================
    // STORE ACCESS TOKEN COOKIE
    // =================================================

    res.cookie(
      "accessToken",
      token,
      {
        httpOnly: true,

        secure: true,

        sameSite: "none",

        path: "/",

        maxAge:
          24 *
          60 *
          60 *
          1000,
      }
    );

    // =================================================
    // STORE ROLE COOKIE
    // =================================================

    res.cookie(
      "role",
      newUser.role,
      {
        httpOnly: false,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/",

        maxAge:
          24 *
          60 *
          60 *
          1000,
      }
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully.",

      data: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        status: newUser.status,
        isDeleted: newUser.isDeleted,
      },
    });

  } catch (error) {
    console.error(
      "Registration Error:",
      error
    );

    return next(
      new HttpError(
        error.message ||
          "Internal Server Error",
        500
      )
    );
  }
};



// =====================================================
// USER LOGIN
// =====================================================

export const userLogin = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // =================================================
    // VALIDATE INPUT
    // =================================================

    if (!email || !password) {
      return next(
        new HttpError(
          "Email and password are required",
          400
        )
      );
    }

    // =================================================
    // NORMALIZE EMAIL
    // =================================================

    const normalizedEmail =
      email.toLowerCase().trim();

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select(
        "_id firstName lastName email role password status isDeleted"
      );

    console.log(
      "USER FOUND:",
      user
    );

    // =================================================
    // USER DOES NOT EXIST
    // =================================================

    if (!user) {
      return next(
        new HttpError(
          "Invalid email or password",
          401
        )
      );
    }

    // =================================================
    // CHECK DELETED ACCOUNT
    // =================================================

    if (user.isDeleted) {
      return res.status(403).json({
        success: false,

        status: "Deleted",

        message:
          "Your account has been deleted.",
      });
    }

    // =================================================
    // CHECK PASSWORD
    // =================================================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "Bcrypt Match Result:",
      isMatch
    );

    if (!isMatch) {
      return next(
        new HttpError(
          "Invalid email or password",
          401
        )
      );
    }

    // =================================================
    // CHECK BLOCKED USER
    // =================================================

  if (user.status === "Blocked") {
  return res.status(403).json({
    success: false,
    status: "Blocked",
    message:
      "Your account has been blocked by the admin.",
  });
}

    // =================================================
    // CREATE JWT
    // =================================================

    const token =
      jwt.sign(
        {
          user_id: user._id,

          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            process.env
              .JWT_TOKEN_EXPIRY,
        }
      );

    // =================================================
    // STORE ACCESS TOKEN COOKIE
    // =================================================

    res.cookie(
      "accessToken",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/",

        maxAge:
          24 *
          60 *
          60 *
          1000,
      }
    );

    // =================================================
    // STORE ROLE COOKIE
    // =================================================

    res.cookie(
      "role",
      user.role,
      {
        httpOnly: false,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/",

        maxAge:
          24 *
          60 *
          60 *
          1000,
      }
    );

    // =================================================
    // LOG LOGIN INFORMATION
    // =================================================

    console.log(
      "ACCESS TOKEN CREATED:",
      token
    );

    console.log(
      "USER ROLE:",
      user.role
    );

    console.log(
      "USER STATUS:",
      user.status
    );

    console.log(
      "SET-COOKIE HEADER:",
      res.getHeader(
        "Set-Cookie"
      )
    );

    // =================================================
    // LOGIN RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      data: {
        _id: user._id,

        email: user.email,

        role: user.role,

        firstName:
          user.firstName,

        lastName:
          user.lastName,

        status:
          user.status,
      },
    });

  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return next(
      new HttpError(
        error.message ||
          "Internal Server Error",
        500
      )
    );
  }
};


// =====================================================
// LOGOUT
// =====================================================

export const logout = async (
  req,
  res,
  next
) => {
  try {
    // Clear access token
    res.clearCookie(
      "accessToken",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/",
      }
    );

    // Clear role
    res.clearCookie(
      "role",
      {
        httpOnly: false,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/",
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};