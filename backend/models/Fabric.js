const mongoose = require("mongoose");

const fabricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["sofa", "curtain", "bedsheet", "pillow", "chair"],
    required: true
  },
  color: { type: String, required: true },
  texture: { type: String, required: true },
  stock: { type: Boolean, default: true },
  imageUrl: { type: String },
  publicId: { type: String }   // ✅ Added this line
}, { timestamps: true });

module.exports = mongoose.model("Fabric", fabricSchema);