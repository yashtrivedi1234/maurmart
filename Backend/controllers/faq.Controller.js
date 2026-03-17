import { FAQ } from "../models/faq.model.js";

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ category: 1, createdAt: 1 }).lean();
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQs", error: error.message });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { category, question, answer } = req.body;

    if (!category || !question || !answer) {
      return res.status(400).json({ message: "Category, question, and answer are required" });
    }

    const newFAQ = new FAQ({
      category,
      question,
      answer,
    });

    await newFAQ.save();
    res.status(201).json({ message: "FAQ created successfully", faq: newFAQ });
  } catch (error) {
    res.status(500).json({ message: "Failed to create FAQ", error: error.message });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answer } = req.body;

    if (!category || !question || !answer) {
      return res.status(400).json({ message: "Category, question, and answer are required" });
    }

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { category, question, answer },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ message: "FAQ updated successfully", faq });
  } catch (error) {
    res.status(500).json({ message: "Failed to update FAQ", error: error.message });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete FAQ", error: error.message });
  }
};
