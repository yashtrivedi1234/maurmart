import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
    profilePic: { type: String, default: "" },
    profilePic_public_id: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    pincode: { type: String, default: "" },
    googleId: { type: String, default: null },
    hasPasswordSet: { type: Boolean, default: false }, // Track if user has set a real password
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);