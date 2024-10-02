import User from "../schemas/userSchema.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/emailSender.js";

export const addUser = asyncHandler(async (req, res) => {
  try {
    const { username, password, email, phone, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        msg: "User already exists with this email or phone",
      });
    }

    const user = await User.create({
      username,
      password,
      email,
      phone,
      role: role || "STAFF",
    });

    return res.status(201).json({
      success: true,
      msg: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server Error", error });
  }
});

function generateSecureNumericOTP(length) {
  length = 4;

  const digits = "0123456789";
  const digitsLength = digits.length;

  const array = new Uint32Array(length);

  crypto.getRandomValues(array);

  const otp = Array.from(array, (value) => digits[value % digitsLength]).join(
    ""
  );
  if (otp.length === length) {
    return otp;
  }
  return generateSecureNumericOTP(length);
}

export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res.status(401).json({
        success: false,
        msg: `User does not exist with the email ${email}`,
      });
    }

    const isMatch = await userDoc.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid password" });
    }

    if (userDoc.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ success: false, msg: "User is not active" });
    }

    return res
      .status(200)
      .json({ userDoc, success: true, msg: "Logged in successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message, success: false });
  }
});

export const forgetPassword = asyncHandler(async (req, res) => {
  try {
    const { userId, password } = req.body;
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, msg: `User Id Not Found ${userId}` });
    }
    userDoc.password = password;
    await userDoc.save();
    return res
      .status(200)
      .json({ success: true, msg: "Password Updated Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message, success: false });
  }
});

export const generateOtpAdminEmail = asyncHandler(async (req, res) => {
  try {
    const email = req.params.email;
    let userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        msg: "User not found for the provided Email Id.",
      });
    }
    const otp = generateSecureNumericOTP(4);
    userDoc.otp = otp;
    await userDoc.save();
    await sendEmail(
      email,
      "Password Reset",
      `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="text-align: center; color: #4CAF50;">Password Reset Request</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Hello,
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Use the OTP below to reset it. :
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 18px; background-color: #f7f7f7; padding: 10px 20px; border-radius: 5px; border: 1px solid #ccc;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">
            If you did not request a password reset, please ignore this email or contact support if you have questions.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you,<br/>The Edmentor Team
          </p>
        </div>
      `
    );

    return res.status(200).json({
      success: true,
      userDoc,
      msg: "OTP Sent Successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  try {
    const { otp, userId } = req.body;
    const userDoc = await User.findOne({
      _id: userId,
    });

    if (!userDoc) {
      console.log("Invalid user id or OTP has expired: " + userId);
      return res.status(400).json({
        success: false,
        msg: "Invalid user id or OTP has expired",
      });
    }

    if (otp != userDoc.otp) {
      console.log("Invalid OTP: " + otp);
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP: " + otp,
      });
    }

    return res.status(200).json({
      success: true,
      userDoc,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        msg: `Invalid status value. Allowed values are "ACTIVE" or "INACTIVE".`,
        success: false,
      });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res
        .status(404)
        .json({ msg: `User ID Not found ${userId}`, success: false });
    }

    await User.updateOne(
      { _id: userId },
      {
        status: status,
      }
    );

    return res.status(200).json({ msg: "User status updated", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  try {
    const { userId, username, email, phone, role } = req.body;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        msg: "Email Id not found",
      });
    }

    const userDoc = await User.updateOne(
      { _id: userId },
      {
        username,
        email,
        phone,
        role,
      }
    );

    return res
      .status(200)
      .json({ success: true, msg: "User updated successfully", userDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const userDoc = await User.find({});
    return res.status(200).json({ success: true, userDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: true, error });
  }
});

export const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;

    const userDoc = await User.findById(userId);

    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, msg: "User id not found: ", userId });
    }

    return res.status(200).json({ success: true, userDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});
