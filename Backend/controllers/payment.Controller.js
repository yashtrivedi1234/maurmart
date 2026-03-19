import Razorpay from "razorpay";
import crypto from "crypto";

let razorpay;

const initializeRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;
  
  // Razorpay expects amount in paise (1 INR = 100 paise)
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const razorpayInstance = initializeRazorpay();
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    res.status(500).json({ message: "Unable to create Razorpay order", error: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    res.status(200).json({ message: "Payment verified successfully", success: true });
  } else {
    res.status(400).json({ message: "Invalid signature sent!", success: false });
  }
};
