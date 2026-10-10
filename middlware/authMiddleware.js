import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpError from "../utils/httpError.js";

export const authMiddleware = async (
  req,
  res,
  next
) => {
  try {
    console.log(
      "================================="
    );

    console.log(
      "Request:",
      req.method,
      req.originalUrl
    );

    // =================================================
    // GET TOKEN FROM COOKIE
    // =================================================

    let token =
      req.cookies.accessToken;

    console.log(
      "Cookie token:",
      token
    );

    // =================================================
    // FALLBACK TO AUTHORIZATION HEADER
    // =================================================

    if (!token) {
      const authHeader =
        req.headers.authorization;

      console.log(
        "Authorization header:",
        authHeader
      );

      if (
        authHeader &&
        authHeader.startsWith("Bearer ")
      ) {
        token =
          authHeader.split(" ")[1];
      }
    }

    // =================================================
    // TOKEN REQUIRED
    // =================================================

    if (!token) {
      return next(
        new HttpError(
          "Access token is required",
          401
        )
      );
    }

    // =================================================
    // VERIFY TOKEN
    // =================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "Decoded token:",
      decoded
    );

    // =================================================
    // FIND USER
    // =================================================

    const user = await User.findById(
      decoded.user_id
    ).select("-password");

    if (!user) {
      return next(
        new HttpError(
          "User not found",
          404
        )
      );
    }

    console.log(
      "Authenticated user:",
      user._id
    );

    console.log(
      "User role:",
      user.role
    );

    console.log(
      "User status:",
      user.status
    );

    // =================================================
    // CHECK DELETED ACCOUNT
    // APPLIES TO ALL ROLES
    // =================================================

    if (user.isDeleted) {
      return next(
        new HttpError(
          "Your account has been deleted",
          403
        )
      );
    }

    // =================================================
    // CHECK BLOCKED ACCOUNT
    // APPLIES TO ALL ROLES
    // =================================================

    if (user.status === "Blocked") {
      return next(
        new HttpError(
          "Your account has been blocked by the admin",
          403
        )
      );
    }

    // =================================================
    // STORE AUTH DATA
    // =================================================

    req.user = decoded;

    req.dbUser = user;

    // =================================================
    // CONTINUE
    // =================================================

    next();

  } catch (error) {
    console.log(
      "Auth error:",
      error.message
    );

    return next(
      new HttpError(
        "Invalid or expired token",
        401
      )
    );
  }
};