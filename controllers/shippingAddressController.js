import ShippingAddress from "../models/ShippingAddress.js";
import HttpError from "../utils/httpError.js";

// ======================================================
// ADD SHIPPING ADDRESS
// ======================================================

export const AddAddress = async (req, res, next) => {
  try {
    // Get logged-in user ID from auth middleware
    const userId = req.user.user_id;

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return next(
        new HttpError(
          "All shipping address fields are required",
          400
        )
      );
    }

    // If this address should be default,
    // remove default status from other addresses
    if (isDefault === true) {
      await ShippingAddress.updateMany(
        {
          userId,
          isDeleted: false,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    // Check whether user already has an address
    const addressCount =
      await ShippingAddress.countDocuments({
        userId,
        isDeleted: false,
      });

    // If this is the user's first address,
    // automatically make it default
    const makeDefault =
      addressCount === 0
        ? true
        : isDefault === true;

    const newAddress =
      await ShippingAddress.create({
        userId,
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        pincode,
        isDefault: makeDefault,
      });

    res.status(201).json({
      success: true,
      message: "Shipping address added successfully",
      data: newAddress,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// VIEW ALL SHIPPING ADDRESSES
// ======================================================

export const ViewAddresses = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const addresses =
      await ShippingAddress.find({
        userId,
        isDeleted: false,
      }).sort({
        isDefault: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      message: "Shipping addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// VIEW SINGLE SHIPPING ADDRESS
// ======================================================

export const ViewAddress = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const { id } = req.params;

    const shippingAddress =
      await ShippingAddress.findOne({
        _id: id,
        userId,
        isDeleted: false,
      });

    if (!shippingAddress) {
      return next(
        new HttpError(
          "Shipping address not found",
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      message: "Shipping address fetched successfully",
      data: shippingAddress,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE SHIPPING ADDRESS
// ======================================================

export const UpdateAddress = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const { id } = req.params;

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    // Find address belonging to logged-in user
    const existingAddress =
      await ShippingAddress.findOne({
        _id: id,
        userId,
        isDeleted: false,
      });

    if (!existingAddress) {
      return next(
        new HttpError(
          "Shipping address not found",
          404
        )
      );
    }

    // If changing this address to default,
    // remove default from other addresses
    if (isDefault === true) {
      await ShippingAddress.updateMany(
        {
          userId,
          _id: { $ne: id },
          isDeleted: false,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    // Update fields
    existingAddress.firstName =
      firstName ?? existingAddress.firstName;

    existingAddress.lastName =
      lastName ?? existingAddress.lastName;

    existingAddress.phone =
      phone ?? existingAddress.phone;

    existingAddress.address =
      address ?? existingAddress.address;

    existingAddress.city =
      city ?? existingAddress.city;

    existingAddress.state =
      state ?? existingAddress.state;

    existingAddress.pincode =
      pincode ?? existingAddress.pincode;

    if (typeof isDefault === "boolean") {
      existingAddress.isDefault =
        isDefault;
    }

    await existingAddress.save();

    res.status(200).json({
      success: true,
      message: "Shipping address updated successfully",
      data: existingAddress,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// SET DEFAULT SHIPPING ADDRESS
// ======================================================

export const SetDefaultAddress = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.user_id;

    const { id } = req.params;

    // Check address exists
    const address =
      await ShippingAddress.findOne({
        _id: id,
        userId,
        isDeleted: false,
      });

    if (!address) {
      return next(
        new HttpError(
          "Shipping address not found",
          404
        )
      );
    }

    // Remove default from all user's addresses
    await ShippingAddress.updateMany(
      {
        userId,
        isDeleted: false,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    // Make selected address default
    address.isDefault = true;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Default shipping address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE SHIPPING ADDRESS
// ======================================================

export const DeleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const { id } = req.params;

    const address =
      await ShippingAddress.findOne({
        _id: id,
        userId,
        isDeleted: false,
      });

    if (!address) {
      return next(
        new HttpError(
          "Shipping address not found",
          404
        )
      );
    }

    // Soft delete
    address.isDeleted = true;
    address.isDefault = false;

    await address.save();

    // If deleted address was default,
    // automatically select another address
    const remainingAddress =
      await ShippingAddress.findOne({
        userId,
        isDeleted: false,
      }).sort({
        createdAt: -1,
      });

    if (remainingAddress) {
      remainingAddress.isDefault = true;

      await remainingAddress.save();
    }

    res.status(200).json({
      success: true,
      message: "Shipping address deleted successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};
