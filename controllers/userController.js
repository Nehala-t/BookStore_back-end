import User from "../models/User.js";
import HttpError from "../utils/httpError.js";

// Get current user profile
export const getMyProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    const user = await User.findById(req.user.user_id).select(
      "-password"
    );

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
export const updateMyProfile = async (req, res, next) => {
  try {
    // if (!req.user || !req.user.user_id) {
    //   return next(new HttpError("Unauthorized user", 401));
    // }

    const userId = req.user.user_id;

    const {
      firstName,
      lastName,
      defaultAddress,
    } = req.body || {};

    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    // Update user fields
    if (firstName !== undefined) {
      user.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      user.lastName = lastName.trim();
    }

    // Update default address fields
    if (defaultAddress) {
      if (defaultAddress.firstName !== undefined) {
        user.defaultAddress.firstName =
          defaultAddress.firstName.trim();
      }

      if (defaultAddress.lastName !== undefined) {
        user.defaultAddress.lastName =
          defaultAddress.lastName.trim();
      }

      if (defaultAddress.phone !== undefined) {
        user.defaultAddress.phone =
          defaultAddress.phone.trim();
      }

      if (defaultAddress.address !== undefined) {
        user.defaultAddress.address =
          defaultAddress.address.trim();
      }

      if (defaultAddress.city !== undefined) {
        user.defaultAddress.city =
          defaultAddress.city.trim();
      }

      if (defaultAddress.state !== undefined) {
        user.defaultAddress.state =
          defaultAddress.state.trim();
      }

      if (defaultAddress.pincode !== undefined) {
        user.defaultAddress.pincode =
          defaultAddress.pincode.trim();
      }
    }

    await user.save();

    const updatedUser = await User.findById(userId).select(
      "-password"
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}
export const getAllUsers = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    if (req.user.role !== "admin") {
      return next(
        new HttpError("Only admin can view users", 403)
      );
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    if (req.user.role !== "admin") {
      return next(
        new HttpError("Only admin can view user details", 403)
      );
    }

    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
export const updateUserRole = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    if (req.user.role !== "admin") {
      return next(
        new HttpError("Only admin can update user role", 403)
      );
    }

    const { id } = req.params;
    const { role } = req.body || {};

    if (!role) {
      return next(new HttpError("Role is required", 400));
    }

    if (!["user", "seller", "admin"].includes(role)) {
      return next(
        new HttpError(
          "Role must be user, seller, or admin",
          400
        )
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    user.role = role;

    await user.save();

    const updatedUser = await User.findById(id).select(
      "-password"
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    if (req.user.role !== "admin") {
      return next(
        new HttpError("Only admin can delete users", 403)
      );
    }

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};