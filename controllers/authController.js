
import HttpError from "../utils/httpError.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// =========================
// Cookie Configuration
// =========================
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
});

// =========================
// Register User
// =========================
export const userRegister = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body || {};

    if (!firstName || !lastName || !email || !password) {
      return next(
        new HttpError("Please provide all required fields", 400)
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return next(new HttpError("Email already exists", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role === "seller" ? "seller" : "user",
      status: "Active",
      isDeleted: false,
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const token = jwt.sign(
      {
        user_id: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TOKEN_EXPIRY || "1d",
      }
    );

    const cookieOptions = getCookieOptions();

    res.cookie("accessToken", token, cookieOptions);

    // The role cookie can be read by frontend code if required.
    res.cookie("role", newUser.role, {
      ...cookieOptions,
      httpOnly: false,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
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
    console.error("Registration Error:", error.message);

    if (error.code === 11000) {
      return next(new HttpError("Email already exists", 400));
    }

    return next(
      new HttpError(error.message || "Internal Server Error", 500)
    );
  }
};

// =========================
// Login User
// =========================
export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return next(
        new HttpError("Email and password are required", 400)
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "_id firstName lastName email role password status isDeleted"
    );

    if (!user) {
      return next(new HttpError("Invalid email or password", 401));
    }

    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        status: "Deleted",
        message: "Your account has been deleted.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new HttpError("Invalid email or password", 401));
    }

    if (user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        status: "Blocked",
        message: "Your account has been blocked by the admin.",
      });
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TOKEN_EXPIRY || "1d",
      }
    );

    const cookieOptions = getCookieOptions();

    res.cookie("accessToken", token, cookieOptions);

    res.cookie("role", user.role, {
      ...cookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return next(
      new HttpError(error.message || "Internal Server Error", 500)
    );
  }
};

// =========================
// Logout User
// =========================
export const logout = async (req, res, next) => {
  try {
    const cookieOptions = getCookieOptions();

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    res.clearCookie("role", {
      httpOnly: false,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
};
