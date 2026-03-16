import { Newsletter } from "../models/newsletter.model.js";

export const getNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(newsletters);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch newsletters", error: error.message });
  }
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: "Email is already subscribed" });
    }

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res.status(201).json({ message: "Successfully subscribed to newsletter!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to subscribe to newsletter", error: error.message });
  }
};
