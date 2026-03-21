import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Phone number must be 10 digits and start with 6 to 9"],
    },
    subject: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "replied", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

export const Contact = mongoose.model("Contact", contactSchema);
