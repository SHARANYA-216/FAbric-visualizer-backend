const express = require("express");
const router = express.Router();
const Fabric = require("../models/Fabric");

const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });


// ➤ Add Fabric (With Image Upload)
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    let publicId = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const fabric = new Fabric({
      name: req.body.name,
      category: req.body.category,
      color: req.body.color,
      texture: req.body.texture,
      stock: req.body.stock ?? true,
      imageUrl,
      publicId
    });

    await fabric.save();
    res.status(201).json(fabric);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// ➤ Get All Fabrics (With Pagination + Filtering)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 5, category, color, stock } = req.query;

    const query = {};

    if (category) query.category = category;
    if (color) query.color = color;
    if (stock !== undefined) query.stock = stock === "true";

    const fabrics = await Fabric.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Fabric.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      fabrics
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ➤ Delete Fabric (Also Remove Image From Cloudinary)
router.delete("/:id", async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    // Delete image from Cloudinary
    if (fabric.publicId) {
      await cloudinary.uploader.destroy(fabric.publicId);
    }

    await Fabric.findByIdAndDelete(req.params.id);

    res.json({ message: "Fabric and image deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;