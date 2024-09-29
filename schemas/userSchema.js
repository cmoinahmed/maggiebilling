import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const reqString = {
  type: String,
  required: true,
};

const userSchema = new mongoose.Schema({
  username: reqString,
  password: reqString,
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
  },
  otp: { type: Number },
  role: {
    type: String,
    enum: ["ADMIN", "STAFF"],
    default: "STAFF",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateModified: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  this.dateModified = new Date();
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("users", userSchema);

export default User;
