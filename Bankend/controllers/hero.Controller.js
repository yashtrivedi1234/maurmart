import { HeroSlide } from "../models/hero.model.js";

// @desc    Get all hero slides
// @route   GET /api/heroes
// @access  Public
export const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({});
    // If empty, return a default slide so the frontend doesn't break
    if (slides.length === 0) {
        return res.json([{
            _id: "default-1",
            image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80",
            badge: "🚀 Welcome to Maurya Mart",
            heading: "Your Daily Essentials,",
            highlight: "Delivered Fast",
            sub: "Shop the best quality products at unbeatable prices."
        }]);
    }
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a hero slide
// @route   POST /api/heroes
// @access  Private/Admin
export const createHeroSlide = async (req, res) => {
  try {
    const { image, badge, heading, highlight, sub } = req.body;
    
    const slide = new HeroSlide({
      image,
      badge,
      heading,
      highlight,
      sub,
    });

    const createdSlide = await slide.save();
    res.status(201).json(createdSlide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a hero slide
// @route   DELETE /api/heroes/:id
// @access  Private/Admin
export const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (slide) {
      await slide.deleteOne();
      res.json({ message: "Slide removed" });
    } else {
      res.status(404).json({ message: "Slide not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
