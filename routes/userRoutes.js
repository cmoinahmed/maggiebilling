import express from "express";
import {
  addUser,
  forgetPassword,
  generateOtpAdminEmail,
  getAllUsers,
  getUserById,
  login,
  updateUser,
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
userRouter.route("/updateUser").put(updateUser);
userRouter.route("/getAll").get(getAllUsers);
userRouter.route("/getUserById/:userId").get(getUserById);
export default userRouter;
