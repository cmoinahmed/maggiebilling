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

const SALT_ROUNDS = 10;

userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) {
    return next();
  }

  // Check if the password is already hashed (hashed passwords usually start with $2a$ or $2b$)
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return next(); // Skip re-hashing if it's already hashed
  }

  console.log("Password before hashing: ", this.password);
  const salt = await bcrypt.genSalt(SALT_ROUNDS); // Use a constant for salt rounds
  this.password = await bcrypt.hash(this.password, salt);
  console.log("Password after hashing: ", this.password);

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log(`Entered Password: ${enteredPassword}`);
  console.log(`Stored Password: ${this.password}`);
  console.log(`Password Match: ${isMatch}`);
  return isMatch;
};
const User = mongoose.model("users", userSchema);

export default User;
