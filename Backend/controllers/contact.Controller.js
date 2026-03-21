import { Contact } from "../models/contact.model.js";
import { isValidEmail, isValidName, isValidPhone, normalizeEmail, normalizeWhitespace } from "../utils/validation.js";

export const submitContact = async (req, res) => {
  try {
    const name = normalizeWhitespace(req.body.name);
    const email = normalizeEmail(req.body.email);
    const phone = req.body.phone?.trim();
    const subject = normalizeWhitespace(req.body.subject || "");
    const message = normalizeWhitespace(req.body.message);

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "Name, email, phone, and message are required" });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ message: "Name should contain only letters and spaces" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit mobile number starting with 6 to 9" });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();
    res.status(201).json({ message: "Message received successfully!", contact: newContact });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit contact message", error: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contacts", error: error.message });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "replied", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Status updated", contact });
  } catch (error) {
    res.status(500).json({ message: "Failed to update contact status", error: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete contact", error: error.message });
  }
};
