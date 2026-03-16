import { Brand } from "../models/brand.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

/* ─── GET ALL BRANDS ─── */
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).lean();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
};

/* ─── CREATE BRAND ─── */
export const createBrand = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Brand image upload is required",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, "brands");

    if (!result?.url || !result?.public_id) {
      return res.status(500).json({
        message: "Failed to upload brand image to Cloudinary",
      });
    }

    const brand = new Brand({
      image: result.url,
      image_public_id: result.public_id,
    });

    const createdBrand = await brand.save();
    res.status(201).json(createdBrand);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create brand",
      error: error.message,
    });
  }
};

/* ─── DELETE BRAND ─── */
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    if (brand.image_public_id) {
      await deleteFromCloudinary(brand.image_public_id);
    }

    await Brand.findByIdAndDelete(id);
    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete brand",
      error: error.message,
    });
  }
};
