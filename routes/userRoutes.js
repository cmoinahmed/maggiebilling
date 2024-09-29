import express from "express";
import {
  addUser,
  forgetPassword,
  generateOtpAdminEmail,
  login,
  updateUserStatus,
  verifyEmailOtp,
} from "../controller/userController.js";

const userRouter = express.Router();

userRouter.route("/login").post(login);
userRouter.route("/forgetPassword").post(forgetPassword);
userRouter.route("/sendOtp/:email").post(generateOtpAdminEmail);
userRouter.route("/verifyOtp").post(verifyEmailOtp);
userRouter.route("/updateStatus").post(updateUserStatus);
userRouter.route("/add").post(addUser);
export default userRouter;
