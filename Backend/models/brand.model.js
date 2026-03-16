import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    image_public_id: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);
