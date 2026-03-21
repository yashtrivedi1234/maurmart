import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      name: {
        type: String,
        required: true,
        trim: true,
        match: [/^[A-Za-z ]+$/, "Name should contain only letters and spaces"],
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, "Phone number must be 10 digits and start with 6 to 9"],
      },
      address: { type: String, required: true, trim: true, minlength: 10 },
      city: {
        type: String,
        required: true,
        trim: true,
        match: [/^[A-Za-z ]+$/, "City should contain only letters and spaces"],
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{6}$/, "Pincode must be 6 digits"],
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Online Payment", "UPI", "Card"], // No COD as per user request
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Processing",
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    },
    razorpay_payment_id: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
